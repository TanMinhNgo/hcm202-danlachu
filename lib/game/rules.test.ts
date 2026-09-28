import assert from "node:assert/strict";
import { allowedBets, applyScore, isValidBet, rank, scoreChange } from "./rules.ts";

assert.equal(applyScore(100, scoreChange(true, 20)), 120);
assert.equal(scoreChange(false, 20), -10); // sai: trừ nửa cược
assert.equal(scoreChange(true, 30, true), 60); // ngôi sao: đúng x2
assert.equal(scoreChange(false, 30, true), -60); // ngôi sao: sai trừ x2
assert.equal(applyScore(10, scoreChange(false, 30, true)), 0); // không âm

assert.ok(isValidBet(30, false, 0)); // vòng thường: 10/20/30 bất kể điểm
assert.ok(!isValidBet(25, false, 100));
assert.deepEqual(allowedBets(true, 35), [0, 10, 20, 30]); // final: ≤ min(50, điểm)
assert.ok(!isValidBet(50, true, 40));
assert.ok(isValidBet(0, true, 0));

assert.deepEqual(
  rank([
    { nickname: "b", score: 90, timeMs: 50_000 },
    { nickname: "a", score: 90, timeMs: 80_000 },
    { nickname: "d", score: 90, timeMs: 50_000 },
    { nickname: "c", score: 120, timeMs: 99_000 },
  ]).map((p) => p.nickname),
  ["c", "b", "d", "a"], // cao điểm trước, bằng điểm thì ai nhanh hơn đứng trên
);
console.log("rules ok");
