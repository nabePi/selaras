/**
 * Data contoh untuk halaman member (sudah login).
 * Ganti dengan data dari backend saat API tersedia.
 */

export const MEMBER = {
  firstName: "Laras",
  fullName: "Larasati Kusuma",
  avatar: "/images/profile-larasati.jpg",
  whatsapp: "0812 3456 7890",
  email: "larasati.kusuma@email.com",
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
    "Percakapan apa dengan suami minggu ini yang membuat saya merasa didengar (atau sebaliknya)?",
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

export const JOURNAL_FEELINGS = [
  { emoji: "😢", label: "Sedih" },
  { emoji: "😟", label: "Cemas" },
  { emoji: "😐", label: "Biasa Saja" },
  { emoji: "😊", label: "Tenang" },
  { emoji: "😄", label: "Bahagia" },
] as const;

export type JournalFeeling = (typeof JOURNAL_FEELINGS)[number];

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
  /** Tanggal ISO (yyyy-mm-dd), dipakai untuk mencocokkan dengan sel kalender. */
  date: string;
  dayLabel: string;
  dateLabel: string;
  prompt: string;
  /** Cuplikan singkat untuk kartu riwayat (ditampilkan line-clamp-2). */
  excerpt: string;
  /** Isi lengkap, ditampilkan terpotong di popup kalender dan utuh di halaman detail. */
  content: string;
  /** Perasaan yang dipilih pengguna sebelum menulis refleksi. */
  feeling: JournalFeeling;
  shared: boolean;
  versionLabel: string;
  photo?: { src: string; alt: string; caption: string };
  audio?: { title: string; meta: string };
};

