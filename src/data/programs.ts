export type ProgramCategory = "marriage" | "parenting" | "communication";

export const PROGRAM_FILTERS = [
  { value: "all", label: "Semua Program" },
  { value: "marriage", label: "Pernikahan Muda" },
  { value: "parenting", label: "Persiapan Orang Tua" },
  { value: "communication", label: "Komunikasi & Emosi" },
] as const;

export type ProgramFilter = (typeof PROGRAM_FILTERS)[number]["value"];

export const FEATURED_PROGRAM = {
  categories: ["marriage", "communication"] as ProgramCategory[],
  cohort: "Cohort 4",
  startLabel: "Mulai 15 Okt 2026",
  slotsLeft: 8,
  duration: "14 Hari Terpadu",
  format: "Live Interactive Zoom + App",
  title: "Young Marriage Foundations",
  description:
    "Dirancang untuk pasangan usia pernikahan 0–5 tahun demi menyelaraskan visi sakral, menata komunikasi empatik tanpa defensif, serta ritual ibadah harian berdua.",
  sessions: [
    "Membangun Pondasi Niat, Visi Hidup, & Dialog Empatik",
    "Menavigasi Konflik Sehat, Regulasi Marah, & Ritual Pillow Talk",
    "Merawat Keintiman Jiwa-Raga, Ibadah Selaras, & Finansial Berkah",
  ],
  price: "Rp 649.000",
  originalPrice: "Rp 950.000",
};

export type OtherProgram = {
  id: string;
  categories: ProgramCategory[];
  tag: string;
  tagTone: string;
  title: string;
  status: string;
  statusTone: string;
  description: string;
  kind: "waitlist" | "selfpaced" | "soon";
  meta: string;
};

export const OTHER_PROGRAMS: OtherProgram[] = [
  {
    id: "preparing-parenthood",
    categories: ["parenting"],
    tag: "Persiapan Buah Hati",
    tagTone: "bg-secondary-container/60 text-secondary",
    title: "Preparing Parenthood",
    status: "Waiting List",
    statusTone: "bg-surface text-primary font-semibold",
    description:
      "Menyiapkan kesiapan emosi, mental ayah-bunda, manajemen stres transisi keluarga, serta adab menyambut amanah generasi pertama.",
    kind: "waitlist",
    meta: "Mulai Des 2026",
  },
  {
    id: "deep-emotional-connection",
    categories: ["communication", "marriage"],
    tag: "Self-Paced Mini Journaling",
    tagTone: "bg-accent-mint/50 text-primary",
    title: "Deep Emotional Connection",
    status: "Akses Fleksibel",
    statusTone: "bg-surface text-on-surface-variant font-medium",
    description:
      "7 hari panduan praktis seni mendengarkan pasangan tanpa interupsi dan teknik validasi perasaan untuk mencairkan kejenuhan.",
    kind: "selfpaced",
    meta: "Rp 149.000",
  },
  {
    id: "finansial-berkah",
    categories: ["marriage"],
    tag: "Sinergi Finansial",
    tagTone: "bg-accent-sunray/40 text-on-tertiary-fixed-variant",
    title: "Finansial Pasutri Penuh Berkah",
    status: "Coming Soon",
    statusTone: "bg-surface-dim text-text-muted font-medium",
    description:
      "Integrasi konsep nafkah, pengelolaan cashflow berdua, dana darurat, hingga adab sedekah & wakaf bersama secara transparan.",
    kind: "soon",
    meta: "Kolaborasi Perencana Keuangan Syariah",
  },
];

export const MENTORS = [
  {
    name: "Afifah Nurul, M.Psi.",
    role: "Psikolog Keluarga & Konselor Pasutri",
    bio: "Berpengalaman 8+ tahun memfasilitasi rekonsiliasi dan kesiapan mental pernikahan.",
    image: "/images/mentor-afifah.jpg",
  },
  {
    name: "Ustadz Hilman Fawzi, Lc.",
    role: "Pembimbing Fiqih Munakahat & Adab",
    bio: "Menyampaikan tuntunan syariah sakinah dengan pendekatan bahasa kontemporer nan santun.",
    image: "/images/mentor-hilman.jpg",
  },
];
