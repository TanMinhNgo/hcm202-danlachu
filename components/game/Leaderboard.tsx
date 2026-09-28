import Link from "next/link";
import { BookOpen, CheckCircle2 } from "lucide-react";
import type { LeaderRow, RoomState } from "./useRoom";

export function Leaderboard({ rows, meId, limit }: { rows: LeaderRow[]; meId?: string; limit?: number }) {
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
          <span className="w-10 text-right font-mono text-xs">
            {r.change > 0 ? <span className="text-emerald-600">↑{r.change}</span> : r.change < 0 ? <span className="text-brand">↓{-r.change}</span> : <span className="text-slate-400">—</span>}
          </span>
          <span className="w-14 text-right font-mono font-semibold">{r.score}</span>
        </li>
      ))}
    </ol>
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
            <span className="font-mono text-sm">{p?.score ?? ""}</span>
            <div className={`${h} ${tone} flex w-full items-start justify-center rounded-t-lg pt-2 text-2xl font-bold text-navy`}>
              {place}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AnswerReveal({ state }: { state: RoomState }) {
  const { reveal, question } = state;
  if (!reveal || !question?.options) return null;
  const correct = question.options.find((o) => o.key === reveal.correctAnswer);
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
