/** Data contoh peserta (pasutri) untuk konsol admin. Ganti dengan API. */

export type CoupleStatus = "active" | "pending" | "backlog" | "alumni";

export type Couple = {
  id: string;
  name: string;
  shortName: string;
  initials: string;
  phone: string;
  email?: string;
  cohort: "Cohort 03" | "Cohort 04" | "Cohort 05";
  status: CoupleStatus;
  /** Keterangan di bawah nama */
  subtitle: string;
  /** Baris kecil di bawah nomor telepon */
  contactNote: { icon: string; label: string; tone: "ok" | "pending" | "plain" };
  startLabel: string;
  day: number;
  totalDays: number;
  /** Hari tertunda pada gating (0 = lancar) */
  delayDays: number;
  gatingNote?: string;
  sharedWithCoach: boolean;
  postTest?: number;
  activationLog: string;
  coachNote: string;
};

export const TOTAL_DAYS = 14;
export const NOW_LABEL = "28 Sep 2026, 09:42 WIB";

const WIVES = ["Aisyah", "Nadia", "Salma", "Khadijah", "Zahra", "Maryam", "Dewi", "Rina", "Putri", "Ayu", "Laila", "Fitri", "Nurul", "Indah", "Sekar", "Tiara", "Farah", "Hana", "Citra", "Mutia", "Amelia", "Syifa", "Yuni", "Melati"];
const HUSBANDS = ["Ahmad", "Rizal", "Fajar", "Yusuf", "Hasan", "Irfan", "Bagas", "Naufal", "Dani", "Ilham", "Rafi", "Taufik", "Andi", "Reza", "Farhan", "Wahyu", "Galih", "Hendra", "Ikhsan", "Joko", "Kamal", "Luthfi", "Maulana", "Nanda"];
const SURNAMES = ["Santoso", "Wijaya", "Hidayat", "Nugroho", "Ramadhan", "Firmansyah", "Setiawan", "Kurniawan", "Saputra", "Lestari", "Hakim", "Prabowo"];

const initialsOf = (a: string, b: string) => `${a[0]}${b[0]}`.toUpperCase();

