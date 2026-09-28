import type { Types } from "mongoose";
import { connectDB, Player, PlayerRound, Room } from "@/lib/db";
import { getQuestion, TOTAL_QUESTIONS } from "@/lib/data/questions";
import { ANSWER_SECONDS, rank, scoreChange, transition, type HostAction, type RoomStatus } from "@/lib/game/rules";
import { fail, hostCookie, normCode, notify, sessionHash } from "@/lib/server";

const ACTIONS: HostAction[] = ["start", "showQuestion", "lock", "reveal", "leaderboard", "next", "end"];

// Host điều khiển máy trạng thái: validate → cập nhật MongoDB (có guard) → báo Pusher.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = normCode(body.code);
  const action = body.action as HostAction;
  if (!ACTIONS.includes(action)) return fail("Action không hợp lệ");

  await connectDB();
  const room = await Room.findOne({ code }).lean();
  if (!room) return fail("Không tìm thấy phòng", 404);
  if ((await sessionHash(hostCookie(code))) !== room.hostSessionHash) return fail("Chỉ host được điều khiển", 403);

  const t = transition(action, room.status as RoomStatus, room.currentQuestion, TOTAL_QUESTIONS);
  if (!t) return fail(`Không thể "${action}" khi đang ở ${room.status}`, 409);

  const now = new Date();
  const update: Record<string, unknown> = { status: t.to };
  if (t.to === "BETTING") {
    Object.assign(update, { currentQuestion: room.currentQuestion + 1, bettingStartedAt: now, questionStartedAt: null, answerDeadlineAt: null });
  } else if (t.to === "QUESTION") {
    Object.assign(update, { questionStartedAt: now, answerDeadlineAt: new Date(now.getTime() + ANSWER_SECONDS * 1000) });
  }

  // Guard theo status + câu hiện tại: 2 lần bấm đồng thời chỉ 1 lần thắng (không chấm điểm 2 lần).
  const updated = await Room.findOneAndUpdate(
    { _id: room._id, status: { $in: t.from }, currentQuestion: room.currentQuestion },
    update,
  );
  if (!updated) return fail("Trạng thái vừa thay đổi, tải lại", 409);

  if (t.to === "REVEAL") await scoreRound(room._id, room.currentQuestion);
  await notify(`room-${code}`, "room.state.changed", { status: t.to });
  return Response.json({ ok: true, status: t.to });
}

async function scoreRound(roomId: Types.ObjectId, n: number) {
  const q = getQuestion(n);

  // Lưu hạng trước khi chấm để bảng xếp hạng hiện ↑↓.
  const players = await Player.find({ roomId, isSpectator: false }, { nickname: 1, score: 1 }).lean();
  await Player.bulkWrite(
    rank(players).map((p) => ({ updateOne: { filter: { _id: p._id }, update: { previousRank: p.rank } } })),
  );

  // Người cược mà không trả lời (hết giờ) tính là sai.
  const rounds = await PlayerRound.find({ roomId, questionNumber: n, bet: { $ne: null }, isCorrect: null }).lean();
  await Promise.all(
    rounds.map(async (r) => {
      const isCorrect = r.answer === q.correctAnswer;
      const change = scoreChange(isCorrect, r.bet!);
      // Claim bản ghi trước (isCorrect: null) → mỗi round chỉ cộng/trừ điểm đúng 1 lần.
      // ponytail: không dùng transaction; nếu server chết giữa 2 lệnh, round đã claim mà điểm chưa cộng. Dùng session.withTransaction nếu cần.
      const claim = await PlayerRound.updateOne({ _id: r._id, isCorrect: null }, { isCorrect, scoreChange: change });
      if (claim.modifiedCount !== 1) return;
      await Player.updateOne(
        { _id: r.playerId },
        [{ $set: { score: { $max: [0, { $add: ["$score", change] }] } } }],
        { updatePipeline: true },
      );
    }),
  );
}
