import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { PageHeader } from "@/components/admin/page-header";

export const metadata: Metadata = { title: "Panduan & SOP" };

type Sop = {
  id: string;
  icon: string;
  tone: string;
  title: string;
  summary: string;
  rules: string[];
  href?: { label: string; to: string };
};

const SOPS: Sop[] = [
  {
    id: "gating",
    icon: "lock_clock",
    tone: "bg-sage-tint text-primary",
    title: "Sequential gating & catch-up",
    summary: "Refleksi terbuka hari demi hari; hari tertunda harus dilunasi sebelum topik berikutnya.",
    rules: [
      "Materi dan lembar refleksi terbuka berurutan. Jika ada entri tertunda, peserta menuntaskannya dulu sebelum membuka topik hari ini.",
      "Backlog dianggap kritis bila tertunda lebih dari 2 hari dan muncul di daftar “Perlu Perhatian”.",
      "Setiap perubahan jawaban tersimpan sebagai versi baru dan tercatat pada riwayat gating pasutri.",
      "“Reset Titik Hari” hanya dilakukan koordinator setelah berkomunikasi dengan pasutri.",
    ],
    href: { label: "Buka Aktivasi & Data Peserta", to: "/admin/peserta" },
  },
  {
    id: "nudge",
    icon: "favorite",
    tone: "bg-secondary-container text-secondary",
    title: "Etika nudge afeksi",
    summary: "Sapaan pendampingan bersifat hangat, tidak menghakimi, dan tidak membuka isi jurnal pribadi.",
    rules: [
      "Gunakan sapaan lembut berbasis afeksi Islami; hindari bahasa yang menekan atau membandingkan pasutri.",
      "Nudge dikirim lewat WhatsApp atas nama coach; jangan mengutip isi jurnal yang berstatus privat.",
      "Beri jeda yang wajar antar nudge kepada pasutri yang sama agar tidak terasa menuntut.",
      "Untuk nudge massal, pilih kelompok penerima yang paling relevan (backlog, belum mengisi hari ini, atau semua aktif).",
    ],
  },
  {
    id: "aktivasi",
    icon: "lock_open",
    tone: "bg-accent-mint text-primary",
    title: "Aktivasi peserta",
    summary: "Peserta baru berstatus Registered User sampai tim pendamping memverifikasi dan mengaktifkan akses.",
    rules: [
      "Periksa bukti pembayaran dan kelengkapan data sebelum menekan “Aktifkan Akses”.",
      "Aktivasi membuka titik gating H-1 dan mengirim pesan selamat datang beserta tautan PWA.",
      "Pasutri yang ditambahkan manual dapat langsung diaktifkan atau menunggu aktivasi manual.",
      "Catatan pendamping bersifat rahasia (coach only) dan tidak terlihat oleh peserta.",
    ],
    href: { label: "Buka Aktivasi & Data Peserta", to: "/admin/peserta" },
  },
  {
    id: "prompt",
    icon: "menu_book",
    tone: "bg-accent-sunray/40 text-tertiary",
    title: "Prompt jurnal harian",
    summary: "Satu prompt global didistribusikan serentak setiap Subuh.",
    rules: [
      "Distribusi serentak pukul 05.00 WIB. Satu slot (sesi + hari) hanya boleh memiliki satu prompt; duplikat ditolak dan diarahkan ke prompt yang ada.",
      "Prompt yang sudah terbit dan direspons peserta tidak dapat diubah.",
      "Format respons yang tersedia: teks bebas, skala 1–10, opsi ganda, dan mood check.",
      "Jika slot kosong, sistem memakai template fallback.",
    ],
    href: { label: "Buka Kelola Prompt Jurnal", to: "/admin/prompt" },
  },
  {
    id: "kurikulum",
    icon: "calendar_month",
    tone: "bg-sage-tint text-primary",
    title: "Integritas kurikulum",
    summary: "Satu kelas aktif dalam satu waktu; durasi sesi berjalan hanya boleh diperpanjang.",
    rules: [
      "Sistem membatasi satu kelas aktif; cohort baru hanya dapat dibuat setelah kelas berjalan selesai.",
      "Durasi hari journaling pada sesi yang sedang berjalan hanya dapat diperpanjang, tidak dipersingkat.",
      "Prompt harian dibuka otomatis pukul 04.00 Subuh mengikuti jadwal sesi live.",
      "Tombol join Zoom di aplikasi pasutri aktif 15 menit sebelum sesi.",
      "Bank soal post-test terkunci formatnya saat peserta pertama membukanya di hari ke-21.",
    ],
    href: { label: "Buka Manajemen Kelas & Sesi", to: "/admin/kurikulum" },
  },
  {
    id: "privasi",
    icon: "shield_person",
    tone: "bg-secondary-container text-secondary",
    title: "Privasi & agregat insight",
    summary: "Insight ditampilkan agregat dan anonim; teks jurnal subjektif tetap terenkripsi.",
    rules: [
      "Data agregat hanya tampil bila jumlah pasutri memenuhi ambang batas minimal (≥ 5).",
      "Teks jurnal berstatus privat tidak dapat dibaca coach; jawaban skala dianonimkan untuk kurikulum bersama.",
      "Jangan membagikan tangkapan layar yang memuat identitas pasutri di luar tim pendamping.",
    ],
    href: { label: "Buka Agregat Insight Emosional", to: "/admin/insight" },
  },
  {
    id: "growth",
    icon: "stylus_note",
    tone: "bg-accent-mint text-primary",
    title: "Growth Report & catatan coach",
    summary: "Setiap pasutri menerima narasi personal dari coach sebelum sertifikat dan laporan akhir dicetak.",
    rules: [
      "Tulis catatan yang spesifik, hangat, dan menyoroti kemajuan; finalkan setelah ditinjau coach lain bila perlu.",
      "Hanya catatan berstatus “Siap Kirim” yang disertakan ke laporan PDF.",
    ],
    href: { label: "Buka Antrean Catatan Coach", to: "/admin/insight" },
  },
];

