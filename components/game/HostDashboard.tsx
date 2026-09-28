"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Copy, Plus, Users } from "lucide-react";
import { FinishedList, RankingReveal } from "./Leaderboard";
import { Rules } from "./QuestionCard";
import { post, useRoom } from "./useRoom";
import styles from "./arena.module.css";

export function CreateRoom() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className={styles.arena}>
      <div className={styles.formShell}>
        <div className={styles.formPanel}>
          <div className={styles.createIcon}><Plus size={32} /></div>
          <h1>Tạo đấu trường</h1>
          <p className={styles.formLead}>Mở phòng, chia sẻ mã cho mọi người và bắt đầu khi tất cả đã sẵn sàng.</p>
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
            className={`${styles.buttonPrimary} ${styles.buttonFull}`}
          >
            {busy ? "Đang tạo…" : <>Tạo phòng mới <ArrowUpRight size={18} /></>}
          </button>
          {err && <p className={styles.error} role="alert">{err}</p>}
          <Link href="/game" className={styles.backLink}>Quay lại giới thiệu</Link>
        </div>
      </div>
    </div>
  );
}

// Host chỉ tạo phòng, bấm bắt đầu và theo dõi bảng xếp hạng — không hiện câu hỏi.
export function HostDashboard({ code }: { code: string }) {
  const { state, error, refresh } = useRoom(code, true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (error) return <Message>{error}</Message>;
  if (!state) return <Message>Đang tải phòng chơi…</Message>;
  if (!state.isHost) return <Message>Bạn không phải người tạo phòng {code}.</Message>;

  const { status, counts } = state;
  const start = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await post("/api/host/state", { code, action: "start" });
    } catch (e) {
      setMsg((e as Error).message);
    }
    await refresh();
    setBusy(false);
  };

  return (
    <div className={styles.arena}>
      <div className={styles.hostShell}>
        <div className={styles.hostHero}>
          <div className={styles.hostCode}>
            <span className={styles.eyebrow}>{status === "LOBBY" ? "Phòng chờ đang mở" : "Cuộc chơi đang diễn ra"}</span>
            <h1>{code}</h1>
            <p>Mã phòng · người chơi vào trang /game/join để tham gia</p>
            <button
              className={styles.inviteButton}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`${window.location.origin}/game/join?code=${code}`);
                  setCopied(true);
                } catch {
                  setMsg("Không sao chép được link. Hãy gửi mã phòng cho người chơi.");
                }
              }}
            ><Copy size={14} /> {copied ? "Đã sao chép link mời" : "Sao chép link mời"}</button>
          </div>
          <div className={styles.hostStats}>
            <div className={styles.hostStat}><strong>{counts.players}</strong><span>Người chơi</span></div>
            <div className={styles.hostStat}><strong>{status === "LOBBY" ? "—" : counts.finished}</strong><span>Đã về đích</span></div>
          </div>
        </div>

        {msg && <p className={styles.error} role="alert">{msg}</p>}
        {status === "LOBBY" ? (
          <div className={styles.hostSection}>
            <div className={styles.hostSectionHead}>
              <h2><Users size={20} style={{ display: "inline", marginRight: 9 }} /> Sẵn sàng xuất phát</h2>
              <button disabled={busy} onClick={start} className={styles.buttonPrimary}>Bắt đầu game <ArrowUpRight size={18} /></button>
            </div>
            <div className={styles.hostGrid}>
              <div className={styles.panel} style={{ padding: 25 }}>
                <p className={styles.stageKicker}>NGƯỜI CHƠI TRONG PHÒNG ({counts.players})</p>
                <div className={styles.playerPills} style={{ marginTop: 18 }}>
                  {state.leaderboard.length ? state.leaderboard.map((p) => <span key={p.id}>{p.nickname}</span>) : <p className={styles.empty}>Đang chờ người chơi đầu tiên…</p>}
                </div>
              </div>
              <Rules />
            </div>
          </div>
        ) : (
          <div className={styles.hostSection}>
            <div className={styles.hostSectionHead}><h2>Đường đua đang nóng lên</h2></div>
            <div className={styles.panel} style={{ padding: 25 }}>
              <p className={styles.stageKicker}>ĐÃ HOÀN THÀNH {counts.finished}/{counts.players}</p>
              <div style={{ marginTop: 16 }}><FinishedList rows={state.leaderboard} /></div>
            </div>
            <RankingReveal rows={state.leaderboard} total={state.total} />
          </div>
        )}
      </div>
    </div>
  );
}

function Message({ children }: { children: React.ReactNode }) {
  return <div className={styles.arena}><div className={styles.centerMessage}>{children}</div></div>;
}
