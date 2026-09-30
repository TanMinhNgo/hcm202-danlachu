"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import type { OptionKey } from "@/lib/data/questions";
import { AnswerReveal, FinishedList, RankingReveal } from "./Leaderboard";
import { QuestionCard, Rules } from "./QuestionCard";
import { formatTime, post, useCountdown, useRoom } from "./useRoom";
import styles from "./arena.module.css";

export function PlayerGameView({ code }: { code: string }) {
  const { state, setState, error, refresh, serverNow } = useRoom(code);
  const me = state?.me;
  const left = useCountdown(me?.phase === "QUESTION" ? me.deadline : null, serverNow);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [star, setStar] = useState(false);
  const timedOut = useRef(0);
  const resultRef = useRef<HTMLElement>(null);
  const [acknowledgedResult, setAcknowledgedResult] = useState<string | null>(null);

  const act = async (url: string, body: object) => {
    setBusy(true);
    setMsg(null);
    try {
      const data = await post(url, { code, ...body });
      // Server trả sẵn kết quả (answer) → hiện ngay, refetch nền chỉ để cập nhật hạng.
      if (data.me) setState((s) => (s?.me ? { ...s, me: { ...s.me, ...data.me } } : s));
      else await refresh();
      setBusy(false);
      if (data.me) void refresh();
      return;
    } catch (e) {
      setMsg((e as Error).message);
    }
    await refresh();
    setBusy(false);
  };

  const questionNo = me?.phase === "QUESTION" ? me.question.orderNumber : 0;
  useEffect(() => {
    if (questionNo && left === 0 && timedOut.current !== questionNo) {
      timedOut.current = questionNo;
      void act("/api/game/answer", { answer: null });
    }
  });

  const resultKey = me?.phase === "RESULT" ? `${code}-${me.question.orderNumber}` : null;
  useEffect(() => {
    if (!resultKey) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultRef.current?.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
    const timer = window.setTimeout(() => setAcknowledgedResult(resultKey), 900);
    return () => window.clearTimeout(timer);
  }, [resultKey]);

  if (error) return <Message>{error}</Message>;
  if (!state) return <Message>Đang tải đấu trường…</Message>;
  if (!me) return <Message>Bạn chưa tham gia phòng <b>{code}</b>. <Link href={`/game/join?code=${code}`}>Vào phòng ngay</Link></Message>;

  const playing = state.status === "PLAYING";

  return (
    <div className={styles.arena}>
      <div className={styles.playerShell}>
        <header className={styles.scorebar}>
          <div className={styles.scoreCell}><span>PHÒNG {code} · NGƯỜI CHƠI</span><strong>{me.nickname}</strong></div>
          <div className={`${styles.scoreCell} ${styles.scoreCellGold}`}><span>ĐIỂM</span><strong>{me.score}</strong></div>
          <div className={styles.scoreCell}><span>HẠNG</span><strong>#{me.rank}</strong></div>
          <div className={styles.scoreCell}><span>THỜI GIAN</span><strong>{formatTime(me.timeMs)}</strong></div>
        </header>

        {msg && <p className={styles.error} role="alert">{msg}</p>}

        {state.status === "LOBBY" && (
          <>
            <div className={styles.phaseHeader}><span className={styles.eyebrow}>Đã vào phòng · {state.counts.players} người chơi</span></div>
            <section className={styles.stagePanel}>
              <p className={styles.stageKicker}>CHỜ HIỆU LỆNH XUẤT PHÁT</p>
              <h1 className={styles.stageTitle}>Sẵn sàng thử vận may kiến thức?</h1>
              <p className={styles.stageCopy}>Người tạo phòng sẽ bắt đầu cuộc chơi. Trong lúc chờ, hãy xem luật và chọn mức điểm phù hợp cho mỗi câu.</p>
            </section>
            <div style={{ marginTop: 18 }}><Rules /></div>
          </>
        )}

        {playing && me.phase !== "DONE" && (
          <div className={styles.phaseHeader}>
            <div className={styles.phaseTop}>
              <span>VÒNG {String(me.question.orderNumber).padStart(2, "0")} / {state.total}</span>
              <span>{me.question.isFinalRound ? "VÒNG QUYẾT ĐỊNH" : me.question.category}</span>
            </div>
            <div className={styles.progressTrack}><div className={styles.progressFill} style={{ width: `${(me.question.orderNumber / state.total) * 100}%` }} /></div>
          </div>
        )}

        {playing && me.phase === "BET" && (
          <section className={styles.stagePanel}>
            <p className={styles.stageKicker}>BƯỚC 1 · RA QUYẾT ĐỊNH</p>
            <h1 className={styles.stageTitle}>Bạn chọn mức điểm nào?</h1>
            <p className={styles.stageCopy}>Chủ đề: {me.question.category}. Câu hỏi sẽ xuất hiện ngay khi bạn chọn mức điểm.</p>
            <div className={styles.betGrid}>
              {me.allowedBets.map((bet) => (
                <button
                  key={bet}
                  disabled={busy}
                  onClick={() => act("/api/game/bet", { bet, star: star && bet > 0 }).then(() => setStar(false))}
                  className={styles.betChip}
                >
                  <span>MỨC ĐIỂM</span><strong>{bet}</strong><small>ĐIỂM <ArrowUpRight size={13} style={{ display: "inline" }} /></small>
                </button>
              ))}
            </div>
            <button
              disabled={busy || me.starsLeft < 1}
              onClick={() => setStar(!star)}
              aria-pressed={star}
              className={`${styles.starToggle} ${star ? styles.starActive : ""}`}
            >
              <Star size={23} fill={star ? "currentColor" : "none"} />
              <span>Ngôi sao hi vọng</span>
              <small>{star ? "ĐANG BẬT" : `CÒN ${me.starsLeft} LƯỢT`}</small>
            </button>
            <p className={styles.riskNote}>★ Bật sao: đúng cộng gấp đôi, sai trừ gấp đôi mức điểm đã chọn.</p>
          </section>
        )}

        {playing && me.phase === "QUESTION" && (
          <section className={styles.stagePanel}>
            <div className={styles.questionMeta}>
              <p className={styles.stakeLabel}>ĐIỂM ĐÃ CHỌN <strong>{me.bet} {me.star ? "★" : "điểm"}</strong></p>
              <div className={`${styles.timerRing} ${left <= 5 ? styles.timerDanger : ""}`} role="timer" aria-label={`Còn ${left} giây`}>{left}</div>
            </div>
            <QuestionCard question={me.question} disabled={busy || left === 0} onPick={(key: OptionKey) => act("/api/game/answer", { answer: key })} />
          </section>
        )}

        {playing && me.phase === "RESULT" && (
          <section ref={resultRef} className={styles.resultSection}>
            <div className={styles.resultHero}>
              <p>KẾT QUẢ VÒNG {String(me.question.orderNumber).padStart(2, "0")}</p>
              <strong className={me.scoreChange >= 0 ? styles.positive : styles.negative}>{me.scoreChange > 0 ? `+${me.scoreChange}` : me.scoreChange}</strong>
              <h2>{me.isCorrect ? "Chính xác!" : me.answer ? "Chưa chính xác" : "Hết giờ"}</h2>
              {me.star && <p>Ngôi sao hi vọng đã được sử dụng</p>}
            </div>
            <div className={styles.stagePanel} style={{ marginTop: 18 }}>
              <p className={styles.stageKicker}>NHÌN LẠI CÂU HỎI</p>
              <div style={{ marginTop: 15 }}><QuestionCard question={me.question} selected={me.answer} correct={me.reveal.correctAnswer} /></div>
              <AnswerReveal reveal={me.reveal} question={me.question} />
            </div>
            <p className={styles.resultPause}>Đáp án và lời giải sẽ ở đây cho đến khi bạn chọn tiếp tục.</p>
            <button disabled={busy || acknowledgedResult !== resultKey} onClick={() => act("/api/game/next", {})} className={`${styles.buttonPrimary} ${styles.buttonFull}`} style={{ marginTop: 18 }}>
              {me.question.orderNumber >= state.total ? "Xem kết quả chung" : "Vào vòng tiếp theo"} <ArrowUpRight size={18} />
            </button>
          </section>
        )}

        {me.phase === "DONE" && (
          <section style={{ marginTop: 30 }}>
            <div className={styles.doneHero}>
              <span className={styles.eyebrow}>Đã hoàn thành cuộc chơi</span>
              <h1>Về đích!</h1>
              <strong>{me.score}</strong>
              <p>ĐIỂM · THỜI GIAN {formatTime(me.timeMs)}</p>
            </div>
            <div className={styles.hostSection}>
              <div className={styles.hostSectionHead}><h2>Đã về đích ({state.counts.finished}/{state.counts.players})</h2></div>
              <FinishedList rows={state.leaderboard} />
            </div>
            <RankingReveal rows={state.leaderboard} total={state.total} meId={me.id} />
          </section>
        )}
      </div>
    </div>
  );
}

function Message({ children }: { children: React.ReactNode }) {
  return <div className={styles.arena}><div className={styles.centerMessage}>{children}</div></div>;
}
