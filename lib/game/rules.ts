// Luật Risk & Reward — logic thuần, chỉ chạy trên server. Kiểm tra: `node lib/game/rules.test.ts`.

export const START_SCORE = 100;
export const ANSWER_SECONDS = 15;
export const NORMAL_BETS = [10, 20, 30];
export const FINAL_BETS = [0, 10, 20, 30, 40, 50];

export type RoomStatus = "LOBBY" | "BETTING" | "QUESTION" | "ANSWER_LOCKED" | "REVEAL" | "LEADERBOARD" | "FINISHED";
export type HostAction = "start" | "showQuestion" | "lock" | "reveal" | "leaderboard" | "next" | "end";

export function allowedBets(isFinal: boolean, score: number): number[] {
  return isFinal ? FINAL_BETS.filter((b) => b <= score) : NORMAL_BETS;
}

export function isValidBet(bet: unknown, isFinal: boolean, score: number): bet is number {
  return typeof bet === "number" && allowedBets(isFinal, score).includes(bet);
}

export const scoreChange = (isCorrect: boolean, bet: number) => (isCorrect ? bet : -bet);
export const applyScore = (score: number, change: number) => Math.max(0, score + change);

// Trạng thái hiện tại → những trạng thái hợp lệ mà mỗi action đưa tới.
const TRANSITIONS: Record<Exclude<HostAction, "next" | "end">, [RoomStatus[], RoomStatus]> = {
  start: [["LOBBY"], "BETTING"],
  showQuestion: [["BETTING"], "QUESTION"],
  lock: [["QUESTION"], "ANSWER_LOCKED"],
  reveal: [["QUESTION", "ANSWER_LOCKED"], "REVEAL"],
  leaderboard: [["REVEAL"], "LEADERBOARD"],
};

/** Trả về { from, to } nếu action hợp lệ ở trạng thái `status`, ngược lại null. */
export function transition(
  action: HostAction,
  status: RoomStatus,
  currentQuestion: number,
  total: number,
): { from: RoomStatus[]; to: RoomStatus } | null {
  if (action === "end") return status === "FINISHED" ? null : { from: [status], to: "FINISHED" };
  if (action === "next") {
    if (status !== "REVEAL" && status !== "LEADERBOARD") return null;
    return { from: ["REVEAL", "LEADERBOARD"], to: currentQuestion >= total ? "FINISHED" : "BETTING" };
  }
  const [from, to] = TRANSITIONS[action];
  return from.includes(status) ? { from, to } : null;
}

/** Xếp hạng: điểm giảm dần, hoà điểm thì theo nickname. Hạng = vị trí (1-based). */
export function rank<T extends { score: number; nickname: string }>(players: T[]): (T & { rank: number })[] {
  return [...players]
    .sort((a, b) => b.score - a.score || a.nickname.localeCompare(b.nickname))
    .map((p, i) => ({ ...p, rank: i + 1 }));
}
