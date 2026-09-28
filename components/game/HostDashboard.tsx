"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Timer, Users } from "lucide-react";
import type { HostAction } from "@/lib/game/rules";
import { AnswerReveal, Leaderboard, Podium } from "./Leaderboard";
import { QuestionCard, Rules } from "./QuestionCard";
import { post, useCountdown, useRoom } from "./useRoom";

const STATUS_LABEL: Record<string, string> = {
  LOBBY: "Phòng chờ",
  BETTING: "Đang cược",
  QUESTION: "Đang trả lời",
  ANSWER_LOCKED: "Đã khoá trả lời",
  REVEAL: "Công bố đáp án",
  LEADERBOARD: "Bảng xếp hạng",
  FINISHED: "Kết thúc",
};

export function CreateRoom() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Host · Risk &amp; Reward</h1>
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const { code } = await post("/api/rooms", {});
            router.replace(`/game/host?code=${code}`);
          } catch (e) {
            setErr((e as Error).message);
            setBusy(false);
          }
        }}
        className="rounded-xl bg-brand px-6 py-3 font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Đang tạo…" : "Tạo phòng mới"}
      </button>
      {err && <p className="text-brand">{err}</p>}
    </div>
  );
}

export function HostDashboard({ code }: { code: string }) {
  const { state, error, refresh, serverNow } = useRoom(code, true);
  const left = useCountdown(state?.status === "QUESTION" ? state.answerDeadlineAt : null, serverNow);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (error) return <p className="p-10 text-center">{error}</p>;
  if (!state) return <p className="p-10 text-center">Đang tải…</p>;
  if (!state.isHost) return <p className="p-10 text-center">Bạn không phải host của phòng {code}.</p>;

  const { status, question, counts } = state;
  const isLast = state.currentQuestion >= state.total;

  const act = async (action: HostAction) => {
    if (action === "end" && !confirm("Kết thúc game ngay?")) return;
    setBusy(true);
    setMsg(null);
    try {
      await post("/api/host/state", { code, action });
    } catch (e) {
      setMsg((e as Error).message);
    }
    await refresh();
    setBusy(false);
  };
  const btn = (action: HostAction, children: React.ReactNode, primary = false) => (
    <button
      key={action}
      disabled={busy}
      onClick={() => act(action)}
      className={`rounded-xl px-5 py-2.5 font-semibold disabled:opacity-50 ${primary ? "bg-brand text-white" : "border border-navy"}`}
    >
      {children}
    </button>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-navy px-6 py-4 text-white">
        <div>
          <p className="text-xs uppercase opacity-70">Mã phòng · vào /game/join</p>
          <p className="font-mono text-5xl font-bold tracking-widest text-gold">{code}</p>
        </div>
        <div className="flex gap-8 text-center">
          <Stat label="Người chơi" value={counts.players} />
          {counts.spectators > 0 && <Stat label="Khán giả" value={counts.spectators} />}
          <Stat label="Câu" value={state.currentQuestion ? `${state.currentQuestion}/${state.total}` : "—"} />
          <Stat label="Đã cược" value={status === "LOBBY" ? "—" : counts.bets} />
          <Stat label="Đã trả lời" value={status === "LOBBY" || status === "BETTING" ? "—" : counts.answers} />
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm">{STATUS_LABEL[status]}</span>
      </header>

      {msg && <p className="rounded-lg bg-red-50 px-3 py-2 text-brand">{msg}</p>}

      <div className="flex flex-wrap gap-3">
        {status === "LOBBY" && btn("start", "Bắt đầu game", true)}
        {status === "BETTING" && btn("showQuestion", "Hiện câu hỏi", true)}
        {status === "QUESTION" && btn("lock", "Khoá trả lời")}
        {(status === "QUESTION" || status === "ANSWER_LOCKED") && btn("reveal", "Công bố đáp án", true)}
        {status === "REVEAL" && btn("leaderboard", "Xem bảng xếp hạng")}
        {(status === "REVEAL" || status === "LEADERBOARD") &&
          btn("next", isLast ? "Kết thúc & xem Top 3" : "Câu tiếp theo", true)}
        {status !== "FINISHED" && status !== "LOBBY" && btn("end", "Kết thúc game")}
      </div>

      {status === "LOBBY" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Rules />
          <div className="space-y-2">
            <h2 className="flex items-center gap-2 font-semibold">
              <Users size={18} /> Đã vào phòng ({counts.players})
            </h2>
            <div className="flex flex-wrap gap-2">
              {state.leaderboard.map((p) => (
                <span key={p.id} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm">
                  {p.nickname}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {status === "BETTING" && question && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-slate-500">Câu {question.orderNumber}</p>
          <p className="text-4xl font-bold">{question.category}</p>
          {question.isFinalRound && <p className="mt-2 text-xl font-bold text-brand">FINAL ROUND · cược tối đa 50</p>}
          <p className="mt-4 text-slate-600">
            Người chơi đang chọn mức cược… ({counts.bets}/{counts.players})
          </p>
        </div>
      )}

      {(status === "QUESTION" || status === "ANSWER_LOCKED" || status === "REVEAL") && question?.options && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-8">
          <div className="flex justify-between text-slate-500">
            <span>
              Câu {question.orderNumber} · {question.category}
            </span>
            {status === "QUESTION" && (
              <span className={`flex items-center gap-1 font-mono text-3xl font-bold ${left <= 5 ? "text-brand" : "text-navy"}`}>
                <Timer /> {left}s
              </span>
            )}
          </div>
          <QuestionCard question={question} correct={state.reveal?.correctAnswer} large />
          {status === "REVEAL" && <AnswerReveal state={state} />}
        </div>
      )}

      {status === "LEADERBOARD" && <Leaderboard rows={state.leaderboard} limit={10} />}

      {status === "FINISHED" && (
        <div className="space-y-8">
          <Podium rows={state.leaderboard} />
          <Leaderboard rows={state.leaderboard} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-70">{label}</p>
    </div>
  );
}
