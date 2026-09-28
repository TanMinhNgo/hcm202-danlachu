import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>HCM202 · Tư tưởng Hồ Chí Minh</p>
            <h1>Nhà nước của nhân dân, do nhân dân, vì nhân dân</h1>
            <p className={styles.lead}>
              Khám phá tư tưởng Hồ Chí Minh về quyền làm chủ của nhân dân, nhà
              nước pháp quyền và bộ máy trong sạch, vững mạnh.
            </p>
            <div className={styles.actions}>
              <Link href="/knowledge" className={styles.primary}>
                Đọc nội dung
              </Link>
              <Link href="/scenarios" className={styles.secondary}>
                Xem sơ đồ tư duy <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
          <aside className={styles.quote}>
            <span className={styles.quoteMark} aria-hidden="true">
              “
            </span>
            <blockquote>
              Việc gì có lợi cho dân thì làm. Việc gì có hại cho dân thì phải
              tránh.
            </blockquote>
            <p>Hồ Chí Minh: Toàn tập, t. 4, tr. 21</p>
          </aside>
        </div>
      </section>

      <section className={styles.chapters}>
        <div className={styles.sectionIntro}>
          <h2>Ba nội dung chính</h2>
          <p>
            Đi từ bản chất và quyền làm chủ, qua nền tảng pháp lý, đến việc kiểm
            soát quyền lực và phòng chống tiêu cực.
          </p>
        </div>
        <div className={styles.chapterGrid}>
          <Link href="/knowledge#dan-chu" className={styles.chapter}>
            <span className={styles.number}>01</span>
            <h3>Nhà nước dân chủ</h3>
            <p>
              Bản chất giai cấp công nhân thống nhất với tính nhân dân, tính dân
              tộc; nhân dân là chủ và làm chủ.
            </p>
            <span className={styles.chapterFoot}>
              Bản chất · Của dân · Do dân · Vì dân{" "}
              <span aria-hidden="true">↗</span>
            </span>
          </Link>
          <Link href="/knowledge#phap-quyen" className={styles.chapter}>
            <span className={styles.number}>02</span>
            <h3>Nhà nước pháp quyền</h3>
            <p>
              Nhà nước hợp hiến, hợp pháp; quản lý bằng pháp luật, bảo vệ con
              người và kết hợp pháp trị với đức trị.
            </p>
            <span className={styles.chapterFoot}>
              Hợp hiến · Thượng tôn · Nhân nghĩa{" "}
              <span aria-hidden="true">↗</span>
            </span>
          </Link>
          <Link href="/knowledge#trong-sach" className={styles.chapter}>
            <span className={styles.number}>03</span>
            <h3>Trong sạch, vững mạnh</h3>
            <p>
              Kiểm soát quyền lực từ nhiều phía, phát huy giám sát của nhân dân
              và loại bỏ các hiện tượng tiêu cực.
            </p>
            <span className={styles.chapterFoot}>
              Kiểm soát · Phòng chống tiêu cực <span aria-hidden="true">↗</span>
            </span>
          </Link>
        </div>
      </section>

      <section className={styles.nextStep}>
        <div>
          <h2>Học xong, thử ghi nhớ</h2>
          <p>
            Xem toàn bộ cấu trúc bằng sơ đồ tư duy hoặc tự kiểm tra với mini
            game.
          </p>
        </div>
        <div className={styles.nextLinks}>
          <Link href="/scenarios">Mở sơ đồ tư duy</Link>
          <Link href="/game">Tham gia Mini Game</Link>
        </div>
      </section>
    </div>
  );
}
