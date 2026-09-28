"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { post } from "./useRoom";
import styles from "./arena.module.css";

export function JoinForm({ initialCode }: { initialCode: string }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className={styles.arena}>
    <div className={styles.formShell}>
    <form
      className={styles.formPanel}
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
      <p className={styles.eyebrow}>Bước vào đấu trường</p>
      <h1>Tham gia phòng chơi</h1>
      <p className={styles.formLead}>Nhập mã phòng từ người tạo để bắt đầu cuộc đua kiến thức.</p>
      <label className={styles.field}>
        <span>Mã phòng</span>
        <input
          name="code"
          required
          defaultValue={initialCode}
          autoComplete="off"
          placeholder="VD: ABC123"
          className={styles.codeInput}
        />
      </label>
      <label className={styles.field}>
        <span>Tên hiển thị</span>
        <input name="nickname" required maxLength={20} placeholder="Tên của bạn" />
      </label>
      {err && <p className={styles.error} role="alert">{err}</p>}
      <button disabled={busy} className={`${styles.buttonPrimary} ${styles.buttonFull}`}>
        {busy ? "Đang vào…" : "Vào đấu trường"}
      </button>
      <Link href="/game" className={styles.backLink}>Xem luật chơi trước</Link>
    </form>
    </div>
    </div>
  );
}
