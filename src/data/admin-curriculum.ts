/** Data contoh untuk halaman Manajemen Kelas & Sesi. Ganti dengan API. */

export const CLASS_INFO = {
  id: "CLS-CHRT04-2026",
  title: "Young Marriage Foundations — Cohort 04",
  totalDays: 21,
  currentDay: 12,
  pairs: 30,
  participants: 60,
  statusLabel: "Sedang Berjalan (Hari ke-12 dari 21 Siklus)",
  description:
    "Program bimbingan komprehensif 21 hari dengan 3 sesi tatap maya, 21 refleksi harian terikat, dan pendampingan terstruktur.",
  journeyLabel: "Sesi 2 Berjalan (Tahap Regulasi Emosi)",
  progressPercent: 57,
  closingMessage:
    "Alhamdulillah! Selamat telah menyelesaikan perjalanan 21 hari penuh sakinah bersama Selaras Life. Semoga Allah senantiasa menganugerahkan kelembutan, ketenangan, dan kelapangan rezeki di setiap langkah keluarga kalian.",
};

export const PROGRESS_SEGMENTS = [
  { width: 33.3, className: "bg-primary-container", title: "Sesi 1: 7 Hari (Selesai)" },
  { width: 24, className: "bg-primary animate-pulse", title: "Sesi 2: H-8 s/d H-12 Aktif" },
  { width: 42.7, className: "bg-surface-variant/70", title: "Sisa Sesi 2 & Sesi 3" },
];

export type ClassSession = {
  id: "s1" | "s2" | "s3";
  state: "done" | "active" | "upcoming";
  label: string;
  dateLabel: string;
  tag: string;
  title: string;
  description: string;
  journalingDays: number;
  rangeLabel: string;
};

export const SESSIONS: ClassSession[] = [
  {
    id: "s1",
    state: "done",
    label: "Sesi 1 · Selesai",
    dateLabel: "Sabtu, 20 Sep 2026 · 19:30 WIB",
    tag: "89% Selesai Journaling",
    title: "Membangun Pondasi Niat, Visi Hidup & Dialog Empatik",
    description:
      "Fokus pada eksplorasi ekspektasi tak terucap, penyelarasan niat sakinah, serta latihan 3 detik jeda sebelum merespons pasangan.",
    journalingDays: 7,
    rangeLabel: "Hari ke-1 s/d Hari ke-7 (Selesai Penuh)",
  },
  {
    id: "s2",
    state: "active",
    label: "Sesi 2 · Sedang Aktif",
    dateLabel: "Sabtu, 27 Sep 2026 · 19:30 WIB",
    tag: "Hari ke-12 (Journaling Berlangsung)",
    title: "Menavigasi Konflik Sehat, Regulasi Marah & Ritual Pillow Talk",
    description:
      "Metode komunikasi asertif islami (menggunakan sudut pandang 'Aku' bukan menyudutkan), tata cara de-eskalasi emosi dan ritual penutup malam.",
    journalingDays: 7,
    rangeLabel: "Hari ke-8 s/d Hari ke-14",
  },
  {
    id: "s3",
    state: "upcoming",
    label: "Sesi 3 · Akan Datang",
    dateLabel: "Sabtu, 3 Okt 2026 · 19:30 WIB",
    tag: "Terbuka Otomatis Saat H-14 Selesai",
    title: "Merawat Keintiman Jiwa-Raga, Ibadah Selaras & Finansial Berkah",
    description:
      "Penyelarasan ritme ibadah keluarga, seni mengelola transparansi keuangan tanpa kecurigaan, serta fondasi keintiman biologis dan emosional jangka panjang.",
    journalingDays: 7,
    rangeLabel: "Hari ke-15 s/d Hari ke-21",
  },
];

export const SESSION_DETAILS = {
  s1: {
    promptsInfo: "7 Prompt Terdistribusi",
    recording: "Zoom Cloud Recording (1j 48m)",
    slide: "Slide_Sesi1_VisiHidup.pdf (4.2 MB)",
    participation: { answered: 53, total: 60 },
  },
  s2: {
    todayDay: 12,
    todayPrompt: "Apa satu hal kecil yang pasanganmu lakukan kemarin yang membuat hatimu merasa dihargai?",
    liveInfo: "Tayang di App Pasutri (Durasi 1j 42m)",
    file: "Ringkasan_PillowTalk_Sesi2.pdf",
    compliance: { pairs: 42, percent: 70 },
  },
  s3: {
    zoomLink: "https://zoom.us/j/selaras-cohort4-session3",
    postTest: { questions: 30, opensAt: "Hari ke-21 jam 08:00" },
    pptStatus: "Materi PPT dalam Draf (Belum Terbit)",
  },
};

export type Dimension = "mindset" | "habit";
export type ScaleKind = "agreement" | "frequency";

export const SCALE_LABELS: Record<ScaleKind, string> = {
  agreement: "Sangat Tidak Setuju → Sangat Setuju",
  frequency: "Tidak Pernah → Selalu Rutin",
};

export type Question = {
  id: string;
  no: number;
  statement: string;
  description: string;
  dimension: Dimension;
  subDimension: string;
  scale: ScaleKind;
  /** Rerata skor pre-test (1–5) */
  preAverage: number;
};

type Raw = [statement: string, subDimension: string, description: string];

