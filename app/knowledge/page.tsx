import { SECTIONS } from "@/lib/data/presentation";

// TODO(nội dung): dựng UI đầy đủ (sidebar sticky, nhãn giáo trình / tình huống / phân tích) — spec mục 8.
export default function KnowledgePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      <h1 className="text-3xl font-bold">Nội dung</h1>
      {SECTIONS.map((s) => (
        <section key={s.id} id={s.id} className="scroll-mt-20 space-y-2">
          <h2 className="text-xl font-semibold">{s.title}</h2>
          {s.textbook.length ? (
            <ul className="list-disc pl-5">{s.textbook.map((t) => <li key={t}>{t}</li>)}</ul>
          ) : (
            <p className="text-slate-400">Nội dung đang cập nhật.</p>
          )}
          {s.source && <p className="text-sm text-slate-500">Nguồn: {s.source}</p>}
        </section>
      ))}
    </div>
  );
}
