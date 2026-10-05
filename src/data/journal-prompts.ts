/** Data contoh prompt jurnal yang dibuat admin. Static: ganti dengan API. */

export type QuestionType = "text" | "scale" | "choice" | "mood";

export type PromptQuestion = {
  id: string;
  type: QuestionType;
  label: string;
  /** Hanya untuk `choice`. */
  options?: string[];
};

export type PromptStatus = "terbit" | "terjadwal" | "draf";

export const PROMPT_STATUS: Record<PromptStatus, { label: string; tone: string }> = {
  terbit: { label: "Terbit", tone: "bg-sage-tint text-primary" },
  terjadwal: { label: "Terjadwal", tone: "bg-secondary-container text-secondary" },
  draf: { label: "Draf", tone: "bg-surface-container-high text-text-muted" },
};

/** Prompt yang sudah terbit tidak bisa diedit lagi. */
export const isEditable = (p: { status: PromptStatus }) => p.status !== "terbit";

export type JournalPrompt = {
  id: string;
  title: string;
  subtitle: string;
  /** Tanggal prompt muncul di jurnal peserta (ISO). */
  date: string;
  status: PromptStatus;
  questions: PromptQuestion[];
};

export const QUESTION_TYPES: { value: QuestionType; label: string; icon: string }[] = [
  { value: "text", label: "Teks Bebas", icon: "edit_note" },
  { value: "scale", label: "Skala 1-10", icon: "linear_scale" },
  { value: "choice", label: "Opsi Ganda", icon: "ballot" },
  { value: "mood", label: "Mood Check", icon: "mood" },
];

export const SCALE_MAX = 10;

/** Prompt yang tampil di /journal/tulis (refleksi tertunda 27 Sep 2026). */
export const PENDING_PROMPT_DATE = "2026-09-27";

export const JOURNAL_PROMPTS: JournalPrompt[] = [
  {
    id: "P-007",
    title: "Rencana Keuangan Bersama",
    subtitle: "Membuka percakapan tentang tujuan finansial keluarga.",
    date: "2026-10-13",
    status: "draf",
    questions: [
      {
        id: "q1",
        type: "choice",
        label: "Seberapa terbuka kalian membicarakan keuangan?",
        options: ["Sangat terbuka", "Cukup terbuka", "Masih sungkan"],
      },
      { id: "q2", type: "text", label: "Satu tujuan finansial yang ingin kalian capai bersama?" },
    ],
  },
  {
    id: "P-006",
    title: "Evaluasi Pekan Pertama",
    subtitle: "Menengok kembali langkah kecil yang sudah dijalani bersama.",
    date: "2026-10-06",
    status: "terjadwal",
    questions: [
      { id: "q1", type: "scale", label: "Seberapa dekat kamu merasa dengan pasangan pekan ini?" },
      { id: "q2", type: "text", label: "Apa perubahan kecil paling bermakna yang kamu rasakan?" },
    ],
  },
  {
    id: "P-005",
    title: "Kelola Ekspektasi",
    subtitle: "Menyampaikan harapan dengan lembut tanpa menuntut.",
    date: "2026-09-29",
    status: "terbit",
    questions: [
      { id: "q1", type: "mood", label: "Bagaimana perasaanmu hari ini?" },
      { id: "q2", type: "text", label: "Ekspektasi apa yang belum sempat kamu ucapkan kepada pasanganmu?" },
    ],
  },
  {
    id: "P-004",
    title: "Regulasi Ego Saat Lelah",
    subtitle: "Mengenali pemicu saat tubuh dan hati sedang penat.",
    date: "2026-09-28",
    status: "terbit",
    questions: [
      { id: "q1", type: "mood", label: "Bagaimana perasaanmu hari ini?" },
      {
        id: "q2",
        type: "choice",
        label: "Saat lelah, apa yang paling sering memicu egomu?",
        options: ["Nada bicara", "Pekerjaan rumah", "Merasa tidak didengar", "Lainnya"],
      },
      { id: "q3", type: "text", label: "Bagaimana kamu ingin meresponsnya lain kali?" },
    ],
  },
  {
    id: "P-003",
    title: "Hal Kecil yang Dihargai",
    subtitle: "Merajut rasa syukur atas perhatian yang sering terlewatkan.",
    date: PENDING_PROMPT_DATE,
    status: "terbit",
    questions: [
      { id: "q1", type: "mood", label: "Bagaimana perasaanmu hari ini?" },
      {
        id: "q2",
        type: "text",
        label: "Apa satu hal kecil yang pasanganmu lakukan kemarin yang membuatmu merasa dihargai?",
      },
      { id: "q3", type: "scale", label: "Seberapa dihargai kamu merasa kemarin?" },
      {
        id: "q4",
        type: "choice",
        label: "Bahasa kasih mana yang paling terasa?",
        options: ["Kata-kata penguatan", "Waktu berkualitas", "Pelayanan", "Sentuhan", "Hadiah"],
      },
    ],
  },
  {
    id: "P-002",
    title: "Seni Mendengarkan",
    subtitle: "Hadir sepenuhnya saat pasangan bercerita.",
    date: "2026-09-26",
    status: "terbit",
    questions: [
      { id: "q1", type: "text", label: "Kapan terakhir kali kamu benar-benar mendengarkan tanpa menyela?" },
      { id: "q2", type: "scale", label: "Seberapa didengar kamu merasa oleh pasanganmu?" },
    ],
  },
  {
    id: "P-001",
    title: "Niat & Visi Sakral",
    subtitle: "Kembali pada alasan terdalam membangun rumah tangga.",
    date: "2026-09-25",
    status: "terbit",
    questions: [
      { id: "q1", type: "text", label: "Apa niat terdalam yang membuatmu memilih membangun rumah tangga bersama pasanganmu?" },
    ],
  },
];
