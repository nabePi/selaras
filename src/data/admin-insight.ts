/** Data contoh untuk halaman Agregat Insight Emosional. Ganti dengan API. */
import { INITIAL_COUPLES } from "./admin-couples";

export const PRIVACY_THRESHOLD = { n: 30, min: 5 };

export const INSIGHT_KPIS = [
  { icon: "favorite", tone: "bg-sage-tint text-primary", label: "Indeks Kehangatan Komunikasi", value: "8.4", unit: "/ 10", badge: "+1.8 Skor", badgeIcon: "arrow_upward", badgeTone: "bg-accent-mint/60 text-on-primary-fixed", note: "Baseline Pre-Test berada di angka 6.6. Terjadi pelunakan nada bicara saat diskusi petang." },
  { icon: "hearing", tone: "bg-secondary-container/40 text-secondary", label: "Rasa Didengarkan Pasangan", value: "86%", unit: "Pasutri", badge: "26 Pasutri", badgeIcon: "trending_up", badgeTone: "bg-secondary-fixed text-on-secondary-fixed-variant", note: "Mencatat peningkatan signifikan pasca modul ‘Mendengar Tanpa Menyela’ di Sesi 2." },
  { icon: "balance", tone: "bg-accent-sunray/40 text-tertiary", label: "Beban Mental Domestik", value: "-42%", unit: "Keluhan", badge: "Berkurang", badgeIcon: "south_east", badgeTone: "bg-accent-sunray text-on-tertiary-fixed", note: "Pasangan mulai secara sadar mengadopsi kesepakatan pembagian peran tanpa defensif." },
  { icon: "psychology_alt", tone: "bg-sky-calm/30 text-primary-container", label: "Skor Relasional Berjalan", value: "78.6", unit: "/ 100", badge: "Target ≥ 85.0", badgeIcon: "", badgeTone: "bg-surface-container-high text-on-surface-variant", note: "Pre-Test rerata 71.2 (+7.4 poin). Indikator kematangan spiritual mencatat lonjakan paling stabil." },
] as const;

export const MOOD = {
  checkIns: 210,
  dominant: { percent: 64, label: "Harmonis" },
  items: [
    { label: "Hangat, Bersyukur & Selaras", percent: 64, count: 134, stroke: "#667a5f", dot: "bg-primary-container", text: "text-primary" },
    { label: "Tenang & Menerima", percent: 22, count: 46, stroke: "#DCCEBF", dot: "bg-canvas-sand", text: "text-tertiary" },
    { label: "Lelah Fisik & Perlu Rehat", percent: 10, count: 21, stroke: "#edbab4", dot: "bg-secondary-fixed-dim", text: "text-secondary" },
    { label: "Butuh Jeda & Komunikasi Terbimbing", percent: 4, count: 9, stroke: "#E8978D", dot: "bg-accent-coral", text: "text-error" },
  ],
};

export const WEEKLY_STRAIN = [
  { day: "Sen", value: 3.8, bar: "bg-sage-tint hover:bg-sage-medium", peak: false },
  { day: "Sel", value: 4.2, bar: "bg-sage-tint hover:bg-sage-medium", peak: false },
  { day: "Rab", value: 5.5, bar: "bg-secondary-fixed hover:bg-secondary-fixed-dim", peak: false },
  { day: "Kam", value: 7.9, bar: "bg-accent-coral hover:bg-accent-coral/80", peak: true },
  { day: "Jum", value: 7.2, bar: "bg-secondary hover:bg-secondary/90", peak: true },
  { day: "Sab", value: 3.1, bar: "bg-primary-container hover:bg-primary", peak: false },
  { day: "Ahd", value: 2.4, bar: "bg-primary hover:bg-primary/90", peak: false },
];

export const PRE_POST = [
  { label: "Keterbukaan Emosional", pre: 5.2, post: 7.4, delta: "+42%" },
  { label: "Resolusi Konflik Halus", pre: 4.8, post: 7.1, delta: "+47%" },
  { label: "Ibadah Berjamaah Pasutri", pre: 6.1, post: 8.6, delta: "+40%" },
];

export type PromptAggregate =
  | {
      id: string;
      kind: "scale";
      badge: string;
      badgeTone: string;
      typeLabel: string;
      question: string;
      note: string;
      before: { label: string; value: number };
      after: { label: string; value: number };
      distribution: { label: string; text: string };
    }
  | {
      id: string;
      kind: "choice";
      badge: string;
      badgeTone: string;
      typeLabel: string;
      question: string;
      note: string;
      options: { label: string; percent: number; responses: number; bar: string; text: string }[];
    };

