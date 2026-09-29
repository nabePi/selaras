/** Data contoh untuk halaman Kelola Prompt & Hadis. Ganti dengan API. */

export const PROMPT_SESSIONS = [
  { value: 1, label: "Sesi 1: Pondasi Niat & Sakinah" },
  { value: 2, label: "Sesi 2: Menembus Batas Komunikasi" },
  { value: 3, label: "Sesi 3: Finansial Berkah Bersama" },
  { value: 4, label: "Sesi 4: Mengurai Gesekan Domestik" },
] as const;

export const WEEKDAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Ahad"] as const;

export const DAYS_PER_SESSION = 7;
/** Tanggal Hari ke-1 Sesi 1 (ISO) */
export const CYCLE_START = "2026-09-24";

export type ResponseType = "text" | "scale" | "choice" | "mood";

export const RESPONSE_TYPES: { value: ResponseType; label: string; icon: string }[] = [
  { value: "text", label: "Teks Bebas", icon: "edit_note" },
  { value: "scale", label: "Skala 1-10", icon: "linear_scale" },
  { value: "choice", label: "Opsi Ganda", icon: "ballot" },
  { value: "mood", label: "Mood Check", icon: "mood" },
];

export const PROMPT_MAX_LENGTH = 180;

export type Hadis = {
  id: string;
  topic: string;
  toneClass: string;
  text: string;
  source: string;
  grade?: string;
};

export const HADIS_LIBRARY: Hadis[] = [
  {
    id: "HD-101",
    topic: "Kebaikan pada Keluarga",
    toneClass: "bg-sage-tint text-on-surface",
    text: "Sebaik-baik kalian adalah yang paling baik terhadap keluarganya, dan aku adalah orang yang paling baik terhadap keluargaku.",
    source: "HR. At-Tirmidzi No. 3895",
    grade: "Takhrij Shahih",
  },
  {
    id: "HD-104",
    topic: "Kelembutan Hati",
    toneClass: "bg-accent-mint/70 text-on-surface",
    text: "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya...",
    source: "QS. Ar-Rum: 21",
  },
  {
    id: "HD-088",
    topic: "Meredam Amarah",
    toneClass: "bg-secondary-container text-on-secondary-container",
    text: "Orang yang kuat itu bukanlah yang menang dalam bergulat, melainkan orang yang mampu mengendalikan dirinya ketika sedang marah.",
    source: "HR. Bukhari & Muslim",
  },
  {
    id: "HD-120",
    topic: "Memaafkan & Maklum",
    toneClass: "bg-accent-sunray text-on-surface",
    text: "Janganlah seorang mukmin membenci wanita mukminah (istrinya). Jika ia membenci satu akhlak darinya, tentu ia ridha dengan akhlaknya yang lain.",
    source: "HR. Muslim No. 1469",
  },
];

export type ScheduleState = "done" | "active" | "scheduled" | "locked" | "draft";

export type ScheduleItem = {
  session: number;
  day: number;
  title: string;
  prompt: string;
  responseType: ResponseType;
  hadisId: string;
  /** ISO date */
  date: string;
  state: ScheduleState;
  responseRate?: number;
};

export const slotKey = (session: number, day: number) => `${session}-${day}`;

export function dateForSlot(session: number, day: number) {
  const d = new Date(`${CYCLE_START}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + (session - 1) * DAYS_PER_SESSION + (day - 1));
  return d.toISOString().slice(0, 10);
}

const S1 = (
  day: number,
  title: string,
  prompt: string,
  responseType: ResponseType,
  hadisId: string,
  state: ScheduleState,
  responseRate?: number,
): ScheduleItem => ({ session: 1, day, title, prompt, responseType, hadisId, date: dateForSlot(1, day), state, responseRate });

export const INITIAL_SCHEDULE: ScheduleItem[] = [
  S1(1, "Niat & Visi Sakral", "Apa niat terdalam yang membuatmu memilih membangun rumah tangga bersama pasanganmu?", "text", "HD-104", "done", 94),
  S1(2, "Bahasa Kasih Primer", "Bahasa kasih apa yang paling membuatmu merasa dicintai oleh pasanganmu?", "choice", "HD-101", "done", 91),
  S1(3, "Seni Mendengarkan", "Kapan terakhir kali kamu benar-benar mendengarkan pasanganmu tanpa menyela? Apa yang kamu rasakan?", "text", "HD-088", "done", 88),
  S1(4, "Regulasi Ego Saat Lelah", "Saat lelah, apa yang biasanya memicu egomu, dan bagaimana kamu ingin meresponsnya?", "mood", "HD-088", "done", 86),
  S1(5, "Hal Kecil yang Dihargai", "Apa satu hal kecil yang pasanganmu lakukan kemarin yang membuat hatimu merasa dihargai?", "text", "HD-101", "active", 78),
  S1(6, "Kelola Ekspektasi", "Ekspektasi apa yang belum sempat kamu ucapkan kepada pasanganmu, dan bagaimana kamu ingin menyampaikannya dengan lembut?", "text", "HD-120", "scheduled"),
  S1(7, "Evaluasi Sesi 1", "Apa tiga perubahan kecil paling bermakna yang kamu rasakan sepanjang sesi ini?", "scale", "HD-104", "locked"),
];

export const CYCLE_STATS = {
  dayLabel: "Hari 5 / 14",
  compliance: 85.4,
  responded: 68,
  needNudge: 14,
};

export const DEFAULT_FALLBACK =
  "Ceritakan satu momen hening bersama pasangan pekan ini di mana kamu merasa Allah menjaga ikatan pernikahan kalian?";

export const DEFAULT_VOICE_NOTE = { name: "Suara Renungan: Coach Afifah", meta: "Durasi 1:14 menit · Tadabbur Lembut" };

export const formatDateId = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
