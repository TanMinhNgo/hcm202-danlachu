"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Star, Timer } from "lucide-react";
import type { OptionKey } from "@/lib/data/questions";
import { AnswerReveal, FinishedList, RankingReveal } from "./Leaderboard";
import { QuestionCard, Rules } from "./QuestionCard";
import { formatTime, post, useCountdown, useRoom } from "./useRoom";

export function PlayerGameView({ code }: { code: string }) {
  const { state, error, refresh, serverNow } = useRoom(code);
  const me = state?.me;
  const left = useCountdown(me?.phase === "QUESTION" ? me.deadline : null, serverNow);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [star, setStar] = useState(false);
  const timedOut = useRef(0); // câu đã gửi "hết giờ" → không gửi lặp

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

  // Hết 15s mà chưa bấm → tự nộp "hết giờ" để chấm sai và hiện đáp án.
  const questionNo = me?.phase === "QUESTION" ? me.question.orderNumber : 0;
  useEffect(() => {
    if (questionNo && left === 0 && timedOut.current !== questionNo) {
      timedOut.current = questionNo;
      void act("/api/game/answer", { answer: null });
    }
  });

  if (error) return <Center>{error}</Center>;
  if (!state) return <Center>Đang tải…</Center>;
  if (!me)
    return (
      <Center>
        Bạn chưa tham gia phòng <b className="font-mono">{code}</b>.{" "}
        <Link className="text-brand underline" href={`/game/join?code=${code}`}>
          Tham gia
        </Link>
      </Center>
    );

  const { status } = state;
  const playing = status === "PLAYING";

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-6">
      <header className="flex items-center justify-between rounded-xl bg-navy px-4 py-3 text-white">
        <div>
          <p className="text-xs opacity-70">Phòng {code}</p>
          <p className="font-semibold">{me.nickname}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-bold text-gold">{me.score}</p>
          <p className="text-xs opacity-70">
            Hạng {me.rank} · ⭐ {me.starsLeft} · {formatTime(me.timeMs)}
          </p>
        </div>
      </header>

      {msg && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-brand">{msg}</p>}

      {status === "LOBBY" && (
        <>
          <p className="text-center text-slate-600">
            Đang chờ host bắt đầu… <b>{state.counts.players}</b> người chơi
          </p>
          <Rules />
        </>
      )}

      {playing && me.phase !== "DONE" && (
        <p className="text-sm text-slate-500">
          Câu {me.question.orderNumber}/{state.total} · {me.question.category}
          {me.question.isFinalRound && <b className="ml-2 text-brand">FINAL ROUND</b>}
        </p>
      )}

      {playing && me.phase === "BET" && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Chọn mức cược</h2>
          <button
            disabled={busy || me.starsLeft < 1}
            onClick={() => setStar(!star)}
            aria-pressed={star}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 py-3 font-semibold disabled:opacity-40 ${star ? "border-gold bg-gold/20" : "border-slate-200 bg-white"}`}
          >
            <Star size={18} fill={star ? "currentColor" : "none"} />
            Ngôi sao hi vọng {star ? "ĐANG BẬT" : "(tắt)"} · còn {me.starsLeft} lần
          </button>
          {star && <p className="text-center text-sm text-brand">Đúng được x2 điểm cược — sai bị trừ x2!</p>}
          <div className="grid grid-cols-3 gap-3">
            {me.allowedBets.map((b) => (
              <button
                key={b}
                disabled={busy}
                onClick={() => act("/api/game/bet", { bet: b, star: star && b > 0 }).then(() => setStar(false))}
                className="rounded-xl border-2 border-slate-200 bg-white py-5 font-mono text-2xl font-bold hover:border-brand disabled:opacity-50"
              >
                {b}
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500">Chọn cược xong câu hỏi hiện ngay, có 15 giây để trả lời.</p>
        </section>
      )}

      {playing && me.phase === "QUESTION" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>
              Cược: <b className="font-mono">{me.bet}</b>
              {me.star && " ⭐"}
            </span>
            <span className={`flex items-center gap-1 font-mono text-xl font-bold ${left <= 5 ? "text-brand" : ""}`}>
              <Timer size={18} /> {left}s
            </span>
          </div>
          <QuestionCard
            question={me.question}
            disabled={busy || left === 0}
            onPick={(k: OptionKey) => act("/api/game/answer", { answer: k })}
          />
        </section>
      )}

      {playing && me.phase === "RESULT" && (
        <section className="space-y-4">
          <p className={`text-center font-mono text-4xl font-bold ${me.scoreChange >= 0 ? "text-emerald-600" : "text-brand"}`}>
            {me.scoreChange > 0 ? `+${me.scoreChange}` : me.scoreChange}
          </p>
          <p className="text-center text-slate-600">
            {me.isCorrect ? "Chính xác!" : me.answer ? "Sai rồi." : "Hết giờ."}
            {me.star && " (Ngôi sao hi vọng)"}
          </p>
          <QuestionCard question={me.question} selected={me.answer} correct={me.reveal.correctAnswer} />
          <AnswerReveal reveal={me.reveal} question={me.question} />
          <button
            disabled={busy}
            onClick={() => act("/api/game/next", {})}
            className="w-full rounded-xl bg-brand py-3 text-lg font-semibold text-white disabled:opacity-50"
          >
            {me.question.orderNumber >= state.total ? "Xem kết quả" : "Tiếp tục"}
          </button>
        </section>
      )}

      {me.phase === "DONE" && (
        <section className="space-y-6">
          <p className="text-center text-lg">
            Bạn đã hoàn thành! Điểm <b className="font-mono">{me.score}</b> · thời gian{" "}
            <b className="font-mono">{formatTime(me.timeMs)}</b>
          </p>
          <div className="space-y-2">
            <h2 className="font-semibold">
              Đã hoàn thành ({state.counts.finished}/{state.counts.players})
            </h2>
            <FinishedList rows={state.leaderboard} />
          </div>
          <RankingReveal rows={state.leaderboard} total={state.total} meId={me.id} />
        </section>
      )}
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-md px-4 py-20 text-center">{children}</div>;
}
