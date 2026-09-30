import { Player, PlayerRound } from "@/lib/db";
import { getQuestion } from "@/lib/data/questions";
import { ANSWER_SECONDS, scoreChange } from "@/lib/game/rules";
import { fail, loadPlayer, notify } from "@/lib/server";

const LIMIT_MS = ANSWER_SECONDS * 1000;
const GRACE_MS = 1500; // bù độ trễ mạng

// Trả lời (answer=null khi hết giờ) → chấm điểm ngay cho riêng người này.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const ctx = await loadPlayer(body.code);
  if (ctx instanceof Response) return ctx;
  const { code, room, player } = ctx;
  if (body.answer !== null && !["A", "B", "C", "D"].includes(body.answer)) return fail("Đáp án không hợp lệ");

  const round = await PlayerRound.findOne({ roomId: room._id, playerId: player._id, questionNumber: player.current }).lean();
  if (!round) return fail("Bạn chưa chọn mức điểm cho câu này", 409);
  if (round.isCorrect !== null) return fail("Bạn đã trả lời câu này", 409);

  const elapsed = Date.now() - round.shownAt.getTime();
  const answer = elapsed <= LIMIT_MS + GRACE_MS ? body.answer : null; // trả lời trễ = hết giờ
  const q = getQuestion(String(room._id), player.current);
  const isCorrect = answer === q.correctAnswer;
  const change = scoreChange(isCorrect, round.bet!, round.star);
  const responseTimeMs = answer ? Math.min(elapsed, LIMIT_MS) : LIMIT_MS;

  // Claim bản ghi (isCorrect: null) → mỗi câu chỉ chấm đúng 1 lần dù bấm dồn.
  // ponytail: không dùng transaction; nếu server chết giữa 2 lệnh, round đã chấm mà điểm chưa cộng. Dùng session.withTransaction nếu cần.
  const claim = await PlayerRound.updateOne(
    { _id: round._id, isCorrect: null },
    { answer, isCorrect, scoreChange: change, responseTimeMs },
  );
  if (claim.modifiedCount !== 1) return fail("Bạn đã trả lời câu này", 409);
  await Player.updateOne(
    { _id: player._id },
    [{ $set: { score: { $max: [0, { $add: ["$score", change] }] }, timeMs: { $add: ["$timeMs", responseTimeMs] } } }],
    { updatePipeline: true },
  );
  notify(`host-${code}`, "leaderboard.changed");
  // Trả luôn kết quả để client hiện ngay, khỏi chờ refetch (hạng cập nhật ở lần refetch nền).
  return Response.json({
    ok: true,
    me: {
      phase: "RESULT",
      score: Math.max(0, player.score + change),
      timeMs: player.timeMs + responseTimeMs,
      question: { orderNumber: q.orderNumber, category: q.category, isFinalRound: q.isFinalRound, question: q.question, options: q.options },
      bet: round.bet,
      star: round.star,
      answer,
      isCorrect,
      scoreChange: change,
      reveal: { correctAnswer: q.correctAnswer, explanation: q.explanation, source: q.source, knowledgeSection: q.knowledgeSection },
    },
  });
}
