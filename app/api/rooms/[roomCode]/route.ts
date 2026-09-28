import { connectDB, Player, PlayerRound, Room } from "@/lib/db";
import { getQuestion, TOTAL_QUESTIONS } from "@/lib/data/questions";
import { allowedBets, rank } from "@/lib/game/rules";
import { fail, hostCookie, normCode, playerCookie, sessionHash } from "@/lib/server";

const QUESTION_VISIBLE = ["QUESTION", "ANSWER_LOCKED", "REVEAL", "LEADERBOARD", "FINISHED"];
const ANSWER_VISIBLE = ["REVEAL", "LEADERBOARD", "FINISHED"];

// Trạng thái phòng — nguồn sự thật duy nhất cho client. Đáp án chỉ trả về từ REVEAL trở đi.
export async function GET(_req: Request, ctx: RouteContext<"/api/rooms/[roomCode]">) {
  const code = normCode((await ctx.params).roomCode);
  await connectDB();
  const room = await Room.findOne({ code }).lean();
  if (!room) return fail("Không tìm thấy phòng", 404);

  const [hostHash, playerHash] = await Promise.all([sessionHash(hostCookie(code)), sessionHash(playerCookie(code))]);
  const isHost = hostHash === room.hostSessionHash;
  const n = room.currentQuestion;
  const q = n ? getQuestion(String(room._id), n) : null;

  const [players, rounds] = await Promise.all([
    Player.find({ roomId: room._id }).lean(),
    n ? PlayerRound.find({ roomId: room._id, questionNumber: n }).lean() : [],
  ]);
  const ranked = rank(players.filter((p) => !p.isSpectator));
  const meDoc = playerHash ? players.find((p) => p.sessionHash === playerHash) : undefined;
  const myRound = meDoc && rounds.find((r) => r.playerId.equals(meDoc._id));
  const revealed = ANSWER_VISIBLE.includes(room.status);

  return Response.json({
    serverNow: Date.now(),
    code,
    status: room.status,
    currentQuestion: n,
    total: TOTAL_QUESTIONS,
    answerDeadlineAt: room.answerDeadlineAt?.getTime() ?? null,
    isHost,
    question: q && {
      orderNumber: q.orderNumber,
      category: q.category,
      isFinalRound: q.isFinalRound,
      ...(QUESTION_VISIBLE.includes(room.status) && { question: q.question, options: q.options }),
    },
    reveal: q && revealed
      ? { correctAnswer: q.correctAnswer, explanation: q.explanation, source: q.source, knowledgeSection: q.knowledgeSection }
      : null,
    counts: {
      players: ranked.length,
      spectators: players.length - ranked.length,
      bets: rounds.filter((r) => r.bet !== null).length,
      answers: rounds.filter((r) => r.answer !== null).length,
    },
    leaderboard: ranked.map((p) => ({
      id: String(p._id),
      nickname: p.nickname,
      score: p.score,
      rank: p.rank,
      change: p.previousRank ? p.previousRank - p.rank : 0,
    })),
    me: meDoc && {
      id: String(meDoc._id),
      nickname: meDoc.nickname,
      score: meDoc.score,
      isSpectator: meDoc.isSpectator,
      rank: ranked.find((p) => p._id.equals(meDoc._id))?.rank ?? null,
      allowedBets: q ? allowedBets(q.isFinalRound, meDoc.score) : [],
      bet: myRound?.bet ?? null,
      answer: myRound?.answer ?? null,
      // isCorrect / scoreChange chỉ lộ ra sau REVEAL
      isCorrect: revealed ? (myRound?.isCorrect ?? null) : null,
      scoreChange: revealed ? (myRound?.scoreChange ?? null) : null,
    },
  });
}