const MINDSET: Raw[] = [
  ["Saya merasa aman mengutarakan kelelahan mental kepada pasangan tanpa takut dihakimi.", "Keterbukaan", "Mengukur rasa aman emosional (vulnerability acceptance)"],
  ["Saat timbul beda pendapat seputar keuangan, kami menunda perdebatan sampai emosi mereda.", "Regulasi Konflik", "Kemampuan jeda rasional dan de-eskalasi friksi sensitif"],
  ["Saya percaya pasangan bermaksud baik, bahkan ketika ucapannya terasa menyakitkan.", "Prasangka Baik", "Regulasi prasangka dan penafsiran niat pasangan"],
  ["Saya memandang perbedaan karakter kami sebagai ruang belajar, bukan sumber pertengkaran.", "Cara Pandang Sakinah", "Penerimaan perbedaan sebagai bagian dari pertumbuhan"],
  ["Saya mampu mengakui kesalahan lebih dulu tanpa menunggu pasangan meminta maaf.", "Kerendahan Hati", "Kesediaan meredam ego demi kedekatan"],
  ["Saya merasa didengarkan ketika menyampaikan keresahan kepada pasangan.", "Rasa Didengarkan", "Persepsi diterima saat berbicara"],
  ["Saya menyadari kebutuhan emosional pasangan tanpa harus diminta.", "Empati", "Kepekaan terhadap sinyal non-verbal pasangan"],
  ["Saya menerima bahwa rumah tangga kami akan melewati fase sulit dan tetap bertumbuh.", "Ketahanan", "Keyakinan pada proses jangka panjang"],
  ["Saya meyakini niat ibadah menjadi fondasi yang menguatkan hubungan kami.", "Niat & Visi", "Keselarasan tujuan spiritual pasutri"],
  ["Saya bisa menyampaikan kekecewaan dengan tenang tanpa menyalahkan pasangan.", "Komunikasi Asertif", "Penggunaan sudut pandang 'aku' saat berkonflik"],
  ["Saya merasa kami adalah tim dalam menghadapi masalah keluarga.", "Kemitraan", "Rasa berjalan bersama menghadapi tantangan"],
  ["Saya mampu menahan diri dari membalas ketika sedang marah.", "Regulasi Emosi", "Pengendalian diri di puncak emosi"],
  ["Saya menghargai peran dan kontribusi pasangan, sekecil apa pun.", "Apresiasi", "Kecenderungan melihat kebaikan pasangan"],
  ["Saya nyaman membicarakan ekspektasi yang belum terpenuhi.", "Ekspektasi", "Keterbukaan mengelola harapan tak terucap"],
  ["Saya optimistis tentang masa depan pernikahan kami.", "Harapan", "Pandangan ke depan atas hubungan"],
];

const HABIT: Raw[] = [
  ["Kami memiliki waktu hening berdua tanpa gawai minimal 10 menit setiap malam.", "Keintiman", "Mengukur konsistensi batas distraksi digital pasutri"],
  ["Kami rutin melakukan audit anggaran bersama di akhir bulan tanpa rasa saling menuduh.", "Transparansi", "Transparansi alur rezeki dan musyawarah belanja bersama"],
  ["Kami membaca atau membahas satu nasihat kebaikan bersama setiap pekan.", "Ritual Spiritual", "Kebiasaan belajar dan merenung bersama"],
  ["Kami shalat berjamaah bersama beberapa kali dalam sepekan.", "Ibadah Bersama", "Frekuensi ibadah berjamaah pasutri"],
  ["Kami mengucapkan terima kasih atas hal kecil setiap hari.", "Apresiasi Harian", "Ritual afirmasi verbal harian"],
  ["Kami menyempatkan pillow talk sebelum tidur.", "Pillow Talk", "Dialog ringan penutup hari"],
  ["Kami membagi tugas rumah tangga dengan kesepakatan yang jelas.", "Pembagian Peran", "Kejelasan dan keadilan peran domestik"],
  ["Kami memberi jeda sebelum merespons saat emosi meninggi.", "Jeda Emosi", "Praktik emotional pause dalam konflik"],
  ["Kami makan bersama tanpa layar beberapa kali dalam sepekan.", "Waktu Berkualitas", "Kebersamaan tanpa distraksi"],
  ["Kami saling mendoakan secara lisan.", "Doa Bersama", "Kebiasaan mendoakan pasangan"],
  ["Kami menetapkan waktu khusus untuk membicarakan keuangan dan rencana keluarga.", "Musyawarah", "Forum rutin pengambilan keputusan bersama"],
  ["Kami menenangkan pasangan dengan sentuhan atau kata lembut saat ia lelah.", "Afeksi", "Respons afektif terhadap kelelahan pasangan"],
  ["Kami merencanakan kegiatan berdua secara berkala.", "Kebersamaan", "Investasi waktu untuk hubungan"],
  ["Kami mengevaluasi hubungan secara terbuka setiap bulan.", "Evaluasi Rutin", "Refleksi bersama atas perjalanan pernikahan"],
  ["Kami menjaga batas penggunaan gawai saat sedang bersama.", "Batas Digital", "Disiplin perhatian saat bersama"],
];

const pad = (n: number) => String(n).padStart(2, "0");

/** Skor rerata pre-test deterministik 2.6–3.8 */
const avg = (i: number) => Math.round((2.6 + (((i + 1) * 37) % 100) / 100 * 1.2) * 100) / 100;

export const INITIAL_QUESTIONS: Question[] = Array.from({ length: 30 }, (_, i) => {
  const mindset = i % 2 === 0;
  const raw = (mindset ? MINDSET : HABIT)[Math.floor(i / 2)];
  return {
    id: `Q-${pad(i + 1)}`,
    no: i + 1,
    statement: raw[0],
    description: raw[2],
    dimension: mindset ? "mindset" : "habit",
    subDimension: raw[1],
    scale: mindset ? "agreement" : "frequency",
    preAverage: avg(i),
  };
});

// Skor yang tercantum di desain untuk 4 butir pertama.
const DESIGN_AVERAGES = [3.42, 2.65, 3.18, 3.05];
DESIGN_AVERAGES.forEach((v, i) => (INITIAL_QUESTIONS[i].preAverage = v));
