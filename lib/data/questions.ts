// Ngân hàng 15 câu hỏi mini game — giữ nguyên văn theo spec (mục 22). Không tự ý sửa nội dung học thuật.
// ponytail: câu hỏi nằm trong code thay vì collection `questions` — không cần seed; chuyển vào MongoDB khi cần sửa câu hỏi không qua deploy.

export type OptionKey = "A" | "B" | "C" | "D";

export type Question = {
  orderNumber: number;
  category: string;
  question: string;
  options: { key: OptionKey; text: string }[];
  correctAnswer: OptionKey;
  knowledgeSection: string; // id anchor trong /knowledge
  explanation: string;
  source: string;
  isFinalRound: boolean;
};

const GT = "Giáo trình Tư tưởng Hồ Chí Minh, Bộ GD&ĐT, 2019, Chương IV";

const opts = (a: string, b: string, c: string, d: string) =>
  (["A", "B", "C", "D"] as const).map((key, i) => ({ key, text: [a, b, c, d][i] }));

export const QUESTIONS: Question[] = [
  {
    orderNumber: 1,
    category: "Bản chất của Nhà nước",
    question: "Hồ Chí Minh khẳng định Nhà nước Việt Nam Dân chủ Cộng hòa mang bản chất giai cấp nào?",
    options: opts("Giai cấp nông dân", "Giai cấp công nhân", "Liên minh công – nông – trí thức", "Toàn dân (phi giai cấp)"),
    correctAnswer: "B",
    knowledgeSection: "ban-chat",
    explanation:
      'Nhà nước Việt Nam là nhà nước dân chủ nhưng không phải "Nhà nước toàn dân" theo nghĩa phi giai cấp; Nhà nước Việt Nam Dân chủ Cộng hòa mang bản chất giai cấp công nhân.',
    source: `${GT}, mục II.1.a, tr.79–80.`,
    isFinalRound: false,
  },
  {
    orderNumber: 2,
    category: "Bản chất của Nhà nước",
    question: "Bản chất giai cấp công nhân của Nhà nước thể hiện ở MẤY phương diện theo giáo trình?",
    options: opts("2", "3", "4", "5"),
    correctAnswer: "B",
    knowledgeSection: "ban-chat",
    explanation:
      "Ba phương diện: Đảng Cộng sản Việt Nam giữ vị trí và vai trò cầm quyền; Nhà nước có tính định hướng xã hội chủ nghĩa; nguyên tắc tổ chức và hoạt động là tập trung dân chủ.",
    source: `${GT}, mục II.1.a, tr.79–80.`,
    isFinalRound: false,
  },
  {
    orderNumber: 3,
    category: "Của dân",
    question: 'Hồ Chí Minh coi hình thức dân chủ nào là "dân chủ hoàn bị nhất"?',
    options: opts("Dân chủ đại diện", "Dân chủ gián tiếp", "Dân chủ trực tiếp", "Dân chủ tập trung"),
    correctAnswer: "C",
    knowledgeSection: "cua-dan",
    explanation:
      'Nhân dân thực thi quyền lực qua dân chủ trực tiếp và dân chủ gián tiếp; Hồ Chí Minh coi dân chủ trực tiếp là hình thức "dân chủ hoàn bị nhất".',
    source: `${GT}, mục II.1.b, tr.80–82.`,
    isFinalRound: false,
  },
  {
    orderNumber: 4,
    category: "Của dân",
    question: 'Câu "tất cả mọi quyền lực đều là của nhân dân" được trích từ tập mấy của Hồ Chí Minh Toàn tập?',
    options: opts("Tập 5", "Tập 8", "Tập 9", "Tập 12"),
    correctAnswer: "B",
    knowledgeSection: "cua-dan",
    explanation:
      '"Trong Nhà nước Việt Nam Dân chủ Cộng hoà của chúng ta, tất cả mọi quyền lực đều là của nhân dân" — Hồ Chí Minh Toàn tập, t.8, tr.262.',
    source: "Hồ Chí Minh Toàn tập, t.8, tr.262.",
    isFinalRound: false,
  },
  {
    orderNumber: 5,
    category: "Do dân",
    question: 'Phân biệt "dân là chủ" và "dân làm chủ": đâu là cách hiểu đúng?',
    options: opts(
      '"Dân là chủ" nhấn mạnh nghĩa vụ, "dân làm chủ" nhấn mạnh vị thế',
      '"Dân là chủ" xác định vị thế, "dân làm chủ" nhấn mạnh quyền lợi và nghĩa vụ',
      "Hai khái niệm đồng nghĩa, chỉ khác cách diễn đạt",
      '"Dân là chủ" thuộc mục "của dân", "dân làm chủ" thuộc mục "vì dân"',
    ),
    correctAnswer: "B",
    knowledgeSection: "do-dan",
    explanation:
      '"Dân là chủ" xác định vị thế của nhân dân đối với quyền lực nhà nước; "dân làm chủ" nhấn mạnh quyền lợi và nghĩa vụ của nhân dân với tư cách là người chủ.',
    source: `${GT}, mục II.1.c, tr.82.`,
    isFinalRound: false,
  },
  {
    orderNumber: 6,
    category: "Do dân",
    question: 'Câu "Muốn làm chủ được tốt, phải có năng lực làm chủ" trích từ Toàn tập tập mấy?',
    options: opts("Tập 8, tr.262", "Tập 9, tr.258", "Tập 12, tr.527", "Tập 10, tr.310"),
    correctAnswer: "C",
    knowledgeSection: "do-dan",
    explanation:
      '"Chúng ta những người lao động làm chủ nước nhà. Muốn làm chủ được tốt, phải có năng lực làm chủ" — Hồ Chí Minh Toàn tập, t.12, tr.527.',
    source: "Hồ Chí Minh Toàn tập, NXB Chính trị quốc gia, Hà Nội, 2011, t.12, tr.527.",
    isFinalRound: false,
  },
  {
    orderNumber: 7,
    category: "Trong sạch",
    question: "Hồ Chí Minh ký Sắc lệnh ấn định hình phạt tội đưa và nhận hối lộ vào ngày nào?",
    options: opts("02/09/1946", "19/08/1946", "27/11/1946", "09/11/1946"),
    correctAnswer: "C",
    knowledgeSection: "trong-sach",
    explanation: "Ngày 27-11-1946, Hồ Chí Minh ký Sắc lệnh ấn định hình phạt tội đưa và nhận hối lộ.",
    source: `${GT}, mục II.3.b, tr.88.`,
    isFinalRound: false,
  },
  {
    orderNumber: 8,
    category: "Trong sạch",
    question: "Theo Sắc lệnh năm 1946, mức phạt tù cho tội hối lộ là bao nhiêu?",
    options: opts(
      "1 năm đến 10 năm tù",
      "5 năm đến 20 năm tù khổ sai",
      "10 năm đến chung thân",
      "5 năm đến 20 năm tù khổ sai, phạt gấp ba số tiền hối lộ",
    ),
    correctAnswer: "B",
    knowledgeSection: "trong-sach",
    explanation:
      "Hình phạt từ 5 năm đến 20 năm tù khổ sai, và phải nộp phạt gấp đôi (không phải gấp ba) số tiền nhận hối lộ.",
    source: `${GT}, mục II.3.b, tr.88.`,
    isFinalRound: false,
  },
  {
    orderNumber: 9,
    category: "Trong sạch",
    question: "Hồ Chí Minh gọi tham ô, lãng phí, quan liêu là gì?",
    options: opts(
      "Ba căn bệnh trầm kha",
      "Giặc ngoại xâm",
      "Giặc nội xâm – giặc ở trong lòng",
      "Giặc nội xâm – nguy hiểm ngang giặc ngoại xâm",
    ),
    correctAnswer: "C",
    knowledgeSection: "trong-sach",
    explanation:
      'Hồ Chí Minh coi tham ô, lãng phí, quan liêu là "giặc nội xâm", "giặc ở trong lòng" — thứ giặc nguy hiểm hơn (không phải ngang) giặc ngoại xâm.',
    source: `${GT}, mục II.3.b, tr.88.`,
    isFinalRound: false,
  },
  {
    orderNumber: 10,
    category: "Vì dân",
    question: 'Trong mục "Nhà nước vì nhân dân", cán bộ được yêu cầu đóng vai trò gì?',
    options: opts(
      "Là người lãnh đạo nhân dân",
      "Là đày tớ của nhân dân",
      "Vừa là đày tớ, vừa là người lãnh đạo nhân dân",
      "Là công bộc và người bảo vệ nhân dân",
    ),
    correctAnswer: "C",
    knowledgeSection: "vi-dan",
    explanation: "Trong nhà nước vì dân, cán bộ vừa là đày tớ, vừa là người lãnh đạo nhân dân.",
    source: `${GT}, mục II.1.d, tr.83.`,
    isFinalRound: false,
  },
  {
    orderNumber: 11,
    category: "Kiểm soát quyền lực",
    question: "Hiến pháp nào quy định Nghị viện nhân dân có quyền kiểm soát Chính phủ?",
    options: opts("Hiến pháp 1959", "Hiến pháp 1946", "Hiến pháp 1980", "Hiến pháp 2013"),
    correctAnswer: "B",
    knowledgeSection: "trong-sach",
    explanation:
      "Hiến pháp năm 1946 đã quy định một số hình thức kiểm soát bên trong Nhà nước, ví dụ Nghị viện nhân dân có quyền kiểm soát Chính phủ.",
    source: `${GT}, mục II.3.a, tr.86–87.`,
    isFinalRound: false,
  },
  {
    orderNumber: 12,
    category: "Kiểm soát quyền lực",
    question: '"Muốn kiểm soát đúng thì cũng phải có ___ giúp mới được." Điền vào chỗ trống.',
    options: opts("Đảng", "Pháp luật", "Quần chúng", "Cán bộ có uy tín"),
    correctAnswer: "C",
    knowledgeSection: "trong-sach",
    explanation:
      'Nhân dân là chủ thể tối cao của quyền lực nên có quyền kiểm soát quyền lực nhà nước: "Muốn kiểm soát đúng thì cũng phải có quần chúng giúp mới được".',
    source: `${GT}, mục II.3.a, tr.86–87.`,
    isFinalRound: false,
  },
  {
    orderNumber: 13,
    category: "Phòng, chống tiêu cực",
    question: "Giáo trình nêu mấy biện pháp phòng chống tiêu cực trong Nhà nước?",
    options: opts("3", "4", "5", "6"),
    correctAnswer: "B",
    knowledgeSection: "trong-sach",
    explanation:
      "Bốn biện pháp: nâng cao trình độ dân chủ; pháp luật, kỷ luật nghiêm minh và kiểm tra thường xuyên; nghiêm minh trong xử lý, kết hợp giáo dục với xử phạt; cán bộ đi trước làm gương.",
    source: `${GT}, mục II.3.b, tr.87–90.`,
    isFinalRound: false,
  },
  {
    orderNumber: 14,
    category: "Phòng, chống tiêu cực",
    question: 'Biện pháp nào được giáo trình gọi là "giải pháp căn bản, lâu dài"?',
    options: opts(
      "Pháp luật nghiêm minh, kiểm tra thường xuyên",
      "Cán bộ đi trước làm gương",
      "Nâng cao trình độ dân chủ, phát huy quyền làm chủ của nhân dân",
      "Kết hợp giáo dục, cảm hóa với xử phạt",
    ),
    correctAnswer: "C",
    knowledgeSection: "trong-sach",
    explanation:
      "Nâng cao trình độ dân chủ trong xã hội, phát huy quyền làm chủ của nhân dân là giải pháp căn bản, lâu dài.",
    source: `${GT}, mục II.3.b, tr.87–90.`,
    isFinalRound: false,
  },
  {
    orderNumber: 15,
    category: "Phạm vi bài thuyết trình",
    question: "Mục II.2 về Nhà nước pháp quyền thuộc topic nào, và nhóm có trình bày sâu không?",
    options: opts(
      "HCM-TT-C4-01, nhóm có trình bày",
      "HCM-TT-C4-03, nhóm không trình bày sâu",
      "HCM-TT-C4-02, nhóm không trình bày sâu",
      "HCM-TT-C4-03, nhóm có trình bày nhưng lược bớt",
    ),
    correctAnswer: "B",
    knowledgeSection: "tong-ket",
    explanation:
      "Mục II.2 Nhà nước pháp quyền thuộc topic HCM-TT-C4-03; nhóm 04 (topic HCM-TT-C4-01) chỉ trình bày II.1 và II.3, không trình bày sâu II.2.",
    source: "Phạm vi và lưu ý của bài thuyết trình — Giáo trình, Chương IV, mục II.",
    isFinalRound: true,
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

// PRNG có seed: mọi serverless instance tính ra cùng một thứ tự cho cùng một phòng.
function seeded(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const KEYS: OptionKey[] = ["A", "B", "C", "D"];

/** Câu thứ n của phòng `seed`: xáo thứ tự câu (final round luôn cuối) và vị trí đáp án đúng chia đều A/B/C/D. */
export function getQuestion(seed: string, n: number): Question {
  const rand = seeded(seed);
  const order = [...shuffle(QUESTIONS.slice(0, -1), rand), QUESTIONS[QUESTIONS.length - 1]];
  const slots = shuffle(QUESTIONS.map((_, i) => KEYS[i % 4]), rand); // 4A 4B 4C 3D
  const q = order[n - 1];
  const correct = q.options.find((o) => o.key === q.correctAnswer)!.text;
  const texts = shuffle(q.options.filter((o) => o.key !== q.correctAnswer).map((o) => o.text), rand);
  texts.splice(KEYS.indexOf(slots[n - 1]), 0, correct);
  return { ...q, orderNumber: n, options: texts.map((text, i) => ({ key: KEYS[i], text })), correctAnswer: slots[n - 1] };
}
