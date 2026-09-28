// Luật mini game — logic thuần, chỉ chạy trên server. Kiểm tra: `node lib/game/rules.test.ts`.

export const START_SCORE = 100;
export const ANSWER_SECONDS = 15;
export const NORMAL_BETS = [10, 20, 30];
export const FINAL_BETS = [0, 10, 20, 30, 40, 50];
export const STARS = 2; // số lần dùng Ngôi sao hi vọng mỗi người

// Mỗi người tự chơi theo nhịp riêng; host chỉ mở game rồi theo dõi.
export type RoomStatus = "LOBBY" | "PLAYING";

export function allowedBets(isFinal: boolean, score: number): number[] {
  return isFinal ? FINAL_BETS.filter((b) => b <= score) : NORMAL_BETS;
}

export function isValidBet(bet: unknown, isFinal: boolean, score: number): bet is number {
  return typeof bet === "number" && allowedBets(isFinal, score).includes(bet);
}

/** Đúng: cộng mức điểm đã chọn. Sai: trừ một nửa. Ngôi sao hi vọng nhân đôi mức cộng/trừ. */
export const scoreChange = (isCorrect: boolean, bet: number, star = false) =>
  star ? (isCorrect ? 2 * bet : -2 * bet) : isCorrect ? bet : -Math.ceil(bet / 2);
export const applyScore = (score: number, change: number) => Math.max(0, score + change);

/** Xếp hạng: điểm giảm dần → tổng thời gian trả lời tăng dần → nickname. Hạng = vị trí (1-based). */
export function rank<T extends { score: number; timeMs: number; nickname: string }>(players: T[]): (T & { rank: number })[] {
  return [...players]
    .sort((a, b) => b.score - a.score || a.timeMs - b.timeMs || a.nickname.localeCompare(b.nickname))
    .map((p, i) => ({ ...p, rank: i + 1 }));
}
