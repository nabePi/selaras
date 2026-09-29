import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AudioPreview } from "@/components/audio-preview";
import { FaqAccordion } from "@/components/faq-accordion";
import { Icon } from "@/components/icon";
import { SampleReflection } from "@/components/sample-reflection";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const PILLARS = [
  {
    icon: "timer",
    tone: "bg-sage-tint text-primary",
    title: "3 Menit Terpandu",
    body: "Prompt bermakna yang dirancang psikolog keluarga muslim. Hilangkan rasa bingung mau menulis apa di sela kesibukan harian.",
  },
  {
    icon: "all_inclusive",
    tone: "bg-surface-container-high text-tertiary",
    title: "Ritme Gating Berurutan",
    body: "Materi dan lembar refleksi terbuka hari demi hari secara berirama, menjaga Anda dan pasangan tetap konsisten tanpa kewalahan.",
  },
  {
    icon: "switch_left",
    tone: "bg-secondary-container/60 text-secondary",
    title: "Privasi Aman & Terjaga",
    body: "Kendali penuh ada di tangan Anda. Pilih simpan sebagai catatan personal, atau bagikan secara privat ke coach pendamping Anda.",
  },
];

const COHORT_HIGHLIGHTS = [
  { icon: "groups", title: "3 Sesi Live", caption: "Kelas Interaktif" },
  { icon: "edit_calendar", title: "14 Hari Jurnal", caption: "Refleksi Berurutan" },
  { icon: "analytics", title: "Relational Test", caption: "Pre & Post Assessment" },
  { icon: "volunteer_activism", title: "1-on-1 Feedback", caption: "Respons Jurnal Coach" },
];

const FAQ = [
  {
    question: "Bagaimana jika pasangan saya belum bersedia menulis bersama?",
    answer:
      "Sangat tidak apa-apa. Selaras dirancang agar kebaikan bisa dimulai dari satu pihak. Banyak pasangan alumni yang terinspirasi bergabung setelah melihat perubahan ketenangan dan kelembutan dari pasangannya yang lebih dulu berproses.",
  },
  {
    question: "Apakah ada versi gratis yang bisa dicoba tanpa komitmen?",
    answer:
      "Ya! Anda dapat mendaftar akun gratis untuk mengakses jurnal refleksi harian gratis selama 7 hari pertama, materi hikmah harian, dan ringkasan mini hadis keluarga tanpa perlu kartu kredit.",
  },
  {
    question: "Bagaimana privasi isi jurnal kami dijaga?",
    answer:
      "Catatan harian Anda terenkripsi aman. Anda memiliki sakelar privasi di setiap lembar untuk menentukan apakah catatan itu hanya untuk mata Anda sendiri, dibagi ke pasangan, atau diajukan untuk bimbingan konselor.",
  },
];

