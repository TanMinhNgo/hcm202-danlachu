"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { OptionKey } from "@/lib/data/questions";
import type { RoomStatus } from "@/lib/game/rules";

export type LeaderRow = { id: string; nickname: string; score: number; rank: number; change: number };
export type RoomState = {
  serverNow: number;
  code: string;
  status: RoomStatus;
  currentQuestion: number;
  total: number;
  answerDeadlineAt: number | null;
  isHost: boolean;
  question: {
    orderNumber: number;
    category: string;
    isFinalRound: boolean;
    question?: string;
    options?: { key: OptionKey; text: string }[];
  } | null;
  reveal: { correctAnswer: OptionKey; explanation: string; source: string; knowledgeSection: string } | null;
  counts: { players: number; spectators: number; bets: number; answers: number };
  leaderboard: LeaderRow[];
  me: {
    id: string;
    nickname: string;
    score: number;
    isSpectator: boolean;
    rank: number | null;
    allowedBets: number[];
    bet: number | null;
    answer: OptionKey | null;
    isCorrect: boolean | null;
    scoreChange: number | null;
  } | null;
};

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY;

/** State phòng từ server. Pusher báo "có thay đổi" → refetch; không có Pusher thì polling. */
export function useRoom(code: string, asHost = false) {
  const [state, setState] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const offset = useRef(0); // lệch đồng hồ client/server cho đếm ngược

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/rooms/${code}`, { cache: "no-store" }).catch(() => null);
    if (!res) return;
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    offset.current = data.serverNow - Date.now();
    setState(data);
    setError(null);
  }, [code]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- setState chạy sau await fetch, không đồng bộ
    refresh();
    // Có Pusher: poll thưa làm lưới an toàn. Không có: poll 2s.
    const timer = setInterval(refresh, PUSHER_KEY ? 10000 : 2000);
    let cancelled = false;
    let disconnect = () => {};
    if (PUSHER_KEY) {
      import("pusher-js").then(({ default: Pusher }) => {
        if (cancelled) return;
        const pusher = new Pusher(PUSHER_KEY, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1" });
        const channels = [pusher.subscribe(`room-${code}`)];
        if (asHost) channels.push(pusher.subscribe(`host-${code}`));
        channels.forEach((c) => c.bind_global(() => refresh()));
        disconnect = () => pusher.disconnect();
      });
    }
    return () => {
      cancelled = true;
      clearInterval(timer);
      disconnect();
    };
  }, [code, asHost, refresh]);

  const serverNow = useCallback(() => Date.now() + offset.current, []);
  return { state, error, refresh, serverNow };
}

export async function post(url: string, body: object) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");
  return data;
}

export function useCountdown(deadline: number | null, serverNow: () => number) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!deadline) return;
    const t = setInterval(() => setNow(serverNow()), 250);
    return () => clearInterval(t);
  }, [deadline, serverNow]);
  // Trước tick đầu tiên (now=0) hiển thị đủ thời gian còn lại xấp xỉ bằng deadline - now thật ở tick sau.
  return deadline && now ? Math.min(15, Math.max(0, Math.ceil((deadline - now) / 1000))) : deadline ? 15 : 0;
}
