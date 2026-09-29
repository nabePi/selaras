/**
 * Data contoh untuk halaman member (sudah login).
 * Ganti dengan data dari backend saat API tersedia.
 */

export const MEMBER = {
  firstName: "Laras",
  fullName: "Larasati Kusuma",
  partnerName: "Dimas Satria",
  avatar: "/images/profile-larasati.jpg",
  cohort: "Cohort 3",
  joinedLabel: "Terdaftar sejak 14 Sep 2026 · Minggu ke-3",
  streakDays: 4,
  reflectionDays: 14,
  journalEntries: 12,
  todayLabel: "Senin, 28 September 2026 · Rumah Tangga Berkah",
  weekLabel: "Pekan ke-2 Cohort",
};

/** Refleksi harian yang tertunda dan harus dilunasi sebelum topik hari ini terbuka. */
export const PENDING_REFLECTION = {
  session: 2,
  day: 5,
  totalDays: 14,
  dateLabel: "Kemarin, 27 Sep 2026",
  minutes: 3,
  teaser:
    "Apa satu hal kecil yang pasanganmu lakukan kemarin yang membuatmu merasa dihargai?",
  teaserNote:
    "Catatan intim untuk merajut rasa syukur atas perhatian yang sering terlewatkan dalam rutinitas.",
  prompt:
    "Apa satu hal kecil yang pasanganmu lakukan kemarin yang membuat hatimu merasa hangat dan dihargai?",
  promptNote: "Tuliskan dengan jujur dan tanpa filter. Setiap rasa berharga untuk diselaraskan.",
};

export const DAILY_WISDOM = {
  quote: "Sebaik-baik kalian adalah yang paling baik terhadap keluarganya.",
  source: "HR. Tirmidzi",
  theme: "Refleksi Kelembutan",
  shareText:
    "“Sebaik-baik kalian adalah yang paling baik terhadap keluarganya.” (HR. Tirmidzi)",
};

export type DayStatus = "done" | "pending" | "locked" | "upcoming";

export const WEEK = {
  title: "Pekan 2: Kedekatan Emosional",
  target: "Target: 7/7 Hari",
  days: [
    { label: "Sen", status: "done" },
    { label: "Sel", status: "done" },
    { label: "Rab", status: "done" },
    { label: "Kam", status: "done" },
    { label: "Jum", status: "pending" },
    { label: "Sab", status: "upcoming" },
    { label: "Min", status: "upcoming" },
  ] as { label: string; status: "done" | "pending" | "upcoming" }[],
};

/** Status pengisian per tanggal (ISO). Tanggal tanpa data ditampilkan redup. */
export const CALENDAR_STATUS: Record<string, DayStatus> = {
  "2026-09-21": "done",
  "2026-09-22": "done",
  "2026-09-23": "done",
  "2026-09-24": "done",
  "2026-09-25": "done",
  "2026-09-26": "done",
  "2026-09-27": "pending",
  "2026-09-28": "locked",
  "2026-09-29": "upcoming",
  "2026-09-30": "upcoming",
};

export const CALENDAR_START = { year: 2026, month: 8 }; // September 2026 (0-based)

export type JournalEntry = {
  id: string;
  dayLabel: string;
  dateLabel: string;
  prompt: string;
  excerpt: string;
  shared: boolean;
  versionLabel: string;
  photo?: { src: string; alt: string; caption: string };
  audio?: { title: string; meta: string };
};

export const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "hari-4",
    dayLabel: "Hari ke-4",
    dateLabel: "26 Sep 2026",
    prompt: "Bagaimana caramu menyampaikan rasa lelah tanpa memicu salah paham?",
    excerpt:
      "Aku belajar memakai \"I-message\" bukan menuduh. Rasanya jauh lebih plong ketika bilang “Aku butuh hening sebentar ya sayang” daripada langsung terdiam dingin...",
    shared: true,
    versionLabel: "Versi 1 (26 Sep, 21:15 WIB)",
    photo: {
      src: "/images/entry-journal.jpg",
      alt: "Foto catatan refleksi hari ke-4",
      caption: "Dokumentasi Suasana",
    },
  },
  {
    id: "hari-3",
    dayLabel: "Hari ke-3",
    dateLabel: "25 Sep 2026",
    prompt: "Satu komitmen kecil yang ingin kamu jaga pekan ini bersama pasangan.",
    excerpt:
      "Menjadwalkan sepuluh menit tanpa gawai sebelum tidur malam. Kami saling menatap dan mengucap terima kasih atas satu hal kecil yang telah dilewati seharian tadi.",
    shared: false,
    versionLabel: "Versi 2 (25 Sep, 22:04 WIB)",
    audio: { title: "Refleksi Suara Malam", meta: "01:42 · Format M4A" },
  },
];

export const CURRICULUM = {
  title: "Young Marriage Foundations",
  progressLabel: "Sesi 2 / 3 Selesai",
  sessions: [
    {
      id: "sesi-1",
      status: "done" as const,
      label: "SESI 1 · DARING",
      date: "17 Sep 2026",
      title: "Membangun Pondasi Niat & Komunikasi",
      summary: "Mengurai ekspektasi tak terucap dan meluruskan niat ibadah bersama.",
      actions: [
        { icon: "play_circle", label: "Lihat Rekaman", tone: "text-primary" },
        { icon: "article", label: "Rangkuman", tone: "text-tertiary" },
      ],
    },
    {
      id: "sesi-2",
      status: "done" as const,
      label: "SESI 2 · DARING",
      date: "24 Sep 2026",
      title: "Menavigasi Ekspektasi & Konflik Sehat",
      summary: "Seni jeda emosional (emotional pause) dan teknik validasi perasaan.",
      actions: [
        { icon: "description", label: "Baca Rangkuman", tone: "text-tertiary" },
      ],
    },
  ],
  upcoming: {
    label: "SESI 3 · MENDATANG",
    date: "Sabtu, 3 Okt 2026",
    title: "Merawat Cinta & Ibadah Bersama",
    detail: "Pukul 19:30 - 21:00 WIB · Ruang Virtual Zoom",
  },
};

export const ASSESSMENT = {
  description:
    "Pemetaan 30 indikator kematangan relasional: Mindset (15 soal) & Kebiasaan Sehari-hari (15 soal).",
  pillars: [
    {
      name: "Pilar Mindset Pasangan",
      before: 68,
      after: 85,
      afterLabel: "Post",
      note: "Kesiapan komunikasi empati & regulasi ekspektasi",
      result: "85% Matang",
      tone: "primary" as const,
    },
    {
      name: "Pilar Kebiasaan (Habit)",
      before: 62,
      after: 82,
      afterLabel: "Target",
      note: "Rutinitas tilawah bareng, pillow talk, & apresiasi verbal",
      result: "Progresif",
      tone: "secondary" as const,
    },
  ],
  coachNote:
    "Mbak Laras menunjukkan kemajuan luar biasa dalam mendengarkan aktif tanpa buru-buru membantah. Terus rawat kebiasaan apresiasi kecil setiap malam sebelum tidur.",
  coachName: "Coach Afifah, M.Psi",
};

export const REMINDER_TIMES = ["20:30", "21:00", "21:30", "22:00"];

/** Jumlah refleksi tertunda, ditampilkan sebagai badge di tab Journal. */
export const PENDING_COUNT = 1;
