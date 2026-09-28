import assert from "node:assert/strict";
import { allowedBets, applyScore, isValidBet, rank, scoreChange, transition } from "./rules.ts";

assert.equal(applyScore(100, scoreChange(true, 20)), 120);
assert.equal(applyScore(10, scoreChange(false, 30)), 0); // không âm

assert.ok(isValidBet(30, false, 0)); // vòng thường: 10/20/30 bất kể điểm
assert.ok(!isValidBet(25, false, 100));
assert.deepEqual(allowedBets(true, 35), [0, 10, 20, 30]); // final: ≤ min(50, điểm)
assert.ok(!isValidBet(50, true, 40));
assert.ok(isValidBet(0, true, 0));

assert.equal(transition("start", "LOBBY", 0, 15)?.to, "BETTING");
assert.equal(transition("start", "BETTING", 1, 15), null);
assert.equal(transition("reveal", "ANSWER_LOCKED", 3, 15)?.to, "REVEAL");
assert.equal(transition("reveal", "REVEAL", 3, 15), null); // không chấm điểm 2 lần
assert.equal(transition("next", "LEADERBOARD", 14, 15)?.to, "BETTING");
assert.equal(transition("next", "REVEAL", 15, 15)?.to, "FINISHED");
assert.equal(transition("end", "FINISHED", 15, 15), null);

assert.deepEqual(
  rank([{ nickname: "b", score: 90 }, { nickname: "a", score: 90 }, { nickname: "c", score: 120 }]).map((p) => p.nickname),
  ["c", "a", "b"],
);
console.log("rules ok");
