import { readFileSync } from "node:fs";
import { join } from "node:path";

export type Point = { depth: number; marker: string; text: string };
export type Topic = { id: string; title: string; points: Point[] };
export type Chapter = { id: string; title: string; topics: Topic[] };

const chapterIds = ["dan-chu", "phap-quyen", "trong-sach"];
const topicIds = [
  "ban-chat", "cua-dan", "do-dan", "vi-dan",
  "hop-hien", "thuong-ton", "nhan-nghia",
  "kiem-soat", "tieu-cuc",
];

const withoutReferences = (text: string) => text.replace(/\[\d+\]/g, "");

function plain(text: string) {
  return withoutReferences(text)
    .replace(/\*\*/g, "")
    .replace(/\\([.])/g, "$1")
    .trim();
}

export function getDocument(): Chapter[] {
  const source = readFileSync(join(process.cwd(), "content", "tu-tuong-ho-chi-minh-nha-nuoc-nhan-dan.md"), "utf8");
  const chapters: Chapter[] = [];
  let currentChapter: Chapter | undefined;
  let currentTopic: Topic | undefined;
  let topicIndex = 0;

  for (const line of source.split(/\r?\n/)) {
    if (line.startsWith("#### ")) {
      currentChapter = { id: chapterIds[chapters.length], title: plain(line.slice(5)), topics: [] };
      chapters.push(currentChapter);
      currentTopic = undefined;
      continue;
    }
    if (line.startsWith("##### ") && currentChapter) {
      currentTopic = { id: topicIds[topicIndex++], title: plain(line.slice(6)), points: [] };
      currentChapter.topics.push(currentTopic);
      continue;
    }
    const match = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (match && currentTopic) {
      currentTopic.points.push({
        depth: Math.floor(match[1].length / 2),
        marker: match[2] === "-" || match[2] === "*" ? "•" : match[2],
        text: withoutReferences(match[3]).trim(),
      });
    }
  }
  return chapters;
}
