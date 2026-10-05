"use client";

import Link from "next/link";
import { useState } from "react";
import { CLASS_INFO, SESSIONS } from "@/data/admin-curriculum";
import { INITIAL_COUPLES, progressPercent } from "@/data/admin-couples";
import { INITIAL_COACH_NOTES, MOOD, WEEKLY_STRAIN } from "@/data/admin-insight";
import { CYCLE_STATS, INITIAL_SCHEDULE } from "@/data/admin-prompts";
import { sendNudge } from "@/lib/admin-actions";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";
import { useAdminUi } from "./admin-shell";
import { PageHeader, btnPrimary, btnSoft } from "./page-header";

const counts = {
  total: INITIAL_COUPLES.length,
  pending: INITIAL_COUPLES.filter((c) => c.status === "pending").length,
  active: INITIAL_COUPLES.filter((c) => c.status === "active" || c.status === "backlog").length,
  alumni: INITIAL_COUPLES.filter((c) => c.status === "alumni").length,
};
const backlog = INITIAL_COUPLES.filter((c) => c.status === "backlog");
const pending = INITIAL_COUPLES.filter((c) => c.status === "pending");
const todayPrompt = INITIAL_SCHEDULE.find((i) => i.state === "active")!;
const peak = WEEKLY_STRAIN.reduce((a, b) => (b.value > a.value ? b : a));
const readyNotes = INITIAL_COACH_NOTES.filter((n) => n.status === "ready").length;
const nextSession = SESSIONS.find((s) => s.state === "upcoming")!;

const ACTIVITY = [
  { icon: "lock_open", tone: "bg-sage-tint text-primary", title: "Sarah & Rizky mendaftar", text: "Transfer mandiri valid, menunggu aktivasi manual.", time: "08:52" },
  { icon: "favorite", tone: "bg-secondary-container text-secondary", title: "Nudge afeksi terkirim", text: "Sapaan lembut untuk pasutri dengan backlog gating.", time: "08:10" },
  { icon: "edit_note", tone: "bg-accent-sunray/40 text-tertiary", title: `Prompt Hari ke-${todayPrompt.day} tayang`, text: `“${todayPrompt.title}” didistribusikan pukul 05.00 WIB.`, time: "05:00" },
  { icon: "task_alt", tone: "bg-accent-mint text-primary", title: "Catatan coach difinalkan", text: "Larasati & Dimas siap dikirim ke Growth Report.", time: "Kemarin" },
];