export const PROMPT_AGGREGATES: PromptAggregate[] = [
  {
    id: "s1h3",
    kind: "scale",
    badge: "Sesi 1 • Hari Ke-3",
    badgeTone: "bg-secondary-fixed text-on-secondary-fixed-variant",
    typeLabel: "Tipe: Skala Likert 1-10",
    question: "Seberapa mudah Anda meminta maaf lebih dulu saat terjadi gesekan kecil tanpa menunggu pasangan?",
    note: "Diukur kembali saat penutupan Sesi 2 untuk melihat reduksi ego pribadi.",
    before: { label: "Sesi 1 (Awal Pendampingan)", value: 5.6 },
    after: { label: "Sesi 2 (Pasca Modul Empati)", value: 7.8 },
    distribution: { label: "Sebaran Pasutri di Skor ≥8.0", text: "19 dari 30 Pasang (63%)" },
  },
  {
    id: "s2h5",
    kind: "choice",
    badge: "Sesi 2 • Hari Ke-5",
    badgeTone: "bg-accent-mint text-on-primary-fixed",
    typeLabel: "Tipe: Single Choice",
    question: "Apa bahasa kasih dari pasangan yang paling membuat hati Anda merasa tersentuh pekan ini?",
    note: "Mengevaluasi kepekaan pasangan terhadap kebutuhan emosional non-verbal.",
    options: [
      { label: "Pelayanan Tulus (Act of Service)", percent: 48, responses: 29, bar: "bg-primary", text: "text-primary" },
      { label: "Kata-kata Penguat Jiwa (Words of Affirmation)", percent: 28, responses: 17, bar: "bg-tertiary-container", text: "text-tertiary" },
      { label: "Waktu Berkualitas Khidmat (Quality Time)", percent: 16, responses: 10, bar: "bg-secondary-fixed-dim", text: "text-secondary" },
      { label: "Sentuhan Fisik Menenangkan (Physical Touch)", percent: 8, responses: 5, bar: "bg-canvas-sand", text: "text-text-muted" },
    ],
  },
];

export type CoachNote = {
  id: string;
  shortName: string;
  initials: string;
  streak: number;
  preTest: number;
  compliance: number;
  author: string;
  note: string;
  status: "ready" | "writing";
  tone: { avatar: string; streak: string };
};

const NOTE_POOL = [
  "Komunikasi kalian berdua semakin lentur. Pertahankan ritual pillow talk setiap malam sebelum tidur.",
  "Terlihat kesediaan untuk mendengar tanpa terburu-buru memberi solusi. Lanjutkan apresiasi kecil setiap pagi.",
  "Kesepakatan pembagian peran mulai terbentuk dengan baik. Jaga waktu hening tanpa gawai di malam hari.",
  "Perkembangan regulasi emosi saat lelah sangat menggembirakan. Teruskan jeda tiga detik sebelum merespons.",
  "Kejujuran dalam refleksi semakin dalam. Perkuat doa bersama sebagai jangkar spiritual keluarga.",
  "Pasangan menunjukkan kerendahan hati untuk meminta maaf lebih dulu. Rayakan kemajuan kecil ini bersama.",
];

const DESIGN_NOTES: Partial<Record<number, { author: string; note: string; streak: number; preTest: number; compliance: number }>> = {
  0: { author: "Coach Afifah", streak: 5, preTest: 74, compliance: 100, note: "Komunikasi kalian berdua semakin lentur di Sesi 2. Dimas mulai membuka ruang mendengar tanpa terburu-buru memberikan solusi teknis. Lanjutkan ritual pillow talk 15 menit setiap malam sebelum tidur." },
  1: { author: "Ustaz Ahmad", streak: 4, preTest: 68, compliance: 85, note: "Rizky menunjukkan kerendahan hati luar biasa saat mengurai lelah kerja tanpa memproyeksikannya ke Sarah. Pertahankan doa bersama ba’da Maghrib sebagai jangkar spiritual keluarga muda ini." },
  2: { author: "Coach Afifah", streak: 5, preTest: 72, compliance: 92, note: "Perkembangan kesepakatan pembagian tugas rumah tangga sangat menggembirakan. Pertahankan apresiasi verbal kecil di pagi hari." },
};

const AVATAR_TONES = [
  { avatar: "bg-sage-tint text-primary", streak: "bg-accent-mint text-on-primary-fixed" },
  { avatar: "bg-secondary-fixed text-on-secondary-fixed-variant", streak: "bg-secondary-container text-on-secondary-container" },
  { avatar: "bg-accent-sunray/60 text-tertiary", streak: "bg-accent-mint text-on-primary-fixed" },
];

const WRITING_INDEXES = new Set([2, 9, 14, 19, 24, 28]);

/** Tiga baris pertama mengikuti desain; sisanya diambil dari peserta aktif Cohort 04. */
const NOTE_SUBJECTS: { id: string; shortName: string; initials: string }[] = [
  { id: "SL-2026-048", shortName: "Larasati & Dimas", initials: "L&D" },
  { id: "SL-2026-061", shortName: "Sarah & Rizky", initials: "S&R" },
  { id: "SL-2026-062", shortName: "Fauzan & Nabila", initials: "F&N" },
  ...INITIAL_COUPLES.filter(
    (c) => (c.status === "active" || c.status === "backlog") && c.id !== "SL-2026-048",
  )
    .slice(0, 27)
    .map((c) => ({ id: c.id, shortName: c.shortName, initials: c.initials })),
];

/** 30 pasutri Cohort 04 yang perlu catatan personal untuk Growth Report. */
export const INITIAL_COACH_NOTES: CoachNote[] = NOTE_SUBJECTS.map((subject, i) => {
  const d = DESIGN_NOTES[i];
  const writing = WRITING_INDEXES.has(i);
  return {
    ...subject,
    streak: d?.streak ?? 2 + (i % 4),
    preTest: d?.preTest ?? 60 + ((i * 7) % 20),
    compliance: d?.compliance ?? 70 + ((i * 11) % 30),
    author: d?.author ?? (i % 2 ? "Ustaz Ahmad" : "Coach Afifah"),
    note: d?.note ?? (writing ? "" : NOTE_POOL[i % NOTE_POOL.length]),
    status: writing ? "writing" : "ready",
    tone: AVATAR_TONES[i % AVATAR_TONES.length],
  };
});
