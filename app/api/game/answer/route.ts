import { PlayerRound } from "@/lib/db";
import { fail, loadPlayer, notify } from "@/lib/server";

const GRACE_MS = 1500; // bù độ trễ mạng

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const ctx = await loadPlayer(body.code);
  if (ctx instanceof Response) return ctx;
  const { code, room, player } = ctx;

  if (!["A", "B", "C", "D"].includes(body.answer)) return fail("Đáp án không hợp lệ");
  const now = new Date();
  if (room.status !== "QUESTION" || !room.answerDeadlineAt || now.getTime() > room.answerDeadlineAt.getTime() + GRACE_MS)
    return fail("Đã hết giờ trả lời", 409);

  // Guarded update: chỉ ghi khi đã cược và chưa trả lời → chặn nộp trùng.
  const round = await PlayerRound.findOneAndUpdate(
    { roomId: room._id, playerId: player._id, questionNumber: room.currentQuestion, bet: { $ne: null }, answer: null },
    { answer: body.answer, answerSubmittedAt: now, responseTimeMs: now.getTime() - (room.questionStartedAt?.getTime() ?? now.getTime()) },
  );
  if (!round) return fail("Bạn chưa cược hoặc đã trả lời câu này", 409);

  await notify(`host-${code}`, "round.updated");
  return Response.json({ ok: true }); // không trả đúng/sai trước REVEAL
}
