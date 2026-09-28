// TODO(nội dung): điền nội dung Knowledge Hub + 4 tình huống theo spec mục 9–15.
// `id` là anchor mà mini game link tới (/knowledge#id) — đừng đổi id.

export type Section = {
  id: string;
  title: string;
  criterion?: string; // câu hỏi phân tích (tiêu chí)
  textbook: string[]; // NỘI DUNG TỪ GIÁO TRÌNH
  quotes: { text: string; source?: string }[];
  source: string;
  scenario?: string; // TÌNH HUỐNG GIẢ ĐỊNH PHỤC VỤ HỌC TẬP
  analysis?: string; // PHÂN TÍCH CỦA NHÓM
};

export const SECTIONS: Section[] = [
  { id: "ban-chat", title: "Bản chất của Nhà nước", textbook: [], quotes: [], source: "" },
  { id: "cua-dan", title: "Nhà nước của nhân dân — Tiêu chí 1", textbook: [], quotes: [], source: "" },
  { id: "do-dan", title: "Nhà nước do nhân dân — Tiêu chí 2", textbook: [], quotes: [], source: "" },
  { id: "vi-dan", title: "Nhà nước vì nhân dân — Tiêu chí 3", textbook: [], quotes: [], source: "" },
  { id: "trong-sach", title: "Nhà nước trong sạch, vững mạnh — Tiêu chí 4", textbook: [], quotes: [], source: "" },
  { id: "tong-ket", title: "Tổng kết: từ nguyên tắc đến tiêu chí", textbook: [], quotes: [], source: "" },
];
