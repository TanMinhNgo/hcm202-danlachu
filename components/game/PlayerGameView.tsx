"use client";
import Link from "next/link";
import { useState } from "react";
import { Timer } from "lucide-react";
import type { OptionKey } from "@/lib/data/questions";
import { AnswerReveal, Leaderboard, Podium } from "./Leaderboard";
import { QuestionCard, Rules } from "./QuestionCard";
import { post, useCountdown, useRoom } from "./useRoom";

export function PlayerGameView({ code }: { code: string }) {
  const { state, error, refresh, serverNow } = useRoom(code);
  const left = useCountdown(state?.status === "QUESTION" ? state.answerDeadlineAt : null, serverNow);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (error) return <Center>{error}</Center>;
  if (!state) return <Center>Đang tải…</Center>;
  const { me, status, question } = state;
  if (!me)
    return (
      <Center>
        Bạn chưa tham gia phòng <b className="font-mono">{code}</b>.{" "}
        <Link className="text-brand underline" href={`/game/join?code=${code}`}>
          Tham gia
        </Link>
      </Center>
    );

  const act = async (url: string, body: object) => {
    setBusy(true);
    setMsg(null);
    try {
      await post(url, { code, ...body });
    } catch (e) {
      setMsg((e as Error).message);
    }
    await refresh();
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-6">
      <header className="flex items-center justify-between rounded-xl bg-navy px-4 py-3 text-white">
        <div>
          <p className="text-xs opacity-70">Phòng {code}</p>
          <p className="font-semibold">{me.nickname}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-bold text-gold">{me.score}</p>
          <p className="text-xs opacity-70">{me.rank ? `Hạng ${me.rank}` : "Khán giả"}</p>
        </div>
      </header>

      {me.isSpectator && (
        <p className="rounded-lg bg-slate-200 px-3 py-2 text-sm">Bạn vào sau khi game bắt đầu nên đang ở chế độ khán giả.</p>
      )}
      {msg && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-brand">{msg}</p>}

      {question && status !== "LOBBY" && status !== "FINISHED" && (
        <p className="text-sm text-slate-500">
          Câu {question.orderNumber}/{state.total} · {question.category}
          {question.isFinalRound && <b className="ml-2 text-brand">FINAL ROUND</b>}
        </p>
      )}

      {status === "LOBBY" && (
        <>
          <p className="text-center text-slate-600">
            Đang chờ host bắt đầu… <b>{state.counts.players}</b> người chơi
          </p>
          <Rules />
        </>
      )}

      {status === "BETTING" && !me.isSpectator && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Chọn mức cược</h2>
          {me.bet !== null ? (
            <p className="rounded-xl border-2 border-navy bg-white p-4 text-center">
              Đã khoá cược <b className="font-mono text-xl">{me.bet}</b> — chờ câu hỏi…
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {me.allowedBets.map((b) => (
                <button
                  key={b}
                  disabled={busy}
                  onClick={() => act("/api/game/bet", { bet: b })}
                  className="rounded-xl border-2 border-slate-200 bg-white py-5 font-mono text-2xl font-bold hover:border-brand disabled:opacity-50"
                >
                  {b}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {(status === "QUESTION" || status === "ANSWER_LOCKED") && question?.options && (
        <section className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>
              Cược: <b className="font-mono">{me.bet ?? "—"}</b>
            </span>
            {status === "QUESTION" && (
              <span className={`flex items-center gap-1 font-mono text-xl font-bold ${left <= 5 ? "text-brand" : ""}`}>
                <Timer size={18} /> {left}s
              </span>
            )}
          </div>
          <QuestionCard
            question={question}
            selected={me.answer}
            disabled={busy || me.bet === null || me.answer !== null || status !== "QUESTION" || left === 0}
            onPick={me.isSpectator ? undefined : (k: OptionKey) => act("/api/game/answer", { answer: k })}
          />
          <p className="text-center text-sm text-slate-500">
            {me.isSpectator
              ? ""
              : me.bet === null
                ? "Bạn chưa cược nên không trả lời được câu này."
                : me.answer
                  ? "Đã khoá đáp án — chờ host công bố."
                  : left === 0 || status !== "QUESTION"
                    ? "Hết giờ."
                    : ""}
          </p>
        </section>
      )}

      {status === "REVEAL" && question && (
        <section className="space-y-4">
          {me.scoreChange !== null ? (
            <p className={`text-center font-mono text-4xl font-bold ${me.scoreChange >= 0 ? "text-emerald-600" : "text-brand"}`}>
              {me.scoreChange > 0 ? `+${me.scoreChange}` : me.scoreChange}
            </p>
          ) : (
            !me.isSpectator && <p className="text-center text-slate-500">Bạn không cược câu này.</p>
          )}
          <QuestionCard question={question} selected={me.answer} correct={state.reveal?.correctAnswer} />
          <AnswerReveal state={state} />
        </section>
      )}

      {status === "LEADERBOARD" && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Bảng xếp hạng</h2>
          <Leaderboard rows={state.leaderboard} meId={me.id} />
        </section>
      )}

      {status === "FINISHED" && (
        <section className="space-y-6">
          <h2 className="text-center text-2xl font-bold">Kết quả chung cuộc</h2>
          <Podium rows={state.leaderboard} />
          <Leaderboard rows={state.leaderboard} meId={me.id} />
        </section>
      )}
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-lg px-4 py-20 text-center text-slate-600">{children}</div>;
}
