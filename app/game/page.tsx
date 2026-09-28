import Link from "next/link";
import { ArrowUpRight, Clock3, Star, Trophy, Zap } from "lucide-react";
import { QUESTIONS } from "@/lib/data/questions";
import { Rules } from "@/components/game/QuestionCard";
import styles from "@/components/game/arena.module.css";

export default function GamePage() {
  const preview = QUESTIONS[0];

  return (
    <div className={styles.arena}>
      <div className={styles.shell}>
        <section className={styles.landingHero}>
          <div className={styles.landingCopy}>
            <p className={styles.eyebrow}>HCM202 · Mini game tương tác</p>
            <h1 className={styles.display}>TRI THỨC <span>BỨT PHÁ</span></h1>
            <p className={styles.subhead}>
              Mỗi câu hỏi là một thử thách mới: chọn mức điểm, trả lời trong 15 giây và bứt lên bảng xếp hạng.
            </p>
            <div className={styles.landingActions}>
              <Link className={styles.buttonPrimary} href="/game/join">Vào đấu trường <ArrowUpRight size={18} /></Link>
              <Link className={styles.buttonSecondary} href="/game/host">Tạo phòng chơi</Link>
            </div>
            <div className={styles.landingMeta}>
              <span><Zap size={17} /> 15 câu thử thách</span>
              <span><Clock3 size={17} /> 15 giây mỗi câu</span>
              <span><Trophy size={17} /> Đua hạng trực tiếp</span>
            </div>
          </div>

          <div className={styles.showcase} aria-label="Xem trước một câu hỏi trong game">
            <div className={styles.showcaseTop}>
              <span>VÒNG 01 / 15</span>
              <span className={styles.showcasePulse}>ĐẤU TRƯỜNG KIẾN THỨC</span>
            </div>
            <p className={styles.showcaseQuestion}>{preview.question}</p>
            <div className={styles.showcaseOptions}>
              {preview.options.map((option) => <div key={option.key}><b>{option.key}</b>{option.text}</div>)}
            </div>
            <div className={styles.showcaseFooter}>
              <span>CHỦ ĐỀ: {preview.category}</span>
              <span>ĐIỂM KHỞI ĐẦU <strong>100</strong></span>
            </div>
          </div>
        </section>

        <div className={styles.landingLower}>
          <div className={styles.featurePanel}>
            <Star size={33} color="#f2c66e" strokeWidth={1.5} />
            <h2>Một quyết định đúng có thể đổi cả thứ hạng.</h2>
            <p>Chọn mức điểm trước khi câu hỏi xuất hiện. Dùng ngôi sao hi vọng đúng lúc để nhân đôi cơ hội.</p>
          </div>
          <Rules />
        </div>
      </div>
    </div>
  );
}