export default function PanduanPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-8">
      <PageHeader
        pulse={false}
        pill="BANTUAN & SOP"
        meta="v2.4 Coach"
        title="Panduan & SOP Pendampingan"
        description="Ringkasan aturan kerja coach dan admin Selaras Life. Aturan ini juga dijaga oleh sistem, misalnya gating berurutan dan larangan prompt ganda."
      />

      <nav aria-label="Daftar isi" className="rounded-3xl bg-canvas-cream p-4 shadow-sm">
        <ul className="flex flex-wrap gap-2">
          {SOPS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="t-label-md flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 text-on-surface-variant shadow-xs transition-colors hover:bg-sage-tint hover:text-primary">
                <Icon name={s.icon} size={16} />
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-4">
        {SOPS.map((s, i) => (
          <details key={s.id} id={s.id} open={i === 0} className="group scroll-mt-24 rounded-3xl bg-canvas-ivory shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-3xl p-6 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-4">
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${s.tone}`}><Icon name={s.icon} size={22} /></span>
                <span>
                  <h2 className="t-headline-sm text-on-surface">{s.title}</h2>
                  <p className="t-body-sm text-text-muted">{s.summary}</p>
                </span>
              </span>
              <Icon name="expand_more" size={24} className="shrink-0 text-text-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="space-y-4 px-6 pb-6">
              <ul className="space-y-3">
                {s.rules.map((r) => (
                  <li key={r} className="t-body-md flex items-start gap-3 text-on-surface-variant">
                    <Icon name="check_circle" size={18} filled className="mt-0.5 shrink-0 text-primary" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              {s.href && (
                <Link href={s.href.to} className="t-label-md inline-flex items-center gap-1 text-primary hover:underline">
                  {s.href.label} <Icon name="arrow_forward" size={16} />
                </Link>
              )}
            </div>
          </details>
        ))}
      </div>

      <aside className="flex items-start gap-4 rounded-3xl bg-sage-tint/40 p-6">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary"><Icon name="support_agent" size={20} /></span>
        <div className="space-y-1">
          <h2 className="t-title-sm font-semibold text-on-surface">Butuh keputusan di luar SOP?</h2>
          <p className="t-body-sm leading-relaxed text-text-muted">
            Untuk kasus yang belum diatur di sini, diskusikan dengan Head Facilitator sebelum menindaklanjuti pasutri. Dokumen ini akan diperbarui mengikuti kebijakan program.
          </p>
        </div>
      </aside>
    </div>
  );
}
