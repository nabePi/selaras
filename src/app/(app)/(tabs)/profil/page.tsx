import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ComingSoonButton } from "@/components/coming-soon-button";
import { Icon } from "@/components/icon";
import { InstallPwa } from "@/components/install-pwa";
import { ReminderTime } from "@/components/reminder-time";
import { ASSESSMENT, CURRICULUM as C, MEMBER } from "@/data/member";

export const metadata: Metadata = { title: "Profil" };

const CHIP_BTN =
  "t-label-sm flex items-center gap-1 rounded-full bg-surface-bright px-3 py-1.5 shadow-xs transition-colors";

export default function ProfilPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      {/* 1. Kartu profil */}
      <section className="relative overflow-hidden rounded-4xl bg-surface-container-low p-4 shadow-sm">
        <div className="pointer-events-none absolute -right-6 -bottom-6 size-32 rounded-full bg-sage-tint/40" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-2">
            <div className="flex size-20 items-center justify-center rounded-full bg-surface-bright p-1 shadow-sm">
              <Image
                src={MEMBER.avatar}
                alt={MEMBER.fullName}
                width={72}
                height={72}
                className="size-full rounded-full object-cover"
              />
            </div>
            <span className="absolute right-0 bottom-0 flex size-6 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm">
              <Icon name="favorite" size={14} filled />
            </span>
          </div>
          <h1 className="t-headline-md text-on-surface">{MEMBER.fullName}</h1>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
            <span className="t-label-sm rounded-full bg-sage-tint px-3 py-1 text-primary">
              Peserta Aktif · {MEMBER.cohort}
            </span>
            <span className="t-label-sm rounded-full bg-surface-container px-2.5 py-1 text-tertiary">
              Pasangan: {MEMBER.partnerName}
            </span>
          </div>
          <p className="t-body-sm mt-2 flex items-center gap-1 text-text-muted">
            <Icon name="calendar_today" size={15} />
            {MEMBER.joinedLabel}
          </p>
          <div className="mt-4 grid w-full grid-cols-2 gap-1 pt-1">
            <div className="t-title-sm flex items-center justify-center gap-1.5 rounded-2xl bg-surface-bright p-2 text-on-surface shadow-sm">
              <Icon name="verified" size={18} className="text-primary" />
              {MEMBER.reflectionDays} Hari Refleksi
            </div>
            <div className="t-title-sm flex items-center justify-center gap-1.5 rounded-2xl bg-surface-bright p-2 text-on-surface shadow-sm">
              <Icon name="auto_stories" size={18} className="text-secondary" />
              {MEMBER.journalEntries} Entri Jurnal
            </div>
          </div>
        </div>
      </section>

      {/* 2. Kurikulum */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="t-label-sm tracking-wider text-primary uppercase">
              Kurikulum Terjadwal
            </span>
            <h2 className="t-headline-sm text-on-surface">{C.title}</h2>
          </div>
          <span className="t-label-sm shrink-0 rounded-full bg-secondary-container px-2.5 py-1 font-medium text-on-secondary-container">
            {C.progressLabel}
          </span>
        </div>

        <ol className="flex flex-col gap-4 rounded-4xl bg-surface-container-low p-4 shadow-sm">
          {C.sessions.map((s) => (
            <li key={s.id} className="relative flex gap-2">
              <div className="flex flex-col items-center">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-on-primary shadow-xs">
                  <Icon name="check" size={16} />
                  <span className="sr-only">Selesai</span>
                </span>
                <span className="my-1 h-full w-0.5 bg-sage-medium/40" />
              </div>
              <div className="flex-1 pb-1">
                <div className="flex items-center justify-between">
                  <span className="t-label-sm font-semibold text-primary">{s.label}</span>
                  <span className="t-body-sm text-text-muted">{s.date}</span>
                </div>
                <h3 className="t-title-sm mt-0.5 text-on-surface">{s.title}</h3>
                <p className="t-body-sm mt-1 text-text-muted">{s.summary}</p>
                <div className="mt-2 flex gap-2">
                  {s.actions.map((a) => (
                    <ComingSoonButton
                      key={a.label}
                      feature={a.label}
                      className={`${CHIP_BTN} ${a.tone} hover:bg-sage-tint`}
                    >
                      <Icon name={a.icon} size={15} />
                      {a.label}
                    </ComingSoonButton>
                  ))}
                </div>
              </div>
            </li>
          ))}

          <li className="flex gap-2">
            <div className="flex flex-col items-center">
              <span className="flex size-7 animate-pulse items-center justify-center rounded-full bg-accent-coral text-surface-bright shadow-xs">
                <Icon name="videocam" size={16} />
                <span className="sr-only">Mendatang</span>
              </span>
            </div>
            <div className="flex-1 rounded-2xl bg-surface-bright p-2 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="t-label-sm rounded-full bg-secondary-fixed px-2 py-0.5 font-semibold text-on-secondary-fixed-variant">
                  {C.upcoming.label}
                </span>
                <span className="t-label-sm font-medium text-secondary">{C.upcoming.date}</span>
              </div>
              <h3 className="t-title-sm mt-1.5 text-on-surface">{C.upcoming.title}</h3>
              <p className="t-body-sm mt-1 text-text-muted">{C.upcoming.detail}</p>
              <ComingSoonButton
                feature="Tautan Zoom Kelas"
                className="t-title-sm mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-on-primary shadow-sm transition-transform active:scale-[0.98]"
              >
                <Icon name="meeting_room" size={18} />
                Buka Tautan Zoom Kelas
              </ComingSoonButton>
            </div>
          </li>
        </ol>
      </section>

      {/* 3. Evaluasi pre & post */}
      <section
        id="evaluasi"
        className="flex scroll-mt-20 flex-col gap-4 rounded-4xl bg-surface-container-low p-4 shadow-sm"
      >
        <div>
          <div className="flex items-center gap-1.5 text-primary">
            <Icon name="monitoring" size={20} filled />
            <span className="t-label-sm font-semibold tracking-wider uppercase">
              Evaluasi Berkala
            </span>
          </div>
          <h2 className="t-headline-sm mt-0.5 text-on-surface">Pertumbuhan Pre &amp; Post Test</h2>
          <p className="t-body-sm mt-1 text-text-muted">{ASSESSMENT.description}</p>
        </div>

        {ASSESSMENT.pillars.map((p) => {
          const primary = p.tone === "primary";
          return (
            <div key={p.name} className="flex flex-col gap-2 rounded-2xl bg-surface-bright p-2 shadow-xs">
              <div className="flex items-baseline justify-between gap-2">
                <span className="t-title-sm text-on-surface">{p.name}</span>
                <span className="t-label-sm flex items-center gap-1">
                  <span className="font-normal text-text-muted">Awal: {p.before}</span>
                  <span className={`font-semibold ${primary ? "text-primary" : "text-secondary"}`}>
                    → {p.afterLabel}: {p.after}
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      primary
                        ? "bg-sage-tint text-primary"
                        : "bg-secondary-container text-on-secondary-container"
                    }`}
                  >
                    +{p.after - p.before}
                  </span>
                </span>
              </div>
              <div
                role="img"
                aria-label={`${p.name}: awal ${p.before}, ${p.afterLabel.toLowerCase()} ${p.after} dari 100`}
                className="relative h-3 w-full overflow-hidden rounded-full bg-surface-container"
              >
                <div
                  className={`h-full rounded-full ${primary ? "bg-sage-medium/60" : "bg-secondary/40"}`}
                  style={{ width: `${p.before}%` }}
                />
                <div
                  className={`absolute top-0 left-0 h-full rounded-full opacity-85 transition-all duration-700 ${
                    primary ? "bg-primary" : "bg-secondary"
                  }`}
                  style={{ width: `${p.after}%` }}
                />
              </div>
              <div className="flex justify-between gap-2 text-[11px] text-text-muted">
                <span>{p.note}</span>
                <span className={`shrink-0 font-medium ${primary ? "text-primary" : "text-secondary"}`}>
                  {p.result}
                </span>
              </div>
            </div>
          );
        })}

        <figure className="rounded-2xl bg-canvas-ivory p-2 shadow-xs">
          <div className="flex items-start gap-1">
            <Icon name="format_quote" size={24} className="shrink-0 text-primary" />
            <div className="flex flex-col">
              <blockquote className="t-quote leading-relaxed text-on-surface italic">
                “{ASSESSMENT.coachNote}”
              </blockquote>
              <figcaption className="mt-2 flex items-center justify-between gap-2">
                <span className="t-label-sm font-semibold text-primary">— {ASSESSMENT.coachName}</span>
                <span className="t-body-sm text-text-muted">Fasilitator Kelas</span>
              </figcaption>
            </div>
          </div>
        </figure>

        <ComingSoonButton
          feature="Unduh Lembar Refleksi (PDF)"
          className="t-title-sm flex w-full items-center justify-center gap-1 rounded-full bg-surface-bright py-2 text-tertiary shadow-xs transition-colors hover:bg-surface-container"
        >
          <Icon name="download_for_offline" size={18} />
          Unduh Lembar Refleksi Lengkap (PDF)
        </ComingSoonButton>
      </section>

      {/* 4. Pengaturan */}
      <section className="flex flex-col gap-2">
        <h2 className="t-label-sm px-1 tracking-wider text-text-muted uppercase">
          Pengaturan &amp; Perangkat PWA
        </h2>
        <div className="flex flex-col gap-2 rounded-4xl bg-surface-container-low p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 py-1">
            <div className="flex items-center gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sage-tint text-primary">
                <Icon name="alarm" size={20} />
              </span>
              <div className="flex flex-col">
                <span className="t-title-sm text-on-surface">Pengingat Refleksi Harian</span>
                <span className="t-body-sm text-text-muted">Waktu teduh menjelang istirahat</span>
              </div>
            </div>
            <ReminderTime />
          </div>

          <hr className="my-0.5 border-border-subtle/50" />

          <ComingSoonButton
            feature="Cadangkan Jurnal Pernikahan"
            className="group flex w-full items-center justify-between py-1 text-left"
          >
            <span className="flex items-center gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-container text-tertiary">
                <Icon name="picture_as_pdf" size={20} />
              </span>
              <span className="flex flex-col">
                <span className="t-title-sm text-on-surface">Cadangkan Jurnal Pernikahan</span>
                <span className="t-body-sm text-text-muted">Ekspor rangkuman catatan &amp; doa (PDF)</span>
              </span>
            </span>
            <Icon
              name="chevron_right"
              size={18}
              className="text-text-muted transition-transform group-hover:translate-x-0.5"
            />
          </ComingSoonButton>

          <hr className="my-0.5 border-border-subtle/50" />

          <div className="flex items-center justify-between gap-2 rounded-2xl bg-surface-bright p-2 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-mint/70 text-primary">
                <Icon name="install_mobile" size={20} />
              </span>
              <div className="flex flex-col">
                <span className="t-title-sm text-on-surface">Instal Aplikasi Selaras</span>
                <span className="t-body-sm text-text-muted">Akses cepat di layar beranda HP</span>
              </div>
            </div>
            <InstallPwa />
          </div>
        </div>
      </section>

      {/* 5. Bantuan & keluar */}
      <section className="mt-1 flex flex-col gap-1">
        <ComingSoonButton
          feature="Hubungi Fasilitator"
          className="t-title-sm flex w-full items-center justify-between rounded-2xl bg-surface-container-low px-4 py-3 text-on-surface shadow-xs transition-colors hover:bg-surface-container"
        >
          <span className="flex items-center gap-2">
            <Icon name="support_agent" size={20} className="text-primary" />
            <span>Hubungi Fasilitator &amp; Pendamping</span>
          </span>
          <Icon name="open_in_new" size={18} className="text-text-muted" />
        </ComingSoonButton>
        {/* Sementara mengarah ke beranda publik; ganti dengan aksi logout saat auth tersedia. */}
        <Link
          href="/"
          className="t-title-sm mt-1 flex w-full items-center gap-2 rounded-2xl bg-surface-container-low px-4 py-3 text-error shadow-xs transition-colors hover:bg-surface-container"
        >
          <Icon name="logout" size={20} />
          <span>Keluar dari Akun</span>
        </Link>
      </section>
    </div>
  );
}