const DESIGN_COUPLES: Couple[] = [
  {
    id: "SL-2026-048",
    name: "Larasati & Dimas Pratama",
    shortName: "Larasati & Dimas",
    initials: "LD",
    phone: "0812-8821-9901",
    cohort: "Cohort 04",
    status: "active",
    subtitle: "Daftar 21 Sep 2026",
    contactNote: { icon: "check_circle", label: "WA Terverifikasi", tone: "ok" },
    startLabel: "22 Sep 2026, 08:30 WIB",
    day: 5,
    totalDays: TOTAL_DAYS,
    delayDays: 0,
    sharedWithCoach: true,
    activationLog: "Diaktifkan oleh Admin Sarah. Modul Pembuka langsung terbuka.",
    coachNote:
      "Pasangan menunjukkan antusiasme tinggi pada hari ke-3 materi 'Validasi Bahasa Kasih'. Larasati cenderung lebih reflektif dan duluan submit.",
  },
  {
    id: "SL-2026-061",
    name: "Sarah Danastri & Rizky F.",
    shortName: "Sarah & Rizky",
    initials: "SR",
    phone: "0813-1102-7764",
    cohort: "Cohort 04",
    status: "pending",
    subtitle: "Transfer Mandiri (Valid)",
    contactNote: { icon: "pending", label: "Form Formil Lengkap", tone: "pending" },
    startLabel: "Menunggu titik mulai gating",
    day: 0,
    totalDays: TOTAL_DAYS,
    delayDays: 0,
    sharedWithCoach: true,
    activationLog: "Registrasi baru, pembayaran lunas. Menunggu aktivasi manual.",
    coachNote: "",
  },
  {
    id: "SL-2026-062",
    name: "Fauzan Hilmi & Nabila A.",
    shortName: "Fauzan & Nabila",
    initials: "FN",
    phone: "0857-4491-0238",
    cohort: "Cohort 04",
    status: "pending",
    subtitle: "Pre-Assessment Siap",
    contactNote: { icon: "verified", label: "Data Valid", tone: "ok" },
    startLabel: "Menunggu titik mulai gating",
    day: 0,
    totalDays: TOTAL_DAYS,
    delayDays: 0,
    sharedWithCoach: true,
    activationLog: "Registrasi baru, pembayaran QRIS. Menunggu aktivasi manual.",
    coachNote: "",
  },
  {
    id: "SL-2026-039",
    name: "Teguh Pratama & Fitria",
    shortName: "Fitria & Teguh",
    initials: "TF",
    phone: "0811-9238-1290",
    email: "fitria.teguh@gmail.com",
    cohort: "Cohort 04",
    status: "backlog",
    subtitle: "Terakhir aktif 3 hari lalu",
    contactNote: { icon: "mail", label: "fitria.teguh@gmail.com", tone: "plain" },
    startLabel: "20 Sep 2026, 10:00 WIB",
    day: 2,
    totalDays: TOTAL_DAYS,
    delayDays: 3,
    gatingNote: "Catatan: Lembur shift malam",
    sharedWithCoach: true,
    activationLog: "Aktivasi: 20 Sep 2026.",
    coachNote: "",
  },
  {
    id: "SL-2026-041",
    name: "Bima Sakti & Annisa",
    shortName: "Annisa & Bima",
    initials: "BA",
    phone: "0821-3312-5509",
    email: "annisa.bima@yahoo.com",
    cohort: "Cohort 04",
    status: "backlog",
    subtitle: "Terakhir aktif 2 hari lalu",
    contactNote: { icon: "mail", label: "annisa.bima@yahoo.com", tone: "plain" },
    startLabel: "20 Sep 2026, 09:15 WIB",
    day: 3,
    totalDays: TOTAL_DAYS,
    delayDays: 2,
    gatingNote: "Gating terhambat refleksi suami",
    sharedWithCoach: true,
    activationLog: "Aktivasi: 20 Sep 2026.",
    coachNote: "",
  },
  {
    id: "SL-2026-052",
    name: "Arya Sena & Dinda Kirana",
    shortName: "Dinda & Arya",
    initials: "AD",
    phone: "0812-7788-3312",
    cohort: "Cohort 04",
    status: "active",
    subtitle: "Mode Jurnal Privat",
    contactNote: { icon: "check_circle", label: "WA Aktif", tone: "ok" },
    startLabel: "22 Sep 2026, 09:00 WIB",
    day: 4,
    totalDays: TOTAL_DAYS,
    delayDays: 0,
    sharedWithCoach: false,
    activationLog: "22 Sep 2026, 09:00 WIB oleh Admin Sarah.",
    coachNote: "",
  },
  {
    id: "SL-2026-012",
    name: "Hanif & Aisyah",
    shortName: "Aisyah & Hanif",
    initials: "HA",
    phone: "0819-2344-9011",
    cohort: "Cohort 03",
    status: "alumni",
    subtitle: "Alumni Angkatan 3",
    contactNote: { icon: "workspace_premium", label: "Sertifikat Terbit", tone: "plain" },
    startLabel: "Selesai pada 14 Agu 2026",
    day: TOTAL_DAYS,
    totalDays: TOTAL_DAYS,
    delayDays: 0,
    sharedWithCoach: true,
    postTest: 89,
    activationLog: "Selesai pada 14 Agu 2026.",
    coachNote: "",
  },
];

