import Link from "next/link";
import styles from "./page.module.css";

const branches = [
  {
    number: "01", title: "Nhà nước dân chủ", id: "dan-chu",
    topics: [
      { id: "ban-chat", title: "Bản chất giai cấp", ideas: ["Giai cấp công nhân", "Tính nhân dân và tính dân tộc"] },
      { id: "cua-dan", title: "Của nhân dân", ideas: ["Nhân dân nắm quyền lực", "Dân chủ trực tiếp và đại diện", "Giám sát, bãi miễn"] },
      { id: "do-dan", title: "Do nhân dân", ideas: ["Bầu ra và nuôi dưỡng", "Quyền đi cùng nghĩa vụ", "Năng lực làm chủ"] },
      { id: "vi-dan", title: "Vì nhân dân", ideas: ["Lợi ích của dân trên hết", "Cán bộ phục vụ nhân dân"] },
    ],
  },
  {
    number: "02", title: "Nhà nước pháp quyền", id: "phap-quyen",
    topics: [
      { id: "hop-hien", title: "Hợp hiến, hợp pháp", ideas: ["Hiến pháp dân chủ", "Tổng tuyển cử 1946"] },
      { id: "thuong-ton", title: "Thượng tôn pháp luật", ideas: ["Quản lý bằng pháp luật", "Pháp luật nghiêm minh", "Cán bộ nêu gương"] },
      { id: "nhan-nghia", title: "Pháp quyền nhân nghĩa", ideas: ["Bảo vệ quyền con người", "Kết hợp pháp trị và đức trị"] },
    ],
  },
  {
    number: "03", title: "Trong sạch, vững mạnh", id: "trong-sach",
    topics: [
      { id: "kiem-soat", title: "Kiểm soát quyền lực", ideas: ["Kiểm tra của Đảng", "Kiểm soát giữa các cơ quan", "Giám sát của nhân dân"] },
      { id: "tieu-cuc", title: "Phòng, chống tiêu cực", ideas: ["Chống đặc quyền, tham ô, quan liêu", "Kỷ luật nghiêm và nêu gương", "Phát huy giám sát của dân"] },
    ],
  },
] as const;

export default function ScenariosPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.kicker}>HCM202 · Sơ đồ tư duy</p>
        <h1>Ba mạch tư tưởng về Nhà nước của nhân dân</h1>
        <p>Từ chủ đề trung tâm, theo ba nhánh để thấy đầy đủ chín nội dung trong tài liệu. Nhấp vào từng ý để đọc phần giải thích và trích dẫn.</p>
      </header>
      <div className={styles.board}>
        <div className={styles.root}>
          <span>Tư tưởng Hồ Chí Minh</span>
          <strong>Nhà nước của nhân dân<br />do nhân dân, vì nhân dân</strong>
        </div>
        <svg className={styles.connectors} viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
          <path className={styles.lineOne} d="M600 0 C600 65 200 42 200 120" />
          <path className={styles.lineTwo} d="M600 0 L600 120" />
          <path className={styles.lineThree} d="M600 0 C600 65 1000 42 1000 120" />
        </svg>
        <section className={styles.map} aria-label="Sơ đồ tư duy ba mạch tư tưởng về nhà nước">
          {branches.map((branch) => (
            <article className={styles.branch} key={branch.id}>
              <Link className={styles.branchTitle} href={`/knowledge#${branch.id}`}>
                <span>{branch.number}</span><h2>{branch.title}</h2>
              </Link>
              <div className={styles.topics}>
                {branch.topics.map((topic) => (
                  <div className={styles.topic} key={topic.id}>
                    <Link href={`/knowledge#${topic.id}`}>{topic.title}<span aria-hidden="true">↗</span></Link>
                    <ul>{topic.ideas.map((idea) => <li key={idea}>{idea}</li>)}</ul>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
      <div className={styles.footer}><Link href="/knowledge">Đọc toàn bộ nội dung và trích dẫn <span aria-hidden="true">↗</span></Link></div>
    </div>
  );
}
