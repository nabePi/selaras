export type StoryCategory = "adaptasi" | "pillow-talk" | "refleksi" | "audio";

export const STORY_FILTERS = [
  { value: "all", label: "Semua Kisah" },
  { value: "adaptasi", label: "Adaptasi Awal Menikah" },
  { value: "pillow-talk", label: "Pillow Talk & Komunikasi" },
  { value: "refleksi", label: "Refleksi Harian" },
  { value: "audio", label: "Audio Renungan" },
] as const;

export type StoryFilter = (typeof STORY_FILTERS)[number]["value"];

export const FEATURED_STORY = {
  categories: ["pillow-talk", "adaptasi"] as StoryCategory[],
  cohort: "Cohort 3",
  image: "/images/story-featured.jpg",
  imageAlt: "Dimas dan Larasati tersenyum hangat di ruang tamu dengan secangkir teh",
  couple: "Dimas (29) & Larasati (27) · Menikah 1,5 Tahun",
  title:
    "Dari Sering Memicu Debat Lelah Sepulang Kerja Menjadi 10 Menit Pillow Talk yang Menghangatkan",
  quote:
    "Sebelum kenal ritual journaling Selaras, kami sering terjebak saling diam karena sama-sama penat. Prompt harian membantu kami punya bahasa yang aman untuk bicara.",
  readTime: "4 Menit Baca",
};

export type Story = {
  id: string;
  categories: StoryCategory[];
  couple: string;
  meta: string;
  image: string;
  badge: string;
  badgeTone: string;
  title: string;
  excerpt: string;
  likes: number;
  footnote: string;
  audio?: { title: string; duration: string };
};

export const STORIES: Story[] = [
  {
    id: "sarah-rizky",
    categories: ["pillow-talk"],
    couple: "Sarah & Rizky",
    meta: "Cohort 2 · Menikah 2 Tahun",
    image: "/images/couple-sarah-rizky.jpg",
    badge: "Komunikasi",
    badgeTone: "bg-accent-mint/40 text-on-surface-variant",
    title:
      "Bagaimana Jurnal 3 Menit Membantu Suamiku yang Pendiam Mulai Membuka Rasa",
    excerpt:
      "Rizky bukan tipe orang yang mudah mengutarakan unek-unek. Kartu dialog dan pertanyaan refleksi malam membebaskannya dari rasa tertekan untuk langsung mencari solusi teknis.",
    likes: 48,
    footnote: "3 Menit Baca",
  },
  {
    id: "fauzan-nabila",
    categories: ["adaptasi", "audio"],
    couple: "Fauzan & Nabila",
    meta: "Cohort 3 · Tahun Pertama",
    image: "/images/couple-fauzan-nabila.jpg",
    badge: "Adaptasi",
    badgeTone: "bg-secondary-container text-on-secondary-container",
    title: "Melepaskan Ekspektasi Tak Nyata di Tahun Pertama Pernikahan",
    excerpt:
      "Ekspektasi bahwa pasangan harus selalu paham tanpa diucapkan adalah jebakan terbesar kami. Memaafkan ketidaksempurnaan adalah bentuk ibadah paling nyata.",
    likes: 73,
    footnote: "Audio + Baca",
    audio: { title: "Suara Hati: “Belajar Mengalah Tanpa Kalah”", duration: "01:14" },
  },
  {
    id: "hanif-aisyah",
    categories: ["refleksi"],
    couple: "Hanif & Aisyah",
    meta: "Cohort 1 · Menikah 3 Tahun",
    image: "/images/couple-hanif-aisyah.jpg",
    badge: "Spiritual Bersama",
    badgeTone: "bg-accent-sunray/30 text-on-surface-variant",
    title: "Menemukan Kembali Ibadah Berdua Saat Rutinitas Mulai Terasa Monoton",
    excerpt:
      "Kami sempat merasa kehabisan bahan obrolan setelah urusan tagihan dan pekerjaan selesai. Modul ‘Tumbuh Bersama’ mengarahkan kami kembali shalat tahajud dan tadabbur sepenggal ayat tiap subuh.",
    likes: 56,
    footnote: "3 Menit Baca",
  },
];