export const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "hari-4",
    date: "2026-09-26",
    dayLabel: "Hari ke-4",
    dateLabel: "26 Sep 2026",
    prompt: "Bagaimana caramu menyampaikan rasa lelah tanpa memicu salah paham?",
    excerpt:
      "Aku belajar memakai \"I-message\" bukan menuduh. Rasanya jauh lebih plong ketika bilang “Aku butuh hening sebentar ya sayang” daripada langsung terdiam dingin...",
    content:
      "Aku belajar memakai \"I-message\" bukan menuduh. Rasanya jauh lebih plong ketika bilang “Aku butuh hening sebentar ya sayang” daripada langsung terdiam dingin. Dulu aku sering memilih diam total karena takut kalau bicara malah jadi berantem, padahal diam itu justru bikin Mas Dimas bingung dan merasa disalahkan tanpa tahu sebabnya. Malam ini aku coba cara baru: duduk sebentar, tarik napas, lalu bilang apa yang aku rasakan tanpa menyalahkan dia. Responnya jauh lebih lembut dari yang kukira — dia malah memelukku dan bilang terima kasih sudah jujur. Rasanya ini pelajaran kecil yang besar maknanya: kejujuran yang disampaikan dengan lembut ternyata lebih menyatukan daripada kesunyian yang disalahartikan.",
    feeling: JOURNAL_FEELINGS[3],
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
    date: "2026-09-25",
    dayLabel: "Hari ke-3",
    dateLabel: "25 Sep 2026",
    prompt: "Satu komitmen kecil yang ingin kamu jaga pekan ini bersama pasangan.",
    excerpt:
      "Menjadwalkan sepuluh menit tanpa gawai sebelum tidur malam. Kami saling menatap dan mengucap terima kasih atas satu hal kecil yang telah dilewati seharian tadi.",
    content:
      "Menjadwalkan sepuluh menit tanpa gawai sebelum tidur malam. Kami saling menatap dan mengucap terima kasih atas satu hal kecil yang telah dilewati seharian tadi. Awalnya terasa canggung, karena biasanya menit-menit terakhir sebelum tidur justru dihabiskan scroll media sosial masing-masing tanpa sadar. Tapi begitu ponsel diletakkan di luar kamar, percakapan jadi mengalir lebih dalam. Mas Dimas cerita soal harinya yang berat di kantor, dan aku cerita soal rasa cemas menghadapi deadline kerja. Ternyata saling mendengar tanpa distraksi itu menyembuhkan dengan caranya sendiri. Semoga kebiasaan kecil ini bisa terus dijaga, bukan cuma jadi tugas jurnal semata.",
    feeling: JOURNAL_FEELINGS[4],
    shared: false,
    versionLabel: "Versi 2 (25 Sep, 22:04 WIB)",
    audio: { title: "Refleksi Suara Malam", meta: "01:42 · Format M4A" },
  },
  {
    id: "hari-2",
    date: "2026-09-24",
    dayLabel: "Hari ke-2",
    dateLabel: "24 Sep 2026",
    prompt: "Apa satu prasangka yang ingin kamu lepaskan terhadap pasanganmu minggu ini?",
    excerpt:
      "Aku sering menyangka diamnya Mas Dimas berarti dia marah, padahal ternyata dia cuma lelah dan butuh waktu sendiri...",
    content:
      "Aku sering menyangka diamnya Mas Dimas berarti dia marah, padahal ternyata dia cuma lelah dan butuh waktu sendiri untuk memulihkan energi. Prasangka ini sudah lama mengendap dan sering bikin aku baper duluan sebelum tanya langsung. Hari ini aku coba hal berbeda: alih-alih menyimpulkan sendiri, aku tanya baik-baik, \"Mas lagi capek ya? Mau ditemenin atau butuh sendirian dulu?\" Jawabannya sederhana — dia cuma butuh 15 menit untuk rebahan sebentar. Setelah itu dia balik jadi ceria seperti biasa. Aku sadar, banyak drama di kepalaku sebenarnya bisa selesai hanya dengan bertanya, bukan menebak-nebak sendiri.",
    feeling: JOURNAL_FEELINGS[1],
    shared: false,
    versionLabel: "Versi 1 (24 Sep, 21:40 WIB)",
  },
  {
    id: "hari-1",
    date: "2026-09-23",
    dayLabel: "Hari ke-1",
    dateLabel: "23 Sep 2026",
    prompt: "Ceritakan momen hari ini yang membuatmu bersyukur punya pasangan seperti dia.",
    excerpt:
      "Pagi ini dia diam-diam menyiapkan sarapan sebelum aku bangun, padahal semalam dia pulang kerja paling larut...",
    content:
      "Pagi ini dia diam-diam menyiapkan sarapan sebelum aku bangun, padahal semalam dia pulang kerja paling larut dari biasanya. Aku terbangun dengan aroma telur dadar kesukaanku dan secangkir teh hangat di meja. Hal kecil seperti ini kadang luput aku syukuri karena sudah jadi rutinitas, padahal di baliknya ada niat dan pengorbanan waktu istirahatnya. Hari ini aku ingin mulai mencatat hal-hal kecil semacam ini sebagai pengingat bahwa cinta itu sering hadir lewat tindakan sederhana, bukan kata-kata besar.",
    feeling: JOURNAL_FEELINGS[4],
    shared: true,
    versionLabel: "Versi 1 (23 Sep, 20:55 WIB)",
  },
  {
    id: "refleksi-22",
    date: "2026-09-22",
    dayLabel: "Refleksi Pribadi",
    dateLabel: "22 Sep 2026",
    prompt: "Apa harapanmu memasuki pekan pertama perjalanan refleksi ini?",
    excerpt:
      "Jujur aku agak skeptis di awal, berpikir jurnal harian ini cuma formalitas kelas. Tapi menuliskan perasaan ternyata...",
    content:
      "Jujur aku agak skeptis di awal, berpikir jurnal harian ini cuma formalitas kelas. Tapi menuliskan perasaan ternyata membuatku lebih sadar pola komunikasi yang selama ini kurang kusadari antara aku dan Mas Dimas. Harapanku sederhana: semoga lewat kebiasaan menulis ini, kami berdua bisa saling memahami tanpa harus menunggu konflik besar dulu baru bicara dari hati ke hati.",
    feeling: JOURNAL_FEELINGS[2],
    shared: false,
    versionLabel: "Versi 1 (22 Sep, 22:10 WIB)",
  },
  {
    id: "refleksi-21",
    date: "2026-09-21",
    dayLabel: "Refleksi Pribadi",
    dateLabel: "21 Sep 2026",
    prompt: "Tuliskan satu hal yang ingin kamu perbaiki dalam cara berkomunikasi dengan pasangan.",
    excerpt:
      "Aku ingin berhenti memendam kekesalan kecil sampai menumpuk dan akhirnya meledak jadi pertengkaran besar...",
    content:
      "Aku ingin berhenti memendam kekesalan kecil sampai menumpuk dan akhirnya meledak jadi pertengkaran besar di waktu yang tidak tepat. Pola ini sudah berulang beberapa kali dan selalu menyisakan rasa bersalah karena hal kecil yang sebenarnya bisa dibicarakan baik-baik malah dibungkus emosi yang sudah menggunung. Semoga dengan journaling ini aku bisa lebih peka menyadari triggers-nya sejak dini.",
    feeling: JOURNAL_FEELINGS[0],
    shared: false,
    versionLabel: "Versi 1 (21 Sep, 21:05 WIB)",
  },
];

/** Jumlah refleksi tertunda, ditampilkan sebagai badge di tab Journal. */
export const PENDING_COUNT = 1;

export type AppNotification = {
  id: string;
  icon: string;
  iconTone: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    icon: "edit_note",
    iconTone: "bg-secondary-container text-secondary",
    title: `Refleksi Hari ke-${PENDING_REFLECTION.day} Menunggu`,
    body: "Tuntaskan refleksi kemarin sebelum topik hari ini terbuka.",
    time: "2 jam lalu",
    read: false,
  },
  {
    id: "n2",
    icon: "support_agent",
    iconTone: "bg-accent-mint/40 text-primary",
    title: "Pesan dari Fasilitator",
    body: "Jangan ragu menghubungi tim pendamping jika ada yang ingin didiskusikan lebih lanjut.",
    time: "Kemarin",
    read: false,
  },
  {
    id: "n3",
    icon: "auto_stories",
    iconTone: "bg-sage-tint text-primary",
    title: "Hadis Harian Baru",
    body: DAILY_WISDOM.quote,
    time: "2 hari lalu",
    read: true,
  },
];
