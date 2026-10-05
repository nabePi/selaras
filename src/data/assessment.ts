/** Self Growth Assessment (Pre & Post). Static: ganti `completed` dengan data pengguna nanti. */
export const PRE_ASSESSMENT = {
  completed: false,
  minutes: 7,
};

export type AssessmentPart = "mindset" | "habit";

export type AssessmentKind = "pre" | "post";

export const ASSESSMENT_KINDS: Record<AssessmentKind, { title: string; short: string }> = {
  pre: { title: "Pre Assessment", short: "Pre" },
  post: { title: "Post Assessment", short: "Post" },
};

export type AssessmentItem = {
  id: string;
  part: AssessmentPart;
  dimension: string;
  text: string;
};

export const ASSESSMENT_PARTS: Record<
  AssessmentPart,
  { title: string; hint: string; scale: string[] }
> = {
  mindset: {
    title: "Mindset",
    hint: "Seberapa setuju kamu dengan pernyataan berikut?",
    scale: ["Sangat Tidak Setuju", "Tidak Setuju", "Netral", "Setuju", "Sangat Setuju"],
  },
  habit: {
    title: "Daily Habit",
    hint: "Seberapa sering kamu melakukannya dalam 2 minggu terakhir?",
    scale: ["Tidak Pernah", "Jarang", "Kadang-kadang", "Sering", "Selalu / Setiap Hari"],
  },
};

type BaseItem = Omit<AssessmentItem, "id">;

const m = (dimension: string, text: string): BaseItem => ({
  part: "mindset",
  dimension,
  text,
});
const h = (dimension: string, text: string): BaseItem => ({
  part: "habit",
  dimension,
  text,
});

const BASE_ITEMS: BaseItem[] = [
  m("Ketaatan & Otonomi", "Saya percaya taat pada suami dan mengembangkan potensi diri bisa berjalan bersamaan, bukan pilihan salah satu."),
  m("Ketaatan & Otonomi", "Saya tidak lagi merasa harus \"mengecilkan diri\" untuk terlihat sebagai istri yang baik."),
  m("Ketaatan & Otonomi", "Saya memahami batasan ketaatan yang sehat dalam pernikahan saya."),
  m("Circle Awareness", "Saya sadar bahwa circle pertemanan saya memengaruhi arah pertumbuhan saya."),
  m("Circle Awareness", "Saya merasa punya kendali untuk menata circle saya secara sadar, bukan sekadar mengikuti arus."),
  m("Circle Awareness", "Saya percaya keputusan soal circle saya adalah hak saya sendiri untuk mengevaluasi."),
  m("Growth sebagai Pilihan Sadar", "Saya percaya pertumbuhan pribadi tidak terjadi otomatis, tapi perlu diusahakan dengan sengaja."),
  m("Growth sebagai Pilihan Sadar", "Saya melihat diri saya sebagai orang yang terus berproses, bukan sudah \"selesai\" berkembang."),
  m("Growth sebagai Pilihan Sadar", "Saya yakin usia atau status pernikahan tidak membatasi seberapa jauh saya bisa bertumbuh."),
  m("Kesiapan sebagai Proses", "Saya memahami kesiapan (termasuk soal punya anak) sebagai proses bertahap, bukan target sekali jadi."),
  m("Kesiapan sebagai Proses", "Saya tidak menekan diri saya dengan standar kesiapan yang kaku."),
  m("Kesiapan sebagai Proses", "Saya merasa lebih tenang memandang timeline hidup saya sendiri, dibanding sebelumnya."),
  m("Ambisi & Pernikahan Selaras", "Saya percaya ambisi/karier saya tidak harus dikorbankan demi pernikahan saya."),
  m("Ambisi & Pernikahan Selaras", "Saya melihat pernikahan sebagai ruang yang mendukung ambisi saya, bukan menghambatnya."),
  m("Ambisi & Pernikahan Selaras", "Saya merasa punya bahasa/kerangka untuk mendiskusikan ambisi saya dengan pasangan."),
  h("Praktik Ruhiyah", "Saya meluangkan waktu khusus untuk ibadah/dzikir di luar kewajiban rutin."),
  h("Praktik Ruhiyah", "Saya melakukan refleksi/muhasabah diri secara sadar."),
  h("Praktik Ruhiyah", "Saya mendoakan secara spesifik hal yang ingin saya perbaiki dalam diri."),
  h("Self-development", "Saya membaca buku/artikel, mendengar podcast, atau mengikuti kursus terkait pengembangan diri."),
  h("Self-development", "Saya mencatat/menjurnal progres pertumbuhan saya."),
  h("Self-development", "Saya mengambil langkah konkret (bukan cuma niat) untuk area yang ingin saya kembangkan."),
  h("Circle Engagement", "Saya menghubungi/menghabiskan waktu dengan orang yang menguatkan pertumbuhan saya."),
  h("Circle Engagement", "Saya menetapkan batasan dengan orang/situasi yang menahan pertumbuhan saya."),
  h("Circle Engagement", "Saya menjadi sumber dukungan bagi orang lain di circle saya."),
  h("Financial Awareness", "Saya mencatat/meninjau kondisi keuangan saya secara sadar."),
  h("Financial Awareness", "Saya membuat keputusan finansial yang mendukung tujuan jangka panjang saya (bukan impulsif)."),
  h("Financial Awareness", "Saya mendiskusikan rencana keuangan dengan pasangan secara terbuka."),
  h("Self-care Fisik & Mental", "Saya menjaga waktu istirahat/tidur yang cukup."),
  h("Self-care Fisik & Mental", "Saya meluangkan waktu untuk diri sendiri (me-time) secara sengaja."),
  h("Self-care Fisik & Mental", "Saya memperhatikan kondisi emosi saya dan mencari cara sehat untuk mengelolanya."),
];

const withIds = (items: BaseItem[]): AssessmentItem[] =>
  items.map((it, i) => ({ ...it, id: `${it.part === "mindset" ? "m" : "h"}${i < 15 ? i + 1 : i - 14}` }));

/**
 * Soal Pre dan Post identik agar skornya bisa dibandingkan. Static: soal buatan admin
 * nanti diambil dari API per jenis assessment.
 */
export const ASSESSMENT_SETS: Record<AssessmentKind, AssessmentItem[]> = {
  pre: withIds(BASE_ITEMS),
  post: withIds(BASE_ITEMS),
};

/** Label band dari rata-rata skor (skala 1-5). */
export function scoreBand(avg: number) {
  if (avg < 2.5) return { label: "Baru Menyadari", tone: "bg-secondary-container text-secondary" };
  if (avg < 3.5) return { label: "Mulai Bergerak", tone: "bg-accent-sunray/40 text-on-surface" };
  if (avg < 4.5) return { label: "Bertumbuh Konsisten", tone: "bg-sage-tint text-primary" };
  return { label: "Berkembang Mantap", tone: "bg-primary text-on-primary" };
}
