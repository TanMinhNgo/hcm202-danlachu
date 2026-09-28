"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Users } from "lucide-react";
import { FinishedList, RankingReveal } from "./Leaderboard";
import { Rules } from "./QuestionCard";
import { post, useRoom } from "./useRoom";

const STATUS_LABEL: Record<string, string> = { LOBBY: "Phòng chờ", PLAYING: "Đang chơi" };

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

// Host chỉ tạo phòng, bấm bắt đầu và theo dõi bảng xếp hạng — không hiện câu hỏi.
export function HostDashboard({ code }: { code: string }) {
  const { state, error, refresh } = useRoom(code, true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (error) return <p className="p-10 text-center">{error}</p>;
  if (!state) return <p className="p-10 text-center">Đang tải…</p>;
  if (!state.isHost) return <p className="p-10 text-center">Bạn không phải host của phòng {code}.</p>;

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
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-navy px-6 py-4 text-white">
        <div>
          <p className="text-xs uppercase opacity-70">Mã phòng · vào /game/join</p>
          <p className="font-mono text-5xl font-bold tracking-widest text-gold">{code}</p>
        </div>
        <div className="flex gap-8 text-center">
          <Stat label="Người chơi" value={counts.players} />
          <Stat label="Đã xong" value={status === "LOBBY" ? "—" : `${counts.finished}/${counts.players}`} />
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm">{STATUS_LABEL[status]}</span>
      </header>

      {msg && <p className="rounded-lg bg-red-50 px-3 py-2 text-brand">{msg}</p>}

      {status === "LOBBY" && (
        <button disabled={busy} onClick={start} className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white disabled:opacity-50">
          Bắt đầu game
        </button>
      )}

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

      {status === "PLAYING" && (
        <div className="space-y-8">
          <section className="space-y-2">
            <h2 className="font-semibold">
              Đã hoàn thành ({counts.finished}/{counts.players})
            </h2>
            <FinishedList rows={state.leaderboard} />
          </section>
          <RankingReveal rows={state.leaderboard} total={state.total} />
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
