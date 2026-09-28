import { Player, PlayerRound } from "@/lib/db";
import { TOTAL_QUESTIONS } from "@/lib/data/questions";
import { fail, loadPlayer, notify } from "@/lib/server";

// Nút "Tiếp tục": chỉ sang câu sau khi câu hiện tại đã chấm.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const ctx = await loadPlayer(body.code);
  if (ctx instanceof Response) return ctx;
  const { code, room, player } = ctx;

  const done = await PlayerRound.exists({
    roomId: room._id,
    playerId: player._id,
    questionNumber: player.current,
    isCorrect: { $ne: null },
  });
  if (!done) return fail("Bạn chưa trả lời câu này", 409);
  // Guard theo current → bấm dồn không nhảy 2 câu.
  const last = player.current >= TOTAL_QUESTIONS;
  await Player.updateOne(
    { _id: player._id, current: player.current },
    { $inc: { current: 1 }, ...(last && { finishedAt: new Date() }) },
  );
  await notify(`host-${code}`, "progress.changed");
  return Response.json({ ok: true });
}
