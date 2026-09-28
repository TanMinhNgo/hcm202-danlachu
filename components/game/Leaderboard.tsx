import Link from "next/link";
import { useState } from "react";
import type { OptionKey } from "@/lib/data/questions";
import { formatTime, type LeaderRow, type QuestionView } from "./useRoom";
import styles from "./arena.module.css";

export function Leaderboard({ rows, meId, limit, total }: { rows: LeaderRow[]; meId?: string; limit?: number; total: number }) {
  const shown = limit ? rows.slice(0, limit) : rows;
  if (!rows.length) return <p className={styles.empty}>Chưa có người chơi.</p>;
  return (
    <ol className={styles.leaderboard}>
      {shown.map((row) => (
        <li key={row.id} className={`${styles.leaderRow} ${row.id === meId ? styles.leaderSelf : ""}`}>
          <span className={styles.leaderRank}>{String(row.rank).padStart(2, "0")}</span>
          <span className={styles.leaderName}>{row.nickname}</span>
          <span className={styles.leaderSub}>{row.answered >= total ? "Hoàn tất" : `${row.answered}/${total} câu`}</span>
          <span className={styles.leaderSub}>{formatTime(row.timeMs)}</span>
          <span className={styles.leaderScore}>{row.score}</span>
        </li>
      ))}
    </ol>
  );
}

/** Người đã làm xong, theo thứ tự hoàn thành — chưa lộ điểm để giữ hồi hộp. */
export function FinishedList({ rows }: { rows: LeaderRow[] }) {
  const done = rows.filter((row) => row.finishedAt).sort((a, b) => a.finishedAt! - b.finishedAt!);
  if (!done.length) return <p className={styles.empty}>Chưa có ai hoàn thành. Cuộc đua vẫn đang tiếp diễn.</p>;
  return (
    <ol className={styles.finishedList}>
      {done.map((row, index) => <li key={row.id}>{String(index + 1).padStart(2, "0")} · {row.nickname}</li>)}
    </ol>
  );
}

/** Nút bấm mới hiện Top 3 + bảng xếp hạng đầy đủ. */
export function RankingReveal({ rows, total, meId }: { rows: LeaderRow[]; total: number; meId?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(!open)} aria-expanded={open} className={`${styles.buttonSecondary} ${styles.rankButton}`}>
        {open ? "Ẩn bảng xếp hạng" : "Mở bảng xếp hạng"}
      </button>
      {open && <><Podium rows={rows} /><Leaderboard rows={rows} total={total} meId={meId} /></>}
    </div>
  );
}

const PODIUM = [
  { place: 2, className: "podiumSecond" },
  { place: 1, className: "podiumFirst" },
  { place: 3, className: "podiumThird" },
] as const;

export function Podium({ rows }: { rows: LeaderRow[] }) {
  return (
    <div className={styles.podium}>
      {PODIUM.map(({ place, className }) => {
        const person = rows[place - 1];
        return (
          <div key={place} className={styles.podiumEntry}>
            <span>{person?.nickname ?? "—"}</span>
            <small>{person ? `${person.score} điểm · ${formatTime(person.timeMs)}` : ""}</small>
            <div className={`${styles.podiumStep} ${styles[className]}`}>{place}</div>
          </div>
        );
      })}
    </div>
  );
}

type Reveal = { correctAnswer: OptionKey; explanation: string; source: string; knowledgeSection: string };

export function AnswerReveal({ reveal, question }: { reveal: Reveal; question: QuestionView }) {
  const correct = question.options?.find((option) => option.key === reveal.correctAnswer);
  return (
    <div className={styles.revealPanel}>
      <h3>ĐÁP ÁN ĐÚNG · {reveal.correctAnswer}</h3>
      <strong>{correct?.text}</strong>
      <p><b>Giải thích:</b> {reveal.explanation}</p>
      <p><b>Nguồn:</b> {reveal.source}</p>
      <Link href={`/knowledge#${reveal.knowledgeSection}`} target="_blank" rel="noopener noreferrer">Đọc lại phần kiến thức ↗</Link>
    </div>
  );
}