export function DashboardOverview() {
  const { openNudge } = useAdminUi();
  const { showToast } = useToast();
  const [sending, setSending] = useState<string | null>(null);

  async function nudge(id: string, name: string, phone: string) {
    setSending(id);
    const result = await sendNudge({ kind: "couple", id, name });
    setSending(null);
    if (!result.ok) return showToast(result.error);
    showToast(`Nudge afeksi dikirim ke ${name} (${phone}).`, { tone: "success" });
  }

  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-8 px-4 py-8 sm:px-8">
      <PageHeader
        pill="RINGKASAN HARI INI"
        meta="Pembaruan Sinkron: Hari ini, 09:42 WIB"
        title="Dashboard"
        description="Gambaran cepat kondisi Cohort 04: peserta yang perlu disapa, kelas yang berjalan, prompt yang tayang hari ini, dan denyut emosional pasutri secara agregat."
        actions={
          <>
            <Link href="/admin/peserta" className={btnSoft}>
              <Icon name="group" size={19} className="text-text-muted" />
              <span>Lihat Semua Peserta</span>
            </Link>
            <button type="button" onClick={() => openNudge()} className={btnPrimary}>
              <Icon name="send" size={18} />
              <span>Kirim Nudge</span>
            </button>
          </>
        }
      />

      {/* KPI */}
      <section aria-label="Ringkasan utama" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiLink href="/admin/peserta" icon="diversity_1" tone="bg-sage-tint text-primary" card="bg-canvas-ivory" label="Total Pendaftar" value={String(counts.total)} unit="Pasutri" note={<><span className="font-semibold text-primary">{counts.active} Aktif</span> • <span className="font-semibold text-accent-coral">{counts.pending} Menunggu</span> • {counts.alumni} Alumni</>} />
        <KpiLink href="/admin/peserta" icon="schedule" tone="bg-secondary-container text-secondary" card="bg-secondary-container/40" label="Backlog Gating Kritis" value={String(backlog.length)} unit="Pasang" note="Memerlukan sentuhan afeksi coach" valueClass="text-secondary" />
        <KpiLink href="/admin/prompt" icon="edit_note" tone="bg-accent-mint text-primary" card="bg-canvas-ivory" label="Kepatuhan Renungan" value={`${CYCLE_STATS.compliance}%`} unit="Hari ini" note={`${CYCLE_STATS.responded} pasutri merespons • ${CYCLE_STATS.needNudge} perlu nudge Subuh`} />
        <KpiLink href="/admin/insight" icon="psychology_alt" tone="bg-sky-calm/30 text-primary-container" card="bg-canvas-ivory" label="Skor Relasional Berjalan" value="78.6" unit="/ 100" note="Pre-Test 71.2 → +7.4 poin. Target ≥ 85.0" />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Perlu perhatian */}
        <section aria-label="Perlu perhatian" className="space-y-5 rounded-3xl bg-canvas-ivory p-7 shadow-sm xl:col-span-7">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-secondary-container text-secondary"><Icon name="notifications_active" size={22} /></span>
              <div>
                <h2 className="t-headline-sm text-on-surface">Perlu Perhatian Hari Ini</h2>
                <p className="t-label-sm font-normal text-text-muted">{backlog.length} backlog gating • {pending.length} menunggu aktivasi</p>
              </div>
            </div>
            <Link href="/admin/peserta" className="t-label-md flex shrink-0 items-center gap-1 text-primary hover:underline">Kelola <Icon name="arrow_forward" size={16} /></Link>
          </div>

          <div>
            <h3 className="t-label-sm mb-2 tracking-wider text-text-muted uppercase">Backlog gating</h3>
            <ul className="space-y-2.5">
              {backlog.map((c) => (
                <li key={c.id} className="flex flex-col justify-between gap-3 rounded-2xl bg-secondary-container/20 p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <span className="t-title-sm flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary-container font-semibold text-secondary">{c.initials}</span>
                    <div>
                      <p className="t-title-sm font-semibold text-on-surface">{c.name}</p>
                      <p className="t-body-sm text-text-muted">Tertahan di H-{c.day} • tertunda {c.delayDays} hari • {progressPercent(c)}%</p>
                    </div>
                  </div>
                  <button type="button" disabled={sending === c.id} onClick={() => nudge(c.id, c.shortName, c.phone)} className="t-label-md flex shrink-0 items-center justify-center gap-1 rounded-full bg-secondary px-3.5 py-1.5 text-on-secondary shadow-sm transition-all hover:bg-on-secondary-fixed-variant disabled:opacity-70">
                    <Icon name="favorite" size={16} />{sending === c.id ? "Mengirim..." : "Nudge Afeksi"}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="t-label-sm mb-2 tracking-wider text-text-muted uppercase">Menunggu aktivasi</h3>
            <ul className="space-y-2.5">
              {pending.slice(0, 3).map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 rounded-2xl bg-accent-coral/5 p-4">
                  <div className="flex items-center gap-3">
                    <span className="t-title-sm flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary-fixed font-semibold text-on-secondary-fixed-variant">{c.initials}</span>
                    <div>
                      <p className="t-title-sm font-semibold text-on-surface">{c.name}</p>
                      <p className="t-body-sm text-text-muted">{c.id} • {c.subtitle}</p>
                    </div>
                  </div>
                  <Link href="/admin/peserta" className="t-label-md shrink-0 rounded-full bg-surface-container-low px-3 py-1.5 text-on-surface transition-colors hover:bg-surface">Tinjau</Link>
                </li>
              ))}
            </ul>
            {pending.length > 3 && <p className="t-body-sm mt-2 text-text-muted">+{pending.length - 3} pasutri lainnya menunggu aktivasi.</p>}
          </div>
        </section>

        {/* Kelas berjalan */}
        <section aria-label="Kelas berjalan" className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl bg-surface-container-low p-7 shadow-sm xl:col-span-5">
          <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-sage-tint/40 blur-3xl" />
          <div className="relative space-y-4">
            <span className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-3 py-1 font-semibold text-on-primary-fixed"><span className="size-2 rounded-full bg-primary" />Kelas Berjalan</span>
            <h2 className="t-headline-md text-on-surface">{CLASS_INFO.title}</h2>
            <p className="t-body-md text-text-muted">{CLASS_INFO.description}</p>
            <div className="space-y-2">
              <div className="t-label-md flex justify-between"><span className="font-semibold text-on-surface">Sesi 2 Berjalan</span><span className="text-text-muted">{CLASS_INFO.progressPercent}% periode selesai</span></div>
              <div role="progressbar" aria-label="Progres siklus kelas" aria-valuenow={CLASS_INFO.progressPercent} aria-valuemin={0} aria-valuemax={100} className="h-3 w-full overflow-hidden rounded-full bg-surface-container">
                <div className="h-full rounded-full bg-primary" style={{ width: `${CLASS_INFO.progressPercent}%` }} />
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-surface p-4 shadow-sm">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sage-tint text-primary"><Icon name="videocam" size={22} /></span>
              <div>
                <p className="t-label-sm font-normal text-text-muted">Sesi live berikutnya</p>
                <p className="t-title-sm font-semibold text-on-surface">{nextSession.title}</p>
                <p className="t-body-sm text-text-muted">{nextSession.dateLabel}</p>
              </div>
            </div>
          </div>
          <Link href="/admin/kelas" className="t-title-sm relative flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-on-primary shadow-md transition-colors hover:bg-primary-container">
            <span>Kelola Kelas &amp; Sesi</span><Icon name="arrow_forward" size={18} />
          </Link>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section aria-label="Prompt hari ini" className="flex flex-col justify-between gap-5 rounded-3xl bg-canvas-ivory p-7 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="t-label-sm rounded-full bg-primary-container px-3 py-1 font-bold text-on-primary-container">AKTIF · H-{todayPrompt.day}</span>
              <span className="t-label-sm font-normal text-text-muted">{todayPrompt.responseRate}% merespons</span>
            </div>
            <h2 className="t-headline-sm leading-snug text-on-surface">“{todayPrompt.prompt}”</h2>
          </div>
          <Link href="/admin/prompt" className="t-label-md flex items-center gap-1 self-start text-primary hover:underline">Kelola Prompt Jurnal <Icon name="arrow_forward" size={16} /></Link>
        </section>

        <section aria-label="Insight singkat" className="flex flex-col justify-between gap-5 rounded-3xl bg-canvas-ivory p-7 shadow-sm">
          <div className="space-y-4">
            <h2 className="t-headline-sm text-on-surface">Insight Singkat</h2>
            <dl className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-surface-container-lowest/80 p-3">
                <dt className="t-body-sm text-on-surface">Mood dominan: {MOOD.dominant.label}</dt>
                <dd className="t-title-sm font-semibold text-primary">{MOOD.dominant.percent}%</dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-surface-container-lowest/80 p-3">
                <dt className="t-body-sm text-on-surface">Puncak kelelahan: {peak.day}</dt>
                <dd className="t-title-sm font-semibold text-accent-coral">{peak.value} / 10</dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-surface-container-lowest/80 p-3">
                <dt className="t-body-sm text-on-surface">Catatan coach siap</dt>
                <dd className="t-title-sm font-semibold text-primary">{readyNotes}/{INITIAL_COACH_NOTES.length}</dd>
              </div>
            </dl>
          </div>
          <Link href="/admin/insight" className="t-label-md flex items-center gap-1 self-start text-primary hover:underline">Lihat Agregat Insight <Icon name="arrow_forward" size={16} /></Link>
        </section>

        <section aria-label="Aktivitas terbaru" className="rounded-3xl bg-canvas-ivory p-7 shadow-sm">
          <h2 className="t-headline-sm mb-4 text-on-surface">Aktivitas Terbaru</h2>
          <ol className="space-y-4">
            {ACTIVITY.map((a) => (
              <li key={a.title} className="flex items-start gap-3">
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${a.tone}`}><Icon name={a.icon} size={18} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="t-title-sm truncate font-semibold text-on-surface">{a.title}</p>
                    <span className="t-label-sm shrink-0 font-normal text-text-muted">{a.time}</span>
                  </div>
                  <p className="t-body-sm text-text-muted">{a.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <Link href="/admin/panduan" className="group flex items-center justify-between gap-4 rounded-3xl bg-sage-tint/40 p-6 transition-colors hover:bg-sage-tint/70">
        <span className="flex items-center gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary"><Icon name="help_outline" size={20} /></span>
          <span>
            <span className="t-title-sm block font-semibold text-on-surface">Panduan &amp; SOP Pendampingan</span>
            <span className="t-body-sm text-text-muted">Aturan gating, etika nudge, privasi agregat, dan integritas kurikulum.</span>
          </span>
        </span>
        <Icon name="arrow_forward" size={20} className="shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

function KpiLink({ href, icon, tone, card, label, value, unit, note, valueClass = "text-on-surface" }: { href: string; icon: string; tone: string; card: string; label: string; value: string; unit: string; note: React.ReactNode; valueClass?: string }) {
  return (
    <Link href={href} className={`group flex flex-col justify-between rounded-3xl p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${card}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="t-label-sm mb-1 block tracking-wider text-text-muted uppercase">{label}</span>
          <div className="flex items-baseline gap-2">
            <span className={`t-display ${valueClass}`}>{value}</span>
            <span className="t-title-sm text-text-muted">{unit}</span>
          </div>
        </div>
        <span className={`flex size-10 items-center justify-center rounded-2xl ${tone}`}><Icon name={icon} size={22} /></span>
      </div>
      <p className="t-body-sm mt-4 pt-3 text-text-muted">{note}</p>
    </Link>
  );
}
