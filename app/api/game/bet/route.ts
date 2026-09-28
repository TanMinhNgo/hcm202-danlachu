import { PlayerRound } from "@/lib/db";
import { getQuestion } from "@/lib/data/questions";
import { isValidBet } from "@/lib/game/rules";
import { fail, loadPlayer, notify } from "@/lib/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const ctx = await loadPlayer(body.code);
  if (ctx instanceof Response) return ctx;
  const { code, room, player } = ctx;

  if (room.status !== "BETTING") return fail("Chưa mở / đã đóng cược", 409);
  const q = getQuestion(room.currentQuestion);
  if (!isValidBet(body.bet, q.isFinalRound, player.score)) return fail("Mức cược không hợp lệ");

  try {
    // Unique (room, player, question) → cược một lần, khoá luôn.
    await PlayerRound.create({
      roomId: room._id,
      playerId: player._id,
      questionNumber: room.currentQuestion,
      bet: body.bet,
      betSubmittedAt: new Date(),
    });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return fail("Bạn đã khoá cược cho câu này", 409);
    throw e;
  }
  await notify(`host-${code}`, "round.updated");
  return Response.json({ ok: true });
}
