import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { SectionHeading } from "@/components/section-heading";
import { VideoReel } from "@/components/video-reel";
import { TEAM } from "@/data/team";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const LIFE_SERVICES = [
  { icon: "school", text: "Kelas tumbuh dalam iman, pemberdayaan diri, dan merawat keluarga" },
  { icon: "forum", text: "Konseling privat: pertumbuhan diri, pernikahan, dan keluarga" },
];

const LAKTASI_SERVICES = [
  { icon: "child_friendly", text: "Kelas edukasi kehamilan, persalinan, dan menyusui" },
  { icon: "self_improvement", text: "Kelas olahraga prenatal & postnatal" },
  { icon: "volunteer_activism", text: "Konseling menyusui privat & pijat laktasi" },
];

const MOMENTS_SERVICES = ["Birth", "Family", "Event", "Creative Branding", "Corporate"];

const PERAN = [
  { title: "Rumah", icon: "home" },
  { title: "Rahim", icon: "favorite" },
  { title: "Ruh", icon: "spa" },
];

export default function HomePage() {
  return (
    <div className="flex w-full flex-col gap-y-6">
      {/* 1. Hero */}
      <section className="relative mt-4 w-full overflow-hidden rounded-3xl bg-canvas-ivory p-6 shadow-sm">
        <div className="pointer-events-none absolute -top-12 -right-12 size-48 rounded-full bg-sage-tint/60 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 size-44 rounded-full bg-secondary-container/30 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-3">
          <h1 className="t-headline-lg-mobile mt-1 tracking-tight text-on-surface">
            Your companion for{" "}
            <span className="font-serif text-primary italic">every season</span>{" "}
            of life
          </h1>
          <p className="t-body-md leading-relaxed text-text-muted">
            Gerakan dakwah dan sosial yang membersamai keluarga muslim kembali
            kepada fitrah, mengalirkan hidup selaras wahyu, dari rumah tangga,
            masa hamil dan menyusui, hingga momen-momen yang layak dikenang.
          </p>
          <ul className="mt-1 flex flex-wrap gap-2">
            {["Selaras Life", "Selaras Laktasi", "Selaras Moments"].map((n) => (
              <li
                key={n}
                className="t-label-sm rounded-full bg-surface-container-lowest px-3 py-1 text-on-surface-variant shadow-sm"
              >
                {n}
              </li>
            ))}
          </ul>
          <Link
            href="/program"
            className="t-title-sm mt-2 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-on-primary shadow-[0_4px_14px_rgba(78,97,72,0.25)] transition-all active:scale-[0.98]"
          >
            <span>Lihat Program Selaras</span>
            <Icon name="arrow_forward" size={18} />
          </Link>
        </div>
      </section>

      {/* Video perkenalan */}
      <section className="flex w-full flex-col gap-3">
        <SectionHeading
          eyebrow="Kenalan Dulu"
          title="Selaras Life dalam satu video"
          description="Ketuk untuk memutar."
        />
        <VideoReel
          src="/videos/selaras-reels.mp4"
          poster="/videos/selaras-reels-poster.jpg"
          title="Selaras Life Reels"
        />
      </section>

      {/* 2. Selaras Life */}
      <section className="flex w-full flex-col gap-4 rounded-3xl bg-surface-container-low p-5 shadow-sm">
        <Image
          src="/images/logo-header.png"
          alt="Selaras Life"
          width={720}
          height={323}
          sizes="160px"
          className="h-16 w-auto self-start"
        />
        <div className="flex flex-col gap-3">
          <h2 className="t-headline-sm text-on-surface">
            Membangun keluarga yang kokoh, selaras dengan wahyu
          </h2>
          <p className="t-body-md leading-relaxed text-text-muted">
            Di tengah derasnya arus perang pemikiran, umat kehilangan kompas.
            Selaras Life hadir membersamai manusia kembali kepada fitrah dengan
            membangun cara pandang hidup (worldview) yang lurus.
          </p>
          <p className="t-body-md leading-relaxed text-text-muted">
            Kami meyakini peradaban dibangun di dalam rumah. Keluarga adalah
            institusi pertama pembentuk manusia, tempat nilai diwariskan, aqidah
            ditanamkan, dan cinta kepada Rabb dikuatkan. Bukan sekadar kontrak
            sosial, keluarga adalah poros peradaban, tempat lahirnya pemimpin,
            pendidik, dan pejuang umat.
          </p>
        </div>

        <div className="rounded-2xl bg-canvas-cream p-4">
          <span className="t-label-sm tracking-wider text-secondary uppercase">
            Menghidupkan kembali peran
          </span>
          <ul className="mt-2 grid grid-cols-3 gap-2">
            {PERAN.map((p) => (
              <li
                key={p.title}
                className="flex flex-col items-center gap-1 rounded-xl bg-sage-tint py-3 text-primary"
              >
                <Icon name={p.icon} size={22} filled />
                <span className="t-title-sm">{p.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <ServiceList items={LIFE_SERVICES} />
        <BrandCta
          name="Selaras Life"
          handle="selaras.life"
          buttonClassName="bg-primary text-on-primary"
          linkClassName="text-text-muted"
        />
      </section>

      {/* 3. Selaras Laktasi */}
      <section className="flex w-full flex-col gap-4 rounded-3xl bg-canvas-cream p-5 shadow-sm">
        <Image
          src="/images/logo-laktasi.png"
          alt="Selaras Laktasi"
          width={600}
          height={521}
          sizes="144px"
          className="h-28 w-auto self-start"
        />
        <div className="flex flex-col gap-3">
          <h2 className="t-headline-sm text-on-surface">
            Hamil, melahirkan, menyusui: perjalanan suci yang tak ditempuh sendiri
          </h2>
          <p className="t-body-md leading-relaxed text-text-muted">
            Kehamilan, persalinan, dan menyusui bukan sekadar proses biologis,
            tetapi ladang ibadah yang sarat makna. Ayah hadir sebagai qawwam,
            pemimpin dan pendamping setia dengan ilmu, kasih sayang, dan
            tanggung jawab.
          </p>
          <p className="t-body-md leading-relaxed text-text-muted">
            Selaras Laktasi membersamai keduanya dengan edukasi, pendampingan,
            dan layanan profesional berbasis iman dan fitrah, agar setiap tetes
            ASI menjadi warisan cinta dan tauhid menuju generasi izzah.
          </p>
        </div>

        <ServiceList items={LAKTASI_SERVICES} />

        <div className="flex flex-col gap-3">
          <Verse
            text="Ibunya mengandungnya dengan susah payah dan melahirkannya dengan susah payah pula..."
            source="QS. Al-Ahqaf: 15"
          />
          <Verse
            text="Para ibu hendaklah menyusukan anak-anaknya selama dua tahun penuh, yaitu bagi yang ingin menyempurnakan penyusuan."
            source="QS. Al-Baqarah: 233"
          />
        </div>
        <BrandCta
          name="Selaras Laktasi"
          handle="selaraslaktasi"
          buttonClassName="bg-secondary text-on-secondary"
          linkClassName="text-text-muted"
        />
      </section>

      {/* 4. Selaras Moments */}
      <section className="flex w-full flex-col gap-4 rounded-3xl bg-tertiary p-5 text-on-tertiary shadow-sm">
        <Image
          src="/images/logo-moments.png"
          alt="Selaras Moments: Capturing yang story into legacy"
          width={800}
          height={414}
          sizes="224px"
          className="h-auto w-56 self-start"
        />
        <div className="flex flex-col gap-3">
          <h2 className="t-headline-sm text-on-tertiary">
            Dokumentasi sebagai penjaga nilai dan pengingat cinta kepada Allah
          </h2>
          <p className="t-body-md leading-relaxed text-on-tertiary/85">
            Begitu banyak peristiwa keluarga berlalu tanpa makna dan jejak.
            Padahal setiap momen adalah kesempatan menguatkan iman, memperdalam
            cinta, dan menanam nilai. Bagi kami, dokumentasi adalah media
            spiritual untuk merawat fitrah dan menjaga warisan iman.
          </p>
        </div>

        <figure className="rounded-2xl bg-on-tertiary/10 p-4">
          <blockquote className="t-quote italic">
            “…dan (Yusuf) pun berkehendak padanya, jika tidak karena dia melihat
            tanda (burhan) dari Rabb-nya.”
          </blockquote>
          <figcaption className="t-body-sm mt-1 text-on-tertiary/80">
            QS. Yusuf: 24
          </figcaption>
          <p className="t-body-sm mt-3 leading-relaxed text-on-tertiary/85">
            Para ulama menafsirkan burhan itu sebagai bayangan wajah sang ayah,
            Nabi Ya’qub: memori spiritual yang menjaga jiwa kala fitnah
            menyergap. Selaras Moments mengabadikan nasihat ibu, tatapan teduh
            ayah, dan doa-doa yang kelak menguatkan anak kembali kepada
            Rabb-nya, juga menguatkan cinta suami dan istri.
          </p>
        </figure>

        <div>
          <span className="t-label-sm tracking-wider text-on-tertiary/80 uppercase">
            Layanan foto &amp; video
          </span>
          <ul className="mt-2 flex flex-wrap gap-2">
            {MOMENTS_SERVICES.map((s) => (
              <li
                key={s}
                className="t-label-md rounded-full bg-on-tertiary/15 px-3 py-1"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
        <BrandCta
          name="Selaras Moments"
          handle="selarasmoments"
          buttonClassName="bg-canvas-cream text-tertiary"
          linkClassName="text-on-tertiary/80"
        />
      </section>

      {/* 5. Tim */}
      <section className="flex w-full flex-col gap-3">
        <SectionHeading
          eyebrow="Tim Selaras"
          title="Orang-orang di balik Selaras"
          description="Para konselor, edukator, dan praktisi yang siap membersamai perjalananmu."
        />
        <ul className="mt-1 flex flex-col gap-3">
          {TEAM.map((m) => (
            <li
              key={m.slug}
              className="flex w-full gap-4 rounded-2xl bg-surface-container-low p-3 shadow-sm"
            >
              <Image
                src={m.photo}
                alt={m.name}
                width={640}
                height={800}
                sizes="128px"
                className="aspect-[4/5] w-32 shrink-0 rounded-xl bg-canvas-sand object-cover"
              />
              <div className="flex min-w-0 flex-col justify-center gap-1">
                <h3 className="t-title-md text-on-surface">
                  {m.name}
                  {m.nickname && (
                    <span className="font-normal text-text-muted"> ({m.nickname})</span>
                  )}
                </h3>
                <span className="t-label-md text-primary">{m.role}</span>
                <p className="t-body-sm leading-relaxed text-text-muted">
                  {m.credentials}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 6. CTA ke Program */}
      <section className="relative flex w-full flex-col gap-3 overflow-hidden rounded-3xl bg-secondary p-6 text-on-secondary shadow-md">
        <div className="relative z-10 flex flex-col gap-2">
          <span className="t-label-sm tracking-wider text-secondary-container uppercase">
            Kenali Lebih Dekat
          </span>
          <h2 className="t-headline-md font-medium text-on-secondary">
            Temukan program yang sesuai dengan fase hidupmu
          </h2>
          <p className="t-body-md leading-relaxed text-secondary-fixed/90">
            Kelas, konseling, pendampingan menyusui, hingga dokumentasi momen
            keluarga. Semuanya ada di halaman program.
          </p>
          <Link
            href="/program"
            className="t-title-sm mt-2 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-canvas-cream px-6 text-secondary shadow-sm transition-transform hover:bg-canvas-ivory active:scale-[0.98]"
          >
            <span>Jelajahi Program Selaras</span>
            <Icon name="arrow_forward" size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function ServiceList({ items }: { items: { icon: string; text: string }[] }) {
  return (
    <div>
      <span className="t-label-sm tracking-wider text-text-muted uppercase">
        Layanan
      </span>
      <ul className="mt-2 flex flex-col gap-2">
        {items.map((s) => (
          <li
            key={s.text}
            className="flex items-center gap-3 rounded-xl bg-surface-container-lowest p-3 shadow-sm"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sage-tint text-primary">
              <Icon name={s.icon} size={20} />
            </span>
            <span className="t-body-sm text-on-surface">{s.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Verse({ text, source }: { text: string; source: string }) {
  return (
    <figure className="rounded-2xl bg-sage-tint p-4">
      <blockquote className="t-quote text-on-surface italic">“{text}”</blockquote>
      <figcaption className="t-body-sm mt-1 font-medium text-primary">
        {source}
      </figcaption>
    </figure>
  );
}

function BrandCta({
  name,
  handle,
  buttonClassName,
  linkClassName,
}: {
  name: string;
  handle: string;
  buttonClassName: string;
  linkClassName: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Link
        href="/program"
        className={`t-title-sm flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full px-5 shadow-sm transition-all active:scale-[0.98] ${buttonClassName}`}
      >
        <span>Lihat Program {name}</span>
        <Icon name="arrow_forward" size={18} />
      </Link>
      <a
        href={`https://www.instagram.com/${handle}/`}
        target="_blank"
        rel="noopener noreferrer"
        className={`t-body-sm flex min-h-11 items-center gap-1.5 hover:underline ${linkClassName}`}
      >
        <Icon name="link" size={16} />
        <span>Ikuti @{handle} di Instagram</span>
      </a>
    </div>
  );
}
