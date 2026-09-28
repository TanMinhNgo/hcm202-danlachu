import type { Types } from "mongoose";
import { connectDB, Player, PlayerRound, Room } from "@/lib/db";
import { getQuestion, TOTAL_QUESTIONS } from "@/lib/data/questions";
import { ANSWER_SECONDS, allowedBets, rank } from "@/lib/game/rules";
import { fail, hostCookie, normCode, playerCookie, sessionHash } from "@/lib/server";

// Trạng thái phòng + tiến độ riêng của người đang xem. Đáp án chỉ lộ khi chính người đó đã trả lời.
export async function GET(_req: Request, ctx: RouteContext<"/api/rooms/[roomCode]">) {
  const code = normCode((await ctx.params).roomCode);
  await connectDB();
  const room = await Room.findOne({ code }).lean();
  if (!room) return fail("Không tìm thấy phòng", 404);

  const [hostHash, playerHash] = await Promise.all([sessionHash(hostCookie(code)), sessionHash(playerCookie(code))]);
  const players = await Player.find({ roomId: room._id }).lean();
  const ranked = rank(players);
  const meDoc = playerHash ? players.find((p) => p.sessionHash === playerHash) : undefined;

  return Response.json({
    serverNow: Date.now(),
    code,
    status: room.status,
    total: TOTAL_QUESTIONS,
    isHost: hostHash === room.hostSessionHash,
    counts: { players: players.length, finished: players.filter((p) => p.current > TOTAL_QUESTIONS).length },
    leaderboard: ranked.map((p) => ({
      id: String(p._id),
      nickname: p.nickname,
      score: p.score,
      rank: p.rank,
      timeMs: p.timeMs,
      answered: Math.min(p.current - 1, TOTAL_QUESTIONS),
      finishedAt: p.finishedAt?.getTime() ?? null,
    })),
    me: meDoc && (await myView(String(room._id), meDoc, ranked.find((p) => p._id.equals(meDoc._id))!.rank)),
  });
}

type PlayerDoc = { _id: Types.ObjectId; nickname: string; score: number; starsLeft: number; current: number; timeMs: number };

async function myView(roomId: string, me: PlayerDoc, myRank: number) {
  const base = { id: String(me._id), nickname: me.nickname, score: me.score, rank: myRank, starsLeft: me.starsLeft, timeMs: me.timeMs };
  if (me.current > TOTAL_QUESTIONS) return { ...base, phase: "DONE" as const };

  const q = getQuestion(roomId, me.current);
  const round = await PlayerRound.findOne({ roomId, playerId: me._id, questionNumber: me.current }).lean();
  const question = { orderNumber: q.orderNumber, category: q.category, isFinalRound: q.isFinalRound };
  if (!round) return { ...base, phase: "BET" as const, question, allowedBets: allowedBets(q.isFinalRound, me.score) };

  const picked = { bet: round.bet, star: round.star, answer: round.answer };
  const full = { ...question, question: q.question, options: q.options };
  if (round.isCorrect === null)
    return { ...base, phase: "QUESTION" as const, question: full, ...picked, deadline: round.shownAt.getTime() + ANSWER_SECONDS * 1000 };

  return {
    ...base,
    phase: "RESULT" as const,
    question: full,
    ...picked,
    isCorrect: round.isCorrect,
    scoreChange: round.scoreChange,
    reveal: { correctAnswer: q.correctAnswer, explanation: q.explanation, source: q.source, knowledgeSection: q.knowledgeSection },
  };
}
