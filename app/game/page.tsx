import Link from "next/link";
import { Rules } from "@/components/game/QuestionCard";

export default function GamePage() {
  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <h1 className="text-center text-3xl font-bold tracking-tight">RISK &amp; REWARD — HCM202</h1>
      <Rules />
      <div className="grid grid-cols-2 gap-3">
        <Link href="/game/join" className="rounded-xl bg-brand py-3 text-center font-semibold text-white">
          Tham gia game
        </Link>
        <Link href="/game/host" className="rounded-xl border border-navy py-3 text-center font-semibold">
          Tạo phòng (Host)
        </Link>
      </div>
    </div>
  );
}
