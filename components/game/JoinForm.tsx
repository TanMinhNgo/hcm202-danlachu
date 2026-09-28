"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { post } from "./useRoom";

export function JoinForm({ initialCode }: { initialCode: string }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="mx-auto max-w-sm space-y-4 px-4 py-16"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        setErr(null);
        try {
          const { code } = await post("/api/game/join", { code: f.get("code"), nickname: f.get("nickname") });
          router.push(`/game/room/${code}`);
        } catch (e) {
          setErr((e as Error).message);
          setBusy(false);
        }
      }}
    >
      <h1 className="text-center text-2xl font-bold">Tham gia game</h1>
      <label className="block">
        <span className="text-sm font-medium">Mã phòng</span>
        <input
          name="code"
          required
          defaultValue={initialCode}
          autoComplete="off"
          className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-2xl uppercase tracking-widest"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Nickname</span>
        <input name="nickname" required maxLength={20} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-lg" />
      </label>
      {err && <p className="text-sm text-brand">{err}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-50">
        {busy ? "Đang vào…" : "Join Game"}
      </button>
    </form>
  );
}
