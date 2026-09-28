import type { OptionKey } from "@/lib/data/questions";
import type { QuestionView } from "./useRoom";

type Props = {
  question: QuestionView;
  selected?: OptionKey | null;
  correct?: OptionKey | null;
  onPick?: (key: OptionKey) => void;
  disabled?: boolean;
  large?: boolean;
};

export function QuestionCard({ question, selected, correct, onPick, disabled, large }: Props) {
  return (
    <div className="space-y-4">
      <p className={`${large ? "text-3xl" : "text-xl"} font-semibold leading-snug`}>{question.question}</p>
      <div className={`grid gap-3 ${large ? "sm:grid-cols-2" : ""}`}>
        {question.options?.map((o) => {
          const tone =
            correct === o.key
              ? "border-emerald-500 bg-emerald-50"
              : correct && selected === o.key
                ? "border-brand bg-red-50"
                : selected === o.key
                  ? "border-navy bg-navy text-white"
                  : "border-slate-200 bg-white hover:border-navy";
          return (
            <button
              key={o.key}
              type="button"
              disabled={disabled || !onPick}
              onClick={() => onPick?.(o.key)}
              className={`flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors disabled:cursor-default ${tone} ${large ? "text-xl" : "text-base"}`}
            >
              <span className="font-mono font-bold">{o.key}</span>
              <span>{o.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Rules() {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-bold tracking-tight">RISK &amp; REWARD</h2>
      <p>
        Bạn bắt đầu với <b className="font-mono">100 POINTS</b>
      </p>
      <div>
        <h3 className="font-semibold">Mỗi vòng</h3>
        <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-slate-700">
          <li>Xem chủ đề câu hỏi, chọn mức cược: <b>10 / 20 / 30</b>.</li>
          <li>
            Câu hỏi xuất hiện — trả lời trong <b>15 giây</b> (hết giờ tính là sai).
          </li>
          <li>Xem đáp án, bấm <b>Tiếp tục</b> sang câu sau — mỗi người tự chơi theo tốc độ riêng.</li>
          <li>
            Đúng: <b>+ số điểm đã cược</b>.
          </li>
          <li>
            Sai: <b>- một nửa số điểm đã cược</b>.
          </li>
          <li>
            Điểm tối thiểu là <b>0</b>.
          </li>
        </ol>
      </div>
      <div>
        <h3 className="font-semibold">⭐ Ngôi sao hi vọng</h3>
        <p className="text-slate-700">
          Mỗi người có <b>2 lần</b>, bật khi chọn mức cược. Đúng: <b>+ gấp đôi</b> số điểm cược. Sai:{" "}
          <b>- gấp đôi</b> số điểm cược.
        </p>
      </div>
      <div>
        <h3 className="font-semibold">Final Round</h3>
        <p className="text-slate-700">
          Câu 15 cho phép cược tối đa <b>50 points</b> (không vượt quá điểm hiện có).
        </p>
      </div>
      <p className="text-slate-700">
        Xếp hạng theo <b>điểm</b>; bằng điểm thì ai có <b>tổng thời gian trả lời</b> ít hơn đứng trên.
      </p>
      <p className="border-t border-slate-200 pt-3 text-center text-sm font-semibold text-brand">
        Hiểu kiến thức · Đánh giá rủi ro · Leo bảng xếp hạng
      </p>
    </div>
  );
}
