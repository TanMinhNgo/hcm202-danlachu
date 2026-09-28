import Link from "next/link";
import { useState } from "react";
import { BookOpen, CheckCircle2 } from "lucide-react";
import type { OptionKey } from "@/lib/data/questions";
import { formatTime, type LeaderRow, type QuestionView } from "./useRoom";

export function Leaderboard({ rows, meId, limit, total }: { rows: LeaderRow[]; meId?: string; limit?: number; total: number }) {
  const shown = limit ? rows.slice(0, limit) : rows;
  if (!rows.length) return <p className="text-sm text-slate-500">Chưa có người chơi.</p>;
  return (
    <ol className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
      {shown.map((r) => (
        <li
          key={r.id}
          className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${r.id === meId ? "bg-gold/15 font-semibold" : ""}`}
        >
          <span className="w-7 font-mono text-slate-500">{r.rank}</span>
          <span className="flex-1 truncate">{r.nickname}</span>
          <span className="w-12 text-right font-mono text-xs text-slate-500">
            {r.answered >= total ? "✓" : `${r.answered}/${total}`}
          </span>
          <span className="w-16 text-right font-mono text-xs text-slate-500">{formatTime(r.timeMs)}</span>
          <span className="w-14 text-right font-mono font-semibold">{r.score}</span>
        </li>
      ))}
    </ol>
  );
}

/** Người đã làm xong, theo thứ tự hoàn thành — chưa lộ điểm để giữ hồi hộp. */
export function FinishedList({ rows }: { rows: LeaderRow[] }) {
  const done = rows.filter((r) => r.finishedAt).sort((a, b) => a.finishedAt! - b.finishedAt!);
  if (!done.length) return <p className="text-sm text-slate-500">Chưa có ai hoàn thành.</p>;
  return (
    <ol className="flex flex-wrap gap-2">
      {done.map((r, i) => (
        <li key={r.id} className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-sm">
          <span className="font-mono text-slate-500">{i + 1}.</span> {r.nickname}
        </li>
      ))}
    </ol>
  );
}

/** Nút bấm mới hiện Top 3 + bảng xếp hạng đầy đủ. */
export function RankingReveal({ rows, total, meId }: { rows: LeaderRow[]; total: number; meId?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-8">
      <button
        onClick={() => setOpen(!open)}
        className="mx-auto block rounded-xl bg-brand px-6 py-3 text-lg font-semibold text-white"
      >
        {open ? "Ẩn bảng xếp hạng" : "Xem bảng xếp hạng"}
      </button>
      {open && (
        <>
          <Podium rows={rows} />
          <Leaderboard rows={rows} total={total} meId={meId} />
        </>
      )}
    </div>
  );
}

const PODIUM = [
  { place: 2, h: "h-24", tone: "bg-slate-300" },
  { place: 1, h: "h-32", tone: "bg-gold" },
  { place: 3, h: "h-16", tone: "bg-amber-700/60" },
];

export function Podium({ rows }: { rows: LeaderRow[] }) {
  return (
    <div className="flex items-end justify-center gap-3">
      {PODIUM.map(({ place, h, tone }) => {
        const p = rows[place - 1];
        return (
          <div key={place} className="flex w-28 flex-col items-center gap-1">
            <span className="w-full truncate text-center font-semibold">{p?.nickname ?? "—"}</span>
            <span className="font-mono text-sm">{p ? `${p.score} · ${formatTime(p.timeMs)}` : ""}</span>
            <div className={`${h} ${tone} flex w-full items-start justify-center rounded-t-lg pt-2 text-2xl font-bold text-navy`}>
              {place}
            </div>
          </div>
        );
      })}
    </div>
  );
}

type Reveal = { correctAnswer: OptionKey; explanation: string; source: string; knowledgeSection: string };

export function AnswerReveal({ reveal, question }: { reveal: Reveal; question: QuestionView }) {
  const correct = question.options?.find((o) => o.key === reveal.correctAnswer);
  return (
    <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <p className="flex items-center gap-2 text-sm font-bold tracking-wide text-emerald-700">
        <CheckCircle2 size={18} /> ĐÁP ÁN ĐÚNG
      </p>
      <p className="text-lg font-semibold">
        {correct?.key}. {correct?.text}
      </p>
      <div>
        <p className="text-sm font-semibold">Giải thích</p>
        <p className="text-sm text-slate-700">{reveal.explanation}</p>
      </div>
      <div>
        <p className="text-sm font-semibold">Nguồn</p>
        <p className="text-sm text-slate-700">{reveal.source}</p>
      </div>
      <Link
        href={`/knowledge#${reveal.knowledgeSection}`}
        target="_blank"
        className="inline-flex items-center gap-2 rounded-lg border border-navy px-3 py-1.5 text-sm font-medium hover:bg-navy hover:text-white"
      >
        <BookOpen size={16} /> Đọc lại kiến thức
      </Link>
    </div>
  );
}
