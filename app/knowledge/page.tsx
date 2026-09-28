import Link from "next/link";
import { getDocument } from "@/lib/data/document";
import styles from "./page.module.css";

function inline(text: string) {
  return text
    .replace(/\\([.])/g, "$1")
    .split(/(\*\*.*?\*\*|_.*?_|\*.*?\*)/g)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      if (
        (part.startsWith("_") && part.endsWith("_")) ||
        (part.startsWith("*") && part.endsWith("*"))
      )
        return <em key={index}>{part.slice(1, -1)}</em>;
      return part;
    });
}

export default function KnowledgePage() {
  const chapters = getDocument();

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>Tài liệu học tập · HCM202</p>
          <h1>
            Tư tưởng Hồ Chí Minh về Nhà nước của nhân dân, do nhân dân, vì nhân
            dân
          </h1>

          <Link href="/scenarios" className={styles.mapLink}>
            Xem sơ đồ tư duy <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      <div className={styles.shell}>
        <nav className={styles.sidebar} aria-label="Mục lục bài học">
          <p className={styles.sidebarTitle}>Mục lục</p>
          {chapters.map((chapter, index) => (
            <div className={styles.navGroup} key={chapter.id}>
              <a className={styles.chapterLink} href={`#${chapter.id}`}>
                <span>0{index + 1}</span>
                {chapter.title.replace(/^\d+\.\s*/, "")}
              </a>
              {chapter.topics.map((topic) => (
                <a key={topic.id} href={`#${topic.id}`}>
                  {topic.title.replace(/^[a-z]\.\s*/i, "")}
                </a>
              ))}
            </div>
          ))}
        </nav>

        <main className={styles.content}>
          {chapters.map((chapter, chapterIndex) => (
            <section
              className={styles.chapter}
              id={chapter.id}
              key={chapter.id}
            >
              <div className={styles.chapterHead}>
                <span className={styles.chapterNumber}>
                  0{chapterIndex + 1}
                </span>
                <h2>{chapter.title.replace(/^\d+\.\s*/, "")}</h2>
              </div>
              {chapter.topics.map((topic) => (
                <article className={styles.topic} id={topic.id} key={topic.id}>
                  <h3>{topic.title.replace(/^[a-z]\.\s*/i, "")}</h3>
                  <div className={styles.points}>
                    {topic.points.map((point, index) => (
                      <div
                        className={styles.point}
                        style={{ marginLeft: `${point.depth * 25}px` }}
                        key={`${topic.id}-${index}`}
                      >
                        <span className={styles.marker} aria-hidden="true">
                          {point.marker}
                        </span>
                        <div className={styles.pointContent}>
                          <p>{inline(point.text)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          ))}
          <section id="tong-ket" className={styles.summary}>
            <h2>Tổng kết</h2>
            <p>
              Nhà nước của nhân dân, do nhân dân, vì nhân dân gắn quyền làm chủ
              của người dân với tính hợp hiến, thượng tôn pháp luật và yêu cầu
              kiểm soát quyền lực. Một bộ máy trong sạch, vững mạnh cần thực
              hành dân chủ, nêu gương và phòng chống tiêu cực.
            </p>
            <Link href="/scenarios">
              Ôn lại bằng sơ đồ tư duy <span aria-hidden="true">↗</span>
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
}
