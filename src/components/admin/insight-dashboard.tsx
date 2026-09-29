"use client";

import Link from "next/link";
import { useState } from "react";
import {
  INITIAL_COACH_NOTES,
  INSIGHT_KPIS,
  MOOD,
  PRE_POST,
  PRIVACY_THRESHOLD,
  PROMPT_AGGREGATES,
  WEEKLY_STRAIN,
  type CoachNote,
  type PromptAggregate,
} from "@/data/admin-insight";
import { finalizeCoachNote, saveAllCoachNotes } from "@/lib/admin-actions";
import { ComingSoonButton } from "../coming-soon-button";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";
import { useAdminUi } from "./admin-shell";
import { PageHeader, btnPrimary, btnSoft } from "./page-header";

const NOTES_PER_PAGE = 3;
const CIRCUMFERENCE = 2 * Math.PI * 62;

export function InsightDashboard() {
  const { openNudge } = useAdminUi();
  const [scope, setScope] = useState<"active" | "all">("active");

  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-8 px-4 py-8 sm:px-8">
      <PageHeader
        pill={`Kerahasiaan Terproteksi: N=${PRIVACY_THRESHOLD.n} Pasutri (Ambang Batas ≥${PRIVACY_THRESHOLD.min} Terpenuhi)`}
        meta="Pembaruan Sinkron: 14 Menit Lalu"
        title="Agregat Insight Emosional & Analitik Pertumbuhan"
        description="Pantau kesehatan emosional pasutri secara agregat anonim, telaah pergeseran kebiasaan refleksi, dan siapkan catatan pendampingan untuk laporan pertumbuhan mandiri (Growth Report)."
        actions={
          <>
            <ComingSoonButton feature="Eksplorasi matriks pre-post" className={btnSoft}>
              <Icon name="tune" size={18} className="text-tertiary" /><span>Eksplorasi Matriks Pre-Post</span>
            </ComingSoonButton>
            <button type="button" onClick={() => openNudge("unfilled")} className="t-label-md flex items-center gap-2 rounded-full bg-sage-tint px-5 py-2.5 text-on-primary-fixed-variant transition-all hover:bg-sage-medium/30">
              <Icon name="chat_bubble" size={18} className="text-primary" /><span>Kirim Nudge Massal</span>
            </button>
            <ComingSoonButton feature="Unduh ringkasan agregat (PDF)" className={btnPrimary}>
              <Icon name="download" size={18} /><span>Unduh Ringkasan Agregat (PDF)</span>
            </ComingSoonButton>
          </>
        }
      />

      <div className="flex flex-col items-center justify-between gap-4 rounded-3xl bg-canvas-cream p-4 shadow-sm md:flex-row">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 rounded-2xl bg-surface-container-lowest px-3 py-1.5 shadow-sm">
            <Icon name="groups_3" size={20} className="text-primary" />
            <span className="t-title-sm text-on-surface">Cohort 04 — Young Marriage (Pekan 2)</span>
          </div>
          <div className="hidden h-4 w-px bg-canvas-sand sm:block" />
          <div className="t-body-sm flex items-center gap-2 text-text-muted">
            <Icon name="lock_person" size={16} className="text-primary-container" />
            <span>Privacy by Design: Teks jurnal subjektif terenkripsi end-to-end</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span id="scope-label" className="t-label-sm font-normal text-text-muted">Tampilan Sesi:</span>
          <div role="radiogroup" aria-labelledby="scope-label" className="inline-flex rounded-full bg-surface-container-lowest p-1 shadow-sm">
            {([["active", "Sesi 1 & 2 Aktif"], ["all", "Semua Sesi (1-5)"]] as const).map(([v, label]) => (
              <label key={v} className={`t-label-sm cursor-pointer rounded-full px-3.5 py-1 transition-all focus-within:outline-2 focus-within:outline-primary ${scope === v ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"}`}>
                <input type="radio" name="scope" value={v} checked={scope === v} onChange={() => setScope(v)} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* KPI */}
      <section aria-label="Barometer relasional" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {INSIGHT_KPIS.map((k) => (
          <div key={k.label} className="flex flex-col justify-between gap-4 rounded-3xl bg-canvas-ivory p-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <span className={`flex size-11 items-center justify-center rounded-2xl ${k.tone}`}><Icon name={k.icon} size={22} /></span>
              <span className={`t-label-sm inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${k.badgeTone}`}>
                {k.badgeIcon && <Icon name={k.badgeIcon} size={14} />}
                {k.badge}
              </span>
            </div>
            <div>
              <span className="t-label-sm tracking-wider text-text-muted uppercase">{k.label}</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="t-display leading-none text-on-surface">{k.value}</span>
                <span className="t-body-md text-text-muted">{k.unit}</span>
              </div>
              <p className="t-body-sm mt-2 text-text-muted">{k.note}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Mood + strain */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section aria-label="Distribusi mood" className="flex flex-col justify-between rounded-3xl bg-canvas-ivory p-7 shadow-sm lg:col-span-5">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="mood" size={22} className="text-primary" />
                <h2 className="t-headline-sm text-on-surface">Distribusi Mood Harian Pasutri</h2>
              </div>
              <span className="t-label-sm shrink-0 rounded-full bg-surface-container-low px-2.5 py-1 font-normal text-text-muted">N={MOOD.checkIns} Check-in</span>
            </div>
            <p className="t-body-sm mb-6 text-text-muted">Agregat anonim dari fitur daily emotional tap-in pada aplikasi mobile peserta sepekan terakhir.</p>
            <div className="relative my-4 flex items-center justify-center">
              <MoodDonut />
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="t-display leading-none text-on-surface">{MOOD.dominant.percent}%</span>
                <span className="t-label-sm mt-0.5 tracking-wide text-primary uppercase">{MOOD.dominant.label}</span>
                <span className="text-[11px] text-text-muted">Dominan Positif</span>
              </div>
            </div>
          </div>
          <ul className="flex flex-col gap-3 pt-4">
            {MOOD.items.map((m) => (
              <li key={m.label} className="flex items-center justify-between rounded-2xl bg-surface-container-lowest/80 p-2.5">
                <span className="flex items-center gap-2.5"><span className={`size-3 rounded-full ${m.dot}`} /><span className="t-title-sm text-on-surface">{m.label}</span></span>
                <span className="flex items-center gap-2"><span className={`t-title-sm font-semibold ${m.text}`}>{m.percent}%</span><span className="text-[11px] text-text-muted">({m.count} data)</span></span>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-6 lg:col-span-7">
          <section aria-label="Fluktuasi beban emosi" className="flex flex-1 flex-col justify-between rounded-3xl bg-canvas-ivory p-7 shadow-sm">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <span className="t-label-sm tracking-wider text-text-muted uppercase">Fluktuasi Beban Emosi Mingguan</span>
                  <h2 className="t-headline-sm text-on-surface">Titik Kelelahan Pasutri Bekerja (Senin - Ahad)</h2>
                </div>
                <span className="t-label-sm shrink-0 rounded-full bg-sage-tint px-3 py-1 text-primary">Rekomendasi Coach Terpasang</span>
              </div>
              <p className="t-body-sm mb-6 text-text-muted">Terlihat kenaikan beban pikiran di Kamis-Jumat. Cocok untuk injeksi prompt kontemplatif ‘Pijat Kasih &amp; Istirahat Berdua’.</p>
              <ul className="flex h-44 w-full items-end justify-between gap-3 rounded-2xl bg-surface-container-lowest px-3 pt-6 pb-2">
                {WEEKLY_STRAIN.map((d) => (
                  <li key={d.day} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <span className={`t-label-sm text-[11px] transition-opacity ${d.peak ? "font-bold text-accent-coral opacity-100" : "font-normal text-text-muted opacity-0 group-hover:opacity-100"}`}>{d.value}</span>
                    <div className={`w-full rounded-t-xl transition-all duration-300 ${d.bar}`} style={{ height: `${d.value * 10}%` }} role="img" aria-label={`${d.day}: beban ${d.value} dari 10`} />
                    <span className={`t-label-sm ${d.peak ? "text-on-surface" : "font-normal text-text-muted"}`}>{d.day}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface-container-high/40 p-3.5">
              <Icon name="lightbulb" size={20} className="shrink-0 text-primary" />
              <p className="t-body-sm leading-snug text-on-surface"><strong className="t-title-sm">Insight Coach:</strong> Hindari penugasan diskusi keuangan di hari Kamis malam. Alihkan jadwal modul Sesi 3 ke Sabtu pagi saat tingkat kejernihan pikiran mencapai 82%.</p>
            </div>
          </section>

          <section aria-label="Pre vs post" className="flex flex-col gap-4 rounded-3xl bg-canvas-ivory p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Icon name="compare_arrows" size={20} className="text-tertiary" />
                <h2 className="t-title-md text-on-surface">Self Growth Assessment: 30 Indikator Kunci (Pre vs Post Berjalan)</h2>
              </div>
              <Link href="/admin/kelas#bank-soal-section" className="t-label-md flex items-center gap-1 text-primary hover:underline">
                Lihat Detail 30 Variabel <Icon name="arrow_forward" size={16} />
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {PRE_POST.map((p) => (
                <li key={p.label} className="rounded-2xl bg-surface-container-lowest p-3.5">
                  <span className="t-label-sm font-normal text-text-muted">{p.label}</span>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="t-title-sm font-normal text-text-muted line-through"><span className="sr-only">Pre: </span>{p.pre}</span>
                    <Icon name="trending_flat" size={14} className="text-text-muted" />
                    <span className="t-title-md font-bold text-primary"><span className="sr-only">Post: </span>{p.post}</span>
                    <span className="rounded-md bg-sage-tint px-1.5 py-0.5 text-[11px] font-semibold text-primary">{p.delta}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* Agregasi prompt */}
      <section aria-label="Agregasi jawaban per prompt" className="flex flex-col gap-6 rounded-3xl bg-canvas-cream p-8 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Icon name="fact_check" size={22} className="text-primary" />
              <h2 className="t-headline-md text-on-surface">Agregasi Jawaban Terstruktur per Prompt Harian</h2>
            </div>
            <p className="t-body-md mt-1 text-text-muted">Data terstruktur dari 30 pasutri aktif. Pertanyaan terbuka diprivatisasi, metrik kuantitatif disajikan untuk telaah coaching.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="t-label-sm font-normal text-text-muted">Filter Sesi:</span>
            <span className="t-label-md rounded-full bg-sage-tint px-3.5 py-1.5 font-semibold text-on-primary-fixed-variant">{scope === "active" ? "Sesi 1 & Sesi 2" : "Semua Sesi (1-5)"}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {PROMPT_AGGREGATES.map((p) => (
            <AggregateCard key={p.id} p={p} />
          ))}
        </div>
        {scope === "all" && (
          <p className="t-body-md flex items-start gap-2 rounded-2xl bg-surface-container-lowest p-4 text-text-muted">
            <Icon name="hourglass_top" size={20} className="mt-0.5 shrink-0 text-tertiary" />
            Sesi 3 sampai 5 belum berjalan, jadi belum ada jawaban yang bisa diagregasi. Data akan muncul otomatis setelah ambang privasi (≥{PRIVACY_THRESHOLD.min} pasutri) terpenuhi.
          </p>
        )}
      </section>

      <CoachNotesQueue />
    </div>
  );
}

function MoodDonut() {
  const segments = MOOD.items.map((m, i) => {
    const before = MOOD.items.slice(0, i).reduce((sum, x) => sum + x.percent, 0);
    return { ...m, length: (m.percent / 100) * CIRCUMFERENCE, offset: (before / 100) * CIRCUMFERENCE };
  });

  return (
    <svg role="img" aria-label={`Distribusi mood: ${MOOD.items.map((m) => `${m.label} ${m.percent}%`).join(", ")}`} className="size-48 -rotate-90" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="62" fill="transparent" stroke="#E8DFD5" strokeOpacity="0.4" strokeWidth="18" />
      {segments.map((m) => (
        <circle key={m.label} cx="80" cy="80" r="62" fill="transparent" stroke={m.stroke} strokeWidth="18" strokeDasharray={`${Math.max(m.length - 3, 1)} ${CIRCUMFERENCE}`} strokeDashoffset={-m.offset} />
      ))}
    </svg>
  );
}

function AggregateCard({ p }: { p: PromptAggregate }) {
  return (
    <article className="flex flex-col justify-between gap-6 rounded-3xl bg-surface-container-lowest p-6 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className={`t-label-sm rounded-full px-3 py-1 font-semibold ${p.badgeTone}`}>{p.badge}</span>
          <span className="t-label-sm font-normal text-text-muted">{p.typeLabel}</span>
        </div>
        <h3 className="t-headline-sm leading-snug text-on-surface">“{p.question}”</h3>
        <p className="t-body-sm text-text-muted">{p.note}</p>
      </div>
      {p.kind === "scale" ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="t-label-sm flex items-center justify-between">
              <span className="font-normal text-text-muted">{p.before.label}</span>
              <span className="t-title-sm font-normal text-text-muted">Rerata: {p.before.value} / 10</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container"><div className="h-full rounded-full bg-canvas-sand" style={{ width: `${p.before.value * 10}%` }} /></div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="t-label-sm flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold text-on-surface"><span className="size-2 rounded-full bg-primary" />{p.after.label}</span>
              <span className="t-title-sm font-bold text-primary">Rerata: {p.after.value} / 10 (+{(p.after.value - p.before.value).toFixed(1)})</span>
            </div>
            <div className="h-3.5 w-full overflow-hidden rounded-full bg-surface-container"><div className="h-full rounded-full bg-primary" style={{ width: `${p.after.value * 10}%` }} /></div>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-surface-container-low p-3">
            <span className="t-body-sm text-on-surface">{p.distribution.label}</span>
            <span className="t-title-sm font-semibold text-primary">{p.distribution.text}</span>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {p.options.map((o) => (
            <li key={o.label} className="flex flex-col gap-1.5">
              <div className="t-label-sm flex items-center justify-between gap-2">
                <span className="font-medium text-on-surface">{o.label}</span>
                <span className={`t-title-sm shrink-0 font-bold ${o.text}`}>{o.percent}% ({o.responses} respon)</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-container"><div className={`h-full rounded-full ${o.bar}`} style={{ width: `${o.percent}%` }} /></div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function CoachNotesQueue() {
  const { showToast } = useToast();
  const [notes, setNotes] = useState<CoachNote[]>(INITIAL_COACH_NOTES);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);

  const pageCount = Math.ceil(notes.length / NOTES_PER_PAGE);
  const rows = notes.slice((page - 1) * NOTES_PER_PAGE, page * NOTES_PER_PAGE);
  const readyCount = notes.filter((n) => n.status === "ready").length;

  function startEdit(n: CoachNote) {
    setEditingId(n.id);
    setDraft(n.note);
  }

  async function finalize(n: CoachNote, text: string) {
    if (text.trim().length < 10) return showToast("Tulis catatan minimal 10 karakter sebelum difinalkan.");
    setBusyId(n.id);
    const result = await finalizeCoachNote(n.id, text);
    setBusyId(null);
    if (!result.ok) return showToast(result.error);
    setNotes((list) => list.map((x) => (x.id === n.id ? { ...x, note: text.trim(), status: "ready" } : x)));
    setEditingId(null);
    showToast(`Catatan untuk ${n.shortName} difinalkan.`, { tone: "success" });
  }

  async function saveAll() {
    setSavingAll(true);
    const result = await saveAllCoachNotes(readyCount);
    setSavingAll(false);
    if (!result.ok) return showToast(result.error);
    showToast(`${readyCount} catatan siap disertakan pada Growth Report.`, { tone: "success", duration: 3500 });
  }

  return (
    <section aria-label="Antrean catatan coach" className="flex flex-col gap-6 rounded-3xl bg-canvas-ivory p-8 shadow-sm">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Icon name="stylus_note" size={24} className="text-primary" />
            <h2 className="t-headline-md text-on-surface">Antrean Catatan Personal Coach (Growth Report PDF)</h2>
          </div>
          <p className="t-body-md mt-1 text-text-muted">Personalisasi narasi evaluasi oleh Coach Afifah &amp; Ustaz Ahmad sebelum pasutri mencetak sertifikat dan Growth Report akhir.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="t-label-sm font-normal text-text-muted">Progres Kurasi: <strong className="font-semibold text-on-surface">{readyCount}/{notes.length} Pasutri Siap</strong></span>
          <button type="button" onClick={saveAll} disabled={savingAll} className="t-label-md flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-on-primary shadow-sm transition-all duration-200 hover:bg-primary-container disabled:opacity-70">
            <Icon name="publish" size={18} />
            <span>{savingAll ? "Menyimpan..." : "Simpan Semua Catatan ke Report"}</span>
          </button>
        </div>
      </div>

      <ul className="flex flex-col gap-4">
        {rows.map((n) => {
          const writing = n.status === "writing";
          const editing = editingId === n.id;
          const showEditor = writing || editing;
          return (
            <li key={n.id} className="flex flex-col justify-between gap-5 rounded-2xl bg-surface-container-lowest p-5 shadow-sm transition-all hover:shadow-md lg:flex-row lg:items-center">
              <div className="flex min-w-[260px] items-start gap-4">
                <span className={`t-headline-sm flex size-12 shrink-0 items-center justify-center rounded-full text-[15px] ${n.tone.avatar}`}>{n.initials}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="t-title-md text-on-surface">{n.shortName}</h3>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${n.tone.streak}`}>{n.streak} Hari Streak</span>
                  </div>
                  <p className="t-body-sm mt-0.5 text-text-muted">Pre-Test: {n.preTest} • Kepatuhan Jurnal: {n.compliance}%</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={`size-2 rounded-full ${writing ? "animate-ping bg-accent-coral" : "bg-primary"}`} />
                    <span className={`t-label-sm font-semibold ${writing ? "text-accent-coral" : "text-primary"}`}>{writing ? "Status: Sedang Ditulis Coach" : "Status: Siap Kirim"}</span>
                  </div>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                {showEditor ? (
                  <>
                    <label htmlFor={`note-${n.id}`} className="t-label-sm mb-1 block font-normal text-text-muted">{writing ? "Editor Catatan Cepat:" : `Ubah Catatan ${n.author}:`}</label>
                    <textarea
                      id={`note-${n.id}`}
                      rows={2}
                      value={editing ? draft : n.note}
                      onChange={(e) => (editing ? setDraft(e.target.value) : setNotes((l) => l.map((x) => (x.id === n.id ? { ...x, note: e.target.value } : x))))}
                      placeholder="Ketik catatan bimbingan spesifik untuk dicetak pada laporan akhir pasutri ini..."
                      className="t-body-sm w-full resize-none rounded-xl bg-canvas-cream p-3 text-on-surface transition-all outline-none placeholder:text-text-muted/60 focus-visible:ring-1 focus-visible:ring-sage-medium"
                    />
                  </>
                ) : (
                  <>
                    <span className="t-label-sm mb-1 block font-normal text-text-muted">Draft Catatan {n.author}:</span>
                    <div className="t-quote rounded-xl bg-canvas-cream p-3 text-[14px] leading-relaxed text-on-surface">“{n.note}”</div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 lg:flex-col">
                {showEditor ? (
                  <>
                    <button type="button" disabled={busyId === n.id} onClick={() => finalize(n, editing ? draft : n.note)} className="t-label-md flex items-center gap-1.5 rounded-full bg-sage-tint px-4 py-2 text-on-primary-fixed-variant transition-colors hover:bg-sage-medium/40 disabled:opacity-60">
                      <Icon name="check" size={16} /><span>{busyId === n.id ? "Menyimpan..." : "Finalkan"}</span>
                    </button>
                    {editing && (
                      <button type="button" onClick={() => setEditingId(null)} className="t-label-md rounded-full px-4 py-2 text-text-muted transition-colors hover:bg-surface-container-low">Batal</button>
                    )}
                  </>
                ) : (
                  <>
                    <button type="button" title="Edit Catatan" aria-label={`Edit catatan ${n.shortName}`} onClick={() => startEdit(n)} className="rounded-full p-2.5 text-text-muted transition-colors hover:bg-surface-container-low hover:text-on-surface">
                      <Icon name="edit" size={20} />
                    </button>
                    <ComingSoonButton feature="Pratinjau PDF" title="Pratinjau PDF" aria-label={`Pratinjau PDF ${n.shortName}`} className="rounded-full p-2.5 text-text-muted transition-colors hover:bg-surface-container-low hover:text-primary">
                      <Icon name="picture_as_pdf" size={20} />
                    </ComingSoonButton>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="t-body-sm flex flex-col items-center justify-between gap-4 pt-2 text-text-muted sm:flex-row">
        <div className="flex items-center gap-2">
          <Icon name="verified_user" size={18} className="text-primary" />
          <span>Seluruh catatan tersinkronisasi otomatis dengan modul PDF Generator &amp; WhatsApp Nudge.</span>
        </div>
        <nav aria-label="Halaman catatan" className="flex items-center gap-1.5">
          <button type="button" aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="flex size-8 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface transition-colors hover:bg-surface-container disabled:opacity-40">
            <Icon name="chevron_left" size={16} />
          </button>
          <span aria-live="polite" className="t-label-sm px-3 py-1 font-semibold text-on-surface">Halaman {page} dari {pageCount}</span>
          <button type="button" aria-label="Halaman berikutnya" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)} className="flex size-8 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface transition-colors hover:bg-surface-container disabled:opacity-40">
            <Icon name="chevron_right" size={16} />
          </button>
        </nav>
      </div>
    </section>
  );
}
