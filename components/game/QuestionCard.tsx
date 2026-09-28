import type { OptionKey } from "@/lib/data/questions";
import type { QuestionView } from "./useRoom";
import styles from "./arena.module.css";

type Props = {
  question: QuestionView;
  selected?: OptionKey | null;
  correct?: OptionKey | null;
  onPick?: (key: OptionKey) => void;
  disabled?: boolean;
};

export function QuestionCard({ question, selected, correct, onPick, disabled }: Props) {
  return (
    <div>
      <h2 className={styles.questionText}>{question.question}</h2>
      <div className={styles.answers}>
        {question.options?.map((option) => {
          const tone = correct === option.key ? styles.answerCorrect
            : correct && selected === option.key ? styles.answerWrong
            : selected === option.key ? styles.answerSelected : "";
          return (
            <button
              key={option.key}
              type="button"
              disabled={disabled || !onPick}
              onClick={() => onPick?.(option.key)}
              className={`${styles.answer} ${tone}`}
            >
              <span className={styles.answerKey}>{option.key}</span>
              <span className={styles.answerText}>{option.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Rules() {
  return (
    <section className={styles.rulesPanel} aria-label="Luật chơi">
      <h2>Luật chơi trong 30 giây</h2>
      <div className={styles.rulesGrid}>
        <div className={styles.ruleItem}><strong>100</strong><span>điểm để bắt đầu</span></div>
        <div className={styles.ruleItem}><strong>15s</strong><span>để trả lời mỗi câu</span></div>
        <div className={styles.ruleItem}><strong>2 ★</strong><span>lượt nhân đôi điểm</span></div>
      </div>
      <p className={styles.rulesDetail}>
        <b>Chọn mức điểm</b> 10 / 20 / 30 trước khi thấy câu hỏi. Trả lời đúng được cộng mức điểm đã chọn; sai bị trừ một nửa. Ngôi sao hi vọng nhân đôi số điểm cộng hoặc trừ. Câu cuối có thể chọn đến 50 điểm. Sau mỗi câu, xem đáp án và lời giải rồi tự bấm sang câu tiếp theo.
      </p>
    </section>
  );
}
