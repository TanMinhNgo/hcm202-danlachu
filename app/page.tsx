import Link from "next/link";

// TODO(nội dung): hero đầy đủ + 4 thẻ nguyên tắc (spec mục 7).
export default function Home() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight">NHÀ NƯỚC CỦA DÂN · DO DÂN · VÌ DÂN</h1>
      <p className="text-xl text-brand">Từ nguyên tắc đến tình huống</p>
      <div className="flex justify-center gap-3">
        <Link href="/knowledge" className="rounded-xl border border-navy px-5 py-3 font-semibold">Khám phá nội dung</Link>
        <Link href="/game" className="rounded-xl bg-brand px-5 py-3 font-semibold text-white">Tham gia Mini Game</Link>
      </div>
    </div>
  );
}
