// Chạy: npx tsx scripts/check-questions.ts — kiểm tra xáo câu/đáp án không làm sai đáp án.
import assert from "node:assert";
import { QUESTIONS, getQuestion, TOTAL_QUESTIONS } from "../lib/data/questions";

const truth = new Map(QUESTIONS.map((q) => [q.question, q.options.find((o) => o.key === q.correctAnswer)!.text]));
for (const seed of ["a", "b", "665f1c2e9d3a4b0012345678", "xyz"]) {
  const qs = Array.from({ length: TOTAL_QUESTIONS }, (_, i) => getQuestion(seed, i + 1));
  assert.equal(new Set(qs.map((q) => q.question)).size, TOTAL_QUESTIONS);
  assert.ok(qs[TOTAL_QUESTIONS - 1].isFinalRound);
  for (const q of qs) assert.equal(q.options.find((o) => o.key === q.correctAnswer)!.text, truth.get(q.question));
  const count = Object.groupBy(qs, (q) => q.correctAnswer);
  assert.deepEqual(Object.values(count).map((v) => v!.length).sort(), [3, 4, 4, 4]);
  console.log(seed, qs.map((q) => q.correctAnswer).join(""));
}
assert.deepEqual(getQuestion("a", 5), getQuestion("a", 5));
console.log("OK");