export default function HomePage() {
  return (
    <div className="flex w-full flex-col gap-y-6">
      {/* 1. Hero */}
      <section className="relative w-full overflow-hidden rounded-3xl bg-canvas-ivory p-6 shadow-sm">
        <div className="pointer-events-none absolute -top-12 -right-12 size-48 rounded-full bg-sage-tint/60 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 size-44 rounded-full bg-secondary-container/30 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-3">
          <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-sage-tint px-3 py-1 text-primary">
            <Icon name="eco" size={16} />
            <span className="t-label-sm">
              Faith in Every Step · Growth in Every Season
            </span>
          </div>
          <h1 className="t-headline-lg-mobile mt-1 tracking-tight text-on-surface">
            Tumbuh Bersama dalam{" "}
            <span className="font-serif text-primary italic">Iman</span> &amp;
            Ketenangan Jiwa
          </h1>
          <p className="t-body-md leading-relaxed text-text-muted">
            Ruang refleksi harian &amp; pendampingan pernikahan muda terpandu.
            Hadir mendampingi kebiasaan baik pasutri muslim cukup 3 menit
            sehari.
          </p>

          <div className="relative mt-1 h-44 w-full overflow-hidden rounded-2xl shadow-inner">
            <Image
              src="/images/hero-journal.jpg"
              alt="Jurnal terbuka di samping dua cangkir teh dan ranting zaitun di meja kayu yang hangat"
              fill
              priority
              sizes="(max-width: 480px) 100vw, 432px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 via-transparent to-transparent" />
            <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between gap-2 text-on-secondary">
              <span className="t-body-sm font-serif italic">
                “Ketenangan hadir dari kebiasaan kecil yang dirawat bersama.”
              </span>
              <span className="t-label-sm shrink-0 rounded-full bg-surface/80 px-2 py-0.5 text-tertiary backdrop-blur-md">
                3 Menit/Hari
              </span>
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-2.5">
            <Link
              href="/daftar"
              className="t-title-sm flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-on-primary shadow-[0_4px_14px_rgba(78,97,72,0.25)] transition-all active:scale-[0.98]"
            >
              <span>Daftar &amp; Mulai Jurnal</span>
              <Icon name="favorite" size={18} />
            </Link>
            <a
              href="#interactive-sample"
              className="t-title-sm flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-surface-container-low px-5 text-tertiary transition-colors active:bg-surface-container"
            >
              <span>Coba Contoh Refleksi Hari Ini</span>
              <Icon name="arrow_downward" size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* 2. Hikmah & Hadis Hari Ini */}
      <section className="relative w-full overflow-hidden rounded-3xl bg-surface-container-low p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-secondary-container/60 text-secondary">
              <Icon name="menu_book" size={16} />
            </span>
            <span className="t-label-md text-text-muted">
              Hikmah &amp; Hadis Hari Ini
            </span>
          </div>
          <span className="t-label-sm rounded-full bg-secondary-fixed/50 px-2.5 py-0.5 text-secondary">
            Terbuka Publik
          </span>
        </div>
        <blockquote className="t-quote relative my-2 pl-3 text-on-surface">
          <span
            aria-hidden="true"
            className="absolute -top-2 -left-1 font-serif text-3xl text-secondary-container select-none"
          >
            “
          </span>
          <p className="relative z-10 italic">
            Sebaik-baik kalian adalah yang paling baik terhadap keluarganya, dan
            aku adalah yang paling baik di antara kalian terhadap keluargaku.
          </p>
          <footer className="t-body-sm mt-2 font-medium text-tertiary not-italic">
            — HR. Tirmidzi (No. 3895)
          </footer>
        </blockquote>
        <div className="mt-4 flex flex-col gap-2.5 pt-3">
          <p className="t-body-sm text-text-muted">
            <span className="t-title-sm text-on-surface">
              Pemantik Renungan:
            </span>{" "}
            Sudahkah sapaan pertama kita pagi ini melembutkan suasana hati
            pasangan?
          </p>
          <AudioPreview />
        </div>
      </section>

      {/* 3. Tiga pilar */}
      <section className="flex w-full flex-col gap-3">
        <SectionHeading
          eyebrow="Filosofi Pendampingan"
          title="Mengapa Mulai Journaling di Selaras?"
          description="Membangun kebiasaan hening dan komunikasi terarah tanpa beban digital."
        />
        <ul className="mt-1 grid grid-cols-1 gap-3">
          {PILLARS.map((p) => (
            <li
              key={p.title}
              className="flex w-full items-start gap-3.5 rounded-2xl bg-canvas-cream p-4 shadow-sm"
            >
              <span
                className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl ${p.tone}`}
              >
                <Icon name={p.icon} size={22} />
              </span>
              <div className="flex min-w-0 flex-col">
                <h3 className="t-title-md text-on-surface">{p.title}</h3>
                <p className="t-body-sm mt-1 leading-relaxed text-text-muted">
                  {p.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. Cohort aktif */}
      <section className="relative w-full overflow-hidden rounded-3xl bg-surface-container p-5 shadow-sm">
        <div className="pointer-events-none absolute top-0 right-0 size-32 rounded-full bg-accent-sunray/20 blur-xl" />
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="t-label-sm rounded-full bg-primary px-3 py-0.5 font-semibold tracking-wide text-on-primary">
              Cohort 4 Dibuka
            </span>
            <span className="t-body-sm flex items-center gap-1 font-medium text-secondary">
              <span className="size-2 animate-ping rounded-full bg-accent-coral" />
              Sisa 12 Kursi Pasangan
            </span>
          </div>
          <div>
            <h2 className="t-headline-sm font-semibold text-on-surface">
              Young Marriage Foundations
            </h2>
            <p className="t-body-sm mt-0.5 text-text-muted">
              Program pendampingan intensif 14 hari menavigasi adaptasi
              tahun-tahun awal pernikahan.
            </p>
          </div>
          <ul className="my-1 grid grid-cols-2 gap-2">
            {COHORT_HIGHLIGHTS.map((h) => (
              <li
                key={h.title}
                className="flex items-center gap-2 rounded-xl bg-surface-container-low p-2.5"
              >
                <Icon name={h.icon} size={20} className="text-primary" />
                <div className="flex flex-col">
                  <span className="t-title-sm text-on-surface">{h.title}</span>
                  <span className="t-label-sm text-text-muted">{h.caption}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-1 flex items-center gap-3 rounded-2xl bg-surface-container-lowest/80 p-3">
            <Image
              src="/images/coach-afifah.jpg"
              alt="Coach Afifah, M.Psi"
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-full bg-canvas-sand object-cover"
            />
            <div className="flex flex-col">
              <span className="t-title-sm text-on-surface">
                Coach Afifah, M.Psi
              </span>
              <span className="t-body-sm text-text-muted">
                Psikolog Keluarga &amp; Tim Konselor Selaras
              </span>
            </div>
          </div>
          <Link
            href="/program"
            className="t-title-sm mt-1 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-on-primary shadow-sm transition-all hover:bg-primary-container"
          >
            <span>Lihat Detail Kurikulum &amp; Daftar</span>
            <Icon name="arrow_forward" size={18} />
          </Link>
        </div>
      </section>

      {/* 5. Simulasi refleksi */}
      <section
        id="interactive-sample"
        className="flex w-full scroll-mt-20 flex-col gap-3 rounded-3xl bg-canvas-cream p-5 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-primary">
            <Icon name="stylus_note" size={20} />
            <span className="t-label-md font-semibold">
              Simulasi Refleksi 3 Menit
            </span>
          </div>
          <span className="t-label-sm rounded-full bg-accent-mint/60 px-2 py-0.5 text-on-surface-variant">
            Hari 1 dari 14
          </span>
        </div>
        <div>
          <h2 className="t-headline-sm text-on-surface">
            “Apa satu hal kecil yang pasanganmu lakukan kemarin yang membuat
            hatimu merasa dihargai?”
          </h2>
          <p className="t-body-sm mt-1 text-text-muted">
            Cobalah ketik satu kalimat saja di bawah ini untuk merasakan
            tenangnya menjeda pikiran:
          </p>
        </div>
        <SampleReflection />
      </section>

      {/* 6. Testimoni */}
      <section className="flex w-full flex-col gap-3">
        <SectionHeading
          eyebrow="Suara Pasutri"
          eyebrowClassName="text-secondary"
          title="Tumbuh Bersama Alumni Cohort"
        />
        <figure className="relative flex w-full flex-col gap-3 rounded-3xl bg-canvas-ivory p-5 shadow-sm">
          <figcaption className="flex items-center gap-3">
            <Image
              src="/images/couple-dimas-larasati.jpg"
              alt="Dimas dan Larasati"
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-full bg-secondary-fixed object-cover"
            />
            <div className="flex flex-col">
              <span className="t-title-sm text-on-surface">
                Dimas (29) &amp; Larasati (27)
              </span>
              <span className="t-body-sm text-text-muted">
                Menikah 1,5 Tahun · Alumni Cohort 3
              </span>
            </div>
          </figcaption>
          <blockquote className="t-quote leading-relaxed text-on-surface italic">
            “Awalnya kami canggung ngobrol mendalam karena sama-sama lelah
            pulang kerja. Jurnal Selaras memberi kami ritual{" "}
            <span className="font-semibold text-secondary not-italic">
              pillow talk 10 menit tanpa gadget
            </span>
            . Rasanya jauh lebih terhubung dan damai.”
          </blockquote>
          <div className="flex items-center justify-between pt-2 text-text-muted">
            <div
              role="img"
              aria-label="Penilaian 5 dari 5 bintang"
              className="flex items-center gap-1 text-accent-coral"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="star" size={18} filled />
              ))}
            </div>
            <span className="t-label-sm rounded-full bg-surface-container-high px-2.5 py-0.5 text-on-surface-variant">
              Terverifikasi Anggota
            </span>
          </div>
        </figure>
      </section>

      {/* 7. FAQ */}
      <section className="flex w-full flex-col gap-3">
        <SectionHeading
          eyebrow="Pertanyaan Sering Diajukan"
          title="Jawaban untuk Keraguan Anda"
        />
        <FaqAccordion items={FAQ} />
      </section>

      {/* 8. Ekosistem Selaras */}
      <section className="flex w-full flex-col gap-4 rounded-3xl border border-border-subtle/50 bg-surface-container-low p-5 shadow-sm">
        <div className="flex flex-col px-1">
          <div className="mb-1 inline-flex items-center gap-1.5 self-start rounded-full bg-sage-tint px-2.5 py-0.5 text-primary">
            <Icon name="diversity_1" size={16} />
            <span className="t-label-sm font-semibold tracking-wider uppercase">
              Keluarga Selaras
            </span>
          </div>
          <h2 className="t-headline-sm text-on-surface">
            Satu Ekosistem untuk Setiap Fase Kehidupan Keluarga
          </h2>
          <p className="t-body-sm mt-1 leading-relaxed text-text-muted">
            Mendampingi perjalanan pasutri muslim dari fondasi awal pernikahan,
            masa menyusui penuh cinta, hingga merekam setiap momen tumbuh
            kembang si kecil.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <EcosystemCard
            icon="spa"
            iconTone="bg-sage-tint text-primary"
            name="Selaras Life"
            tagline="Pondasi Pernikahan"
            taglineTone="text-primary"
            body="Pondasi keintiman & relasi pasutri sakinah lewat refleksi terpandu harian 3 menit dan program pendampingan intensif."
            badge={
              <span className="t-label-sm rounded-full bg-sage-tint px-2 py-0.5 text-primary">
                Aktif di sini
              </span>
            }
          />
          <EcosystemCard
            icon="child_care"
            iconTone="bg-secondary-container/60 text-secondary"
            name="Selaras Laktasi"
            tagline="Perjalanan MengASIhi"
            taglineTone="text-secondary"
            body="Perjalanan mengASIhi dengan tenang dan dukungan suportif pasutri menyusui bersama edukasi praktis konselor laktasi."
            badge={
              <InstagramLink
                handle="selaraslaktasi"
                className="bg-secondary-fixed/50 text-secondary"
              />
            }
          />
          <EcosystemCard
            icon="photo_camera"
            iconTone="bg-surface-container-high text-tertiary"
            name="Selaras Moments"
            tagline="Memori Buah Hati"
            taglineTone="text-tertiary"
            body="Mengabadikan setiap detik berharga kehamilan, persalinan lembut, hingga milestones tumbuh kembang buah hati."
            badge={
              <InstagramLink
                handle="selarasmoments"
                className="bg-surface-container text-tertiary"
              />
            }
          />
        </div>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-canvas-cream p-3">
          <div className="flex items-center gap-2">
            <Icon name="hub" size={18} className="text-primary" />
            <span className="t-label-sm font-medium text-on-surface">
              Ikuti Kanal Resmi Ekosistem
            </span>
          </div>
          <div className="flex items-center gap-2">
            <InstagramLink
              handle="selaraslaktasi"
              plain
              className="bg-secondary-fixed/50 text-secondary hover:bg-secondary-container"
            />
            <InstagramLink
              handle="selarasmoments"
              plain
              className="bg-sage-tint text-primary hover:bg-primary/20"
            />
          </div>
        </div>
      </section>

      {/* 9. CTA penutup */}
      <section className="relative flex w-full flex-col gap-3 overflow-hidden rounded-3xl bg-secondary p-6 text-on-secondary shadow-md">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -bottom-6 size-32 opacity-15"
        >
          <svg className="size-full fill-current" viewBox="0 0 100 100">
            <path d="M50 0 C70 30 90 40 100 70 C70 90 40 70 0 50 C20 40 40 20 50 0 Z" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col gap-2">
          <span className="t-label-sm tracking-wider text-secondary-container uppercase">
            Langkah Awal Bersama
          </span>
          <h2 className="t-headline-md font-medium text-on-secondary">
            Siap Menghadirkan Rumah Tangga yang Sakinah &amp; Selaras?
          </h2>
          <p className="t-body-md leading-relaxed text-secondary-fixed/90">
            Mulailah dari satu jeda kecil hari ini. Tanpa tuntutan kesempurnaan,
            hanya kesediaan untuk hadir dengan hati yang utuh.
          </p>
          <div className="mt-2 flex flex-col gap-2">
            <Link
              href="/daftar"
              className="t-title-sm flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-canvas-cream px-6 text-secondary shadow-sm transition-transform hover:bg-canvas-ivory active:scale-[0.98]"
            >
              <span>Buat Akun Gratis Sekarang</span>
              <Icon name="arrow_forward" size={18} />
            </Link>
            <div className="flex items-center justify-center gap-2 pt-1 text-secondary-fixed/80">
              <Icon name="verified_user" size={16} />
              <span className="t-label-sm">Bebas Iklan · Ruang Hening Islami</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InstagramLink({
  handle,
  className,
  plain = false,
}: {
  handle: string;
  className: string;
  plain?: boolean;
}) {
  return (
    <a
      href={`https://instagram.com/${handle}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`t-label-sm flex items-center gap-1 rounded-full transition-colors hover:underline ${
        plain ? "px-2 py-0.5" : "px-2.5 py-1"
      } ${className}`}
    >
      {!plain && <Icon name="link" size={14} />}
      <span>@{handle}</span>
    </a>
  );
}

function EcosystemCard({
  icon,
  iconTone,
  name,
  tagline,
  taglineTone,
  body,
  badge,
}: {
  icon: string;
  iconTone: string;
  name: string;
  tagline: string;
  taglineTone: string;
  body: string;
  badge: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-2.5 rounded-2xl border border-border-subtle/50 bg-canvas-ivory p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-full ${iconTone}`}
          >
            <Icon name={icon} size={20} />
          </span>
          <div>
            <h3 className="t-title-md text-on-surface">{name}</h3>
            <span className={`t-label-sm font-medium ${taglineTone}`}>
              {tagline}
            </span>
          </div>
        </div>
        {badge}
      </div>
      <p className="t-body-sm leading-relaxed text-text-muted">{body}</p>
    </div>
  );
}