function generate(): Couple[] {
  const used = new Set(DESIGN_COUPLES.map((c) => c.id));
  let counter = 0;
  const nextId = () => {
    let id: string;
    do {
      counter += 1;
      id = `SL-2026-${String(counter).padStart(3, "0")}`;
    } while (used.has(id));
    used.add(id);
    return id;
  };

  const plan: CoupleStatus[] = [
    ...Array<CoupleStatus>(6).fill("pending"),
    "backlog",
    ...Array<CoupleStatus>(40).fill("active"),
    ...Array<CoupleStatus>(14).fill("alumni"),
  ];
  // 8 pasutri memilih mode privat (termasuk Dinda & Arya) sehingga 60/68 ≈ 88% membagikan ke coach.
  const privateAt = new Set([3, 11, 17, 23, 31, 38, 47]);

  return plan.map((status, i) => {
    const wife = WIVES[(i * 5 + 2) % WIVES.length];
    const husband = HUSBANDS[(i * 7 + 3) % HUSBANDS.length];
    const surname = SURNAMES[(i * 3 + 1) % SURNAMES.length];
    const id = nextId();
    const phone = `08${12 + (i % 5)}-${1000 + ((i * 137) % 9000)}-${1000 + ((i * 251) % 9000)}`;
    const alumni = status === "alumni";
    const pending = status === "pending";
    const backlog = status === "backlog";
    const day = alumni ? TOTAL_DAYS : pending ? 0 : backlog ? 4 : 1 + ((i * 5) % 12);
    const delayDays = backlog ? 4 : status === "active" && i % 7 === 3 ? 1 : 0;

    return {
      id,
      name: `${wife} & ${husband} ${surname}`,
      shortName: `${wife} & ${husband}`,
      initials: initialsOf(wife, husband),
      phone,
      cohort: alumni ? "Cohort 03" : "Cohort 04",
      status,
      subtitle: alumni ? "Alumni Angkatan 3" : pending ? "Registrasi baru" : backlog ? "Terakhir aktif 4 hari lalu" : `Daftar ${17 + (i % 6)} Sep 2026`,
      contactNote: pending
        ? { icon: "pending", label: "Menunggu verifikasi", tone: "pending" }
        : { icon: "check_circle", label: "WA Aktif", tone: "ok" },
      startLabel: alumni
        ? `Selesai pada ${1 + (i % 27)} Agu 2026`
        : pending
          ? "Menunggu titik mulai gating"
          : `${18 + (i % 5)} Sep 2026, ${String(8 + (i % 4)).padStart(2, "0")}:${i % 2 ? "30" : "00"} WIB`,
      day,
      totalDays: TOTAL_DAYS,
      delayDays,
      gatingNote: backlog ? "Perlu sapaan lembut dari coach" : undefined,
      sharedWithCoach: !privateAt.has(i),
      postTest: alumni ? 78 + ((i * 3) % 18) : undefined,
      activationLog: pending ? "Menunggu aktivasi manual." : `Diaktifkan oleh Admin Sarah pada ${18 + (i % 5)} Sep 2026.`,
      coachNote: "",
    };
  });
}

export const INITIAL_COUPLES: Couple[] = [...DESIGN_COUPLES, ...generate()];

export const progressPercent = (c: Pick<Couple, "day" | "totalDays">) =>
  Math.round((c.day / c.totalDays) * 100);

export type LogEntry = { title: string; time: string; text: string; tone: "primary" | "soft" | "alert" };

/** Riwayat gating & log versi untuk panel audit. */
export function buildLog(c: Couple): LogEntry[] {
  if (c.id === "SL-2026-048") {
    return [
      { title: "Hari 5: Revisi Jawaban", time: "08:14 WIB", text: "Istri memperbarui refleksi komunikasi non-verbal (Versi 2 tersimpan).", tone: "primary" },
      { title: "Gating Terbuka Otomatis", time: "Kemarin", text: "Kedua pasangan menyelesaikan modul Hari 4 sebelum pukul 22:00.", tone: "soft" },
      { title: "Nudge WA Afeksi Terkirim", time: "22 Sep", text: "Pesan sapaan lembut coach terkirim via automated engine Selaras.", tone: "alert" },
      { title: "Aktivasi Akun Resmi", time: "21 Sep", text: c.activationLog, tone: "primary" },
    ];
  }
  if (c.status === "pending") {
    return [
      { title: "Registrasi Diterima", time: "Baru", text: c.activationLog, tone: "alert" },
      { title: "Menunggu Aktivasi", time: "Sekarang", text: "Akses gating masih terkunci hingga admin mengaktifkan akun.", tone: "soft" },
    ];
  }
  if (c.status === "alumni") {
    return [
      { title: "Sertifikat Terbit", time: c.startLabel.replace("Selesai pada ", ""), text: `Skor post-test ${c.postTest ?? "-"}/100. Growth Report telah dikirim.`, tone: "primary" },
      { title: "Program Tuntas", time: "14/14", text: "Seluruh refleksi harian dan sesi live diselesaikan.", tone: "soft" },
    ];
  }
  const log: LogEntry[] = [
    { title: `Hari ${c.day}: Refleksi Tersimpan`, time: "Terakhir", text: "Jawaban terbaru tersimpan otomatis (autosave).", tone: "primary" },
    { title: "Gating Terbuka Otomatis", time: "Kemarin", text: `Modul Hari ${Math.max(c.day - 1, 1)} diselesaikan sebelum pukul 22:00.`, tone: "soft" },
  ];
  if (c.delayDays >= 1) {
    log.unshift({ title: `Tertunda ${c.delayDays} Hari`, time: "Sekarang", text: c.gatingNote ?? "Belum ada refleksi baru; pertimbangkan sapaan lembut.", tone: "alert" });
  }
  log.push({ title: "Aktivasi Akun Resmi", time: c.startLabel.split(",")[0], text: c.activationLog, tone: "primary" });
  return log;
}
