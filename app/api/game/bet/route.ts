import { Player, PlayerRound } from "@/lib/db";
import { getQuestion, TOTAL_QUESTIONS } from "@/lib/data/questions";
import { isValidBet } from "@/lib/game/rules";
import { fail, loadPlayer } from "@/lib/server";

// Cược xong → câu hỏi hiện ngay, bắt đầu 15s của riêng người chơi.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const ctx = await loadPlayer(body.code);
  if (ctx instanceof Response) return ctx;
  const { room, player } = ctx;

  if (player.current > TOTAL_QUESTIONS) return fail("Bạn đã hoàn thành tất cả câu hỏi", 409);
  const q = getQuestion(String(room._id), player.current);
  if (!isValidBet(body.bet, q.isFinalRound, player.score)) return fail("Mức cược không hợp lệ");
  const star = body.star === true;
  if (star && body.bet === 0) return fail("Cược 0 thì không dùng Ngôi sao hi vọng");
  // Trừ lượt sao có điều kiện → không dùng quá số lượt dù bấm dồn nhiều request.
  if (star && (await Player.updateOne({ _id: player._id, starsLeft: { $gt: 0 } }, { $inc: { starsLeft: -1 } })).modifiedCount !== 1)
    return fail("Bạn đã hết Ngôi sao hi vọng", 409);

  try {
    // Unique (room, player, question) → cược một lần, khoá luôn.
    await PlayerRound.create({
      roomId: room._id,
      playerId: player._id,
      questionNumber: player.current,
      bet: body.bet,
      star,
      shownAt: new Date(),
    });
  } catch (e) {
    if (star) await Player.updateOne({ _id: player._id }, { $inc: { starsLeft: 1 } }); // hoàn sao khi cược không thành
    if ((e as { code?: number }).code === 11000) return fail("Bạn đã khoá cược cho câu này", 409);
    throw e;
  }
  return Response.json({ ok: true });
}
