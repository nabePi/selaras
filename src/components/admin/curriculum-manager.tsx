"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CLASS_INFO,
  INITIAL_QUESTIONS,
  PROGRESS_SEGMENTS,
  SCALE_LABELS,
  SESSIONS,
  SESSION_DETAILS,
  type Question,
} from "@/data/admin-curriculum";
import {
  archiveQuestion,
  rescheduleSession,
  saveClosingMessage,
  saveCurriculum,
  sendNudge,
} from "@/lib/admin-actions";
import { ComingSoonButton } from "../coming-soon-button";
import { Dialog, DialogActions, FieldLabel, fieldClass } from "../dialog";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";
import { PageHeader, btnPrimary } from "./page-header";
import { QuestionDialog, type QuestionDraft } from "./question-dialogs";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAYS = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function formatSessionDate(isoDate: string, time: string) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} · ${time} WIB`;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function CurriculumManager() {
  const { showToast } = useToast();
  const [closing, setClosing] = useState(CLASS_INFO.closingMessage);
  const [closingOpen, setClosingOpen] = useState(false);
  const [s3, setS3] = useState({
    zoom: SESSION_DETAILS.s3.zoomLink,
    days: 7,
    dateLabel: SESSIONS[2].dateLabel,
    slide: null as string | null,
  });
  const [s2File, setS2File] = useState<string>(SESSION_DETAILS.s2.file);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [showAll, setShowAll] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [archiving, setArchiving] = useState<Question | null>(null);
  const [reminderBusy, setReminderBusy] = useState(false);

  const mindset = questions.filter((q) => q.dimension === "mindset").length;
  const habit = questions.length - mindset;
  const visible = showAll ? questions : questions.slice(0, 4);

  async function saveAll() {
    if (saveState === "saving") return;
    setSaveState("saving");
    const result = await saveCurriculum({ zoom: s3.zoom, journalingDays: s3.days, closing });
    if (!result.ok) {
      setSaveState("idle");
      return showToast(result.error);
    }
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2200);
  }

  async function remind() {
    setReminderBusy(true);
    const result = await sendNudge({ kind: "audience", audience: "Peserta Cohort 04 (pengingat Sesi 3)", count: CLASS_INFO.pairs });
    setReminderBusy(false);
    if (!result.ok) return showToast(result.error);
    showToast(`Pengingat jadwal Sesi 3 dikirim ke ${CLASS_INFO.pairs} pasangan.`, { tone: "success" });
  }

  function onPickFile(file: File | undefined, apply: (name: string) => void, label: string) {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) return showToast("Berkas maksimal 25 MB.");
    apply(`${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`);
    showToast(`${label} diunggah sebagai draf.`, { tone: "success" });
  }

  async function saveQuestionDraft(draft: QuestionDraft) {
    if (editing) {
      setQuestions((qs) => qs.map((q) => (q.id === editing.id ? { ...q, ...draft } : q)));
      showToast(`Butir ${String(editing.no).padStart(2, "0")} diperbarui.`, { tone: "success" });
    } else {
      setQuestions((qs) => {
        const no = qs.length + 1;
        return [...qs, { id: `Q-${String(Date.now()).slice(-5)}`, no, preAverage: 0, ...draft }];
      });
      setShowAll(true);
      showToast("Butir soal baru ditambahkan (belum ada skor pre-test).", { tone: "success" });
    }
  }

  async function confirmArchive() {
    if (!archiving) return;
    const target = archiving;
    const result = await archiveQuestion(target.id);
    if (!result.ok) return showToast(result.error);
    setQuestions((qs) => qs.filter((q) => q.id !== target.id).map((q, i) => ({ ...q, no: i + 1 })));
    setArchiving(null);
    showToast(`Butir ${String(target.no).padStart(2, "0")} diarsipkan dari bank soal.`, { tone: "success" });
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <PageHeader
        pill="Siklus Kurikulum Aktif"
        meta={`ID: ${CLASS_INFO.id}`}
        title="Manajemen Kelas & Sesi Kurikulum"
        description="Atur struktur siklus kelas aktif, jadwal webinar interaktif live, durasi hari journaling tiap sesi, bank soal relasional pre/post, dan materi kurikulum terpadu."
        actions={
          <>
            <div className="group relative">
              <button
                type="button"
                aria-disabled="true"
                aria-describedby="new-cohort-hint"
                onClick={() => showToast("Sistem membatasi satu kelas aktif dalam satu waktu.")}
                className="t-title-sm flex cursor-not-allowed items-center gap-2 rounded-full bg-canvas-sand/40 px-4 py-2.5 text-text-muted opacity-80"
              >
                <Icon name="lock" size={18} />
                <span>+ Buat Cohort Baru</span>
              </button>
              <span id="new-cohort-hint" role="tooltip" className="t-label-sm pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 rounded-lg bg-inverse-surface px-2.5 py-1 whitespace-nowrap text-inverse-on-surface shadow-md group-focus-within:block group-hover:block">
                1 Kelas aktif sedang berjalan
              </span>
            </div>
            <button type="button" onClick={() => document.getElementById("bank-soal-section")?.scrollIntoView({ behavior: "smooth" })} className="t-title-sm flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2.5 text-on-surface shadow-sm transition-colors hover:bg-surface-container-highest">
              <Icon name="quiz" size={18} className="text-tertiary" />
              <span>Bank Soal Pre/Post</span>
            </button>
            <button type="button" onClick={saveAll} disabled={saveState === "saving"} className={`${btnPrimary} ${saveState === "saved" ? "bg-primary-container" : ""}`}>
              <Icon name={saveState === "saving" ? "sync" : saveState === "saved" ? "done" : "save"} size={18} className={saveState === "saving" ? "animate-spin" : ""} />
              <span>{saveState === "saving" ? "Menyimpan..." : saveState === "saved" ? "Tersimpan!" : "Simpan Perubahan"}</span>
            </button>
          </>
        }
      />

      {/* Master card */}
      <section aria-label="Cohort aktif" className="relative overflow-hidden rounded-3xl bg-surface-container-low p-7 shadow-sm lg:p-8">
        <div className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-sage-tint/40 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-6 pb-6 xl:flex-row xl:items-center">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="t-headline-md text-on-surface">{CLASS_INFO.title}</h2>
              <span className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-3 py-1 font-semibold text-on-primary-fixed">
                <span className="size-2 rounded-full bg-primary" />
                {CLASS_INFO.statusLabel}
              </span>
            </div>
            <p className="t-body-md text-text-muted">{CLASS_INFO.description}</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-surface p-3 px-5 shadow-sm">
            <span className="flex size-11 items-center justify-center rounded-xl bg-sage-tint text-primary"><Icon name="favorite" size={24} /></span>
            <div>
              <p className="t-headline-sm leading-tight text-on-surface">{CLASS_INFO.pairs} Pasangan</p>
              <p className="t-label-sm font-normal text-text-muted">{CLASS_INFO.participants} Peserta Aktif Terverifikasi</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-3 pt-5">
          <div className="t-label-md flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2 font-semibold text-on-surface">
              <Icon name="timeline" size={18} className="text-primary" />
              Perjalanan Siklus: {CLASS_INFO.journeyLabel}
            </span>
            <span className="text-text-muted">{CLASS_INFO.progressPercent}% Total Periode Selesai</span>
          </div>
          <div role="progressbar" aria-label="Progres siklus kelas" aria-valuenow={CLASS_INFO.progressPercent} aria-valuemin={0} aria-valuemax={100} className="flex h-3 w-full overflow-hidden rounded-full bg-surface-container">
            {PROGRESS_SEGMENTS.map((s) => (
              <div key={s.title} title={s.title} className={`h-full ${s.className}`} style={{ width: `${s.width}%` }} />
            ))}
          </div>
          <div className="t-label-sm grid grid-cols-3 pt-1 text-center font-normal text-text-muted">
            <div className="flex items-center gap-1.5 text-left font-semibold text-primary"><Icon name="check_circle" size={16} />Sesi 1 (H-1 s/d H-7)</div>
            <div className="flex items-center justify-center gap-1.5 font-semibold text-on-surface"><span className="size-2 rounded-full bg-primary" />Sesi 2 (H-8 s/d H-14 — Aktif)</div>
            <div className="text-right">Sesi 3 &amp; Penutupan (H-15 s/d H-21)</div>
          </div>
        </div>

        <div className="relative z-10 mt-6 rounded-2xl bg-surface/90 p-5 backdrop-blur">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2 text-tertiary">
                <Icon name="volunteer_activism" size={18} />
                <h3 className="t-title-sm font-semibold text-on-surface">Pesan Apresiasi &amp; Doa Kelulusan Cohort (Closing Message)</h3>
              </div>
              <p className="t-quote rounded-xl bg-canvas-cream/80 p-3.5 leading-relaxed text-on-surface italic">“{closing}”</p>
            </div>
            <button type="button" onClick={() => setClosingOpen(true)} className="t-label-md flex items-center gap-1.5 self-start rounded-xl bg-surface-container px-3.5 py-2 text-on-surface transition-colors hover:bg-surface-container-high">
              <Icon name="edit" size={16} />
              <span>Ubah Pesan</span>
            </button>
          </div>
        </div>
      </section>

      {/* Sesi */}
      <section aria-label="Rangkaian sesi" className="space-y-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="t-headline-md text-on-surface">Rangkaian 3 Sesi Interaktif &amp; Journaling Terikat</h2>
            <p className="t-body-md text-text-muted">Prompt refleksi harian pasutri otomatis terkunci mengikuti jadwal sesi live masing-masing.</p>
          </div>
          <div className="t-label-sm flex items-center gap-2 self-start rounded-full bg-surface-container-low px-3 py-1.5 font-normal text-text-muted">
            <Icon name="sync" size={16} className="text-primary" />
            Aturan: Auto-Release Jam 04.00 Subuh
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Sesi 1 */}
          <article className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm transition-all hover:shadow-md lg:p-7">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
              <div className="flex-1 space-y-4">
                <SessionMeta label={SESSIONS[0].label} labelClass="bg-sage-tint text-on-surface" icon="event_available" dateLabel={SESSIONS[0].dateLabel} tag={SESSIONS[0].tag} tagClass="bg-accent-mint/60 text-on-surface" />
                <SessionTitle title={SESSIONS[0].title} description={SESSIONS[0].description} />
                <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-surface-container-low/70 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-surface text-primary shadow-sm"><Icon name="auto_stories" size={20} /></span>
                    <div>
                      <p className="t-title-sm leading-tight">7 Hari Journaling</p>
                      <p className="t-label-sm font-normal text-text-muted">{SESSIONS[0].rangeLabel}</p>
                    </div>
                  </div>
                  <div className="hidden h-8 w-px bg-canvas-sand/60 sm:block" />
                  <div className="t-body-sm flex items-center gap-2 text-text-muted">
                    <Icon name="link" size={18} className="text-primary" />
                    <span>{SESSION_DETAILS.s1.promptsInfo}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Chip icon="videocam" iconClass="text-accent-coral" action={<ComingSoonButton feature="Putar rekaman" className="t-label-sm ml-1 text-primary hover:underline">Putar</ComingSoonButton>}>{SESSION_DETAILS.s1.recording}</Chip>
                  <Chip icon="description" iconClass="text-primary" action={<ComingSoonButton feature="Unduh slide" className="t-label-sm ml-1 text-primary hover:underline">Unduh</ComingSoonButton>}>{SESSION_DETAILS.s1.slide}</Chip>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-4 rounded-2xl bg-surface-container-low p-4 lg:w-72">
                <Meter label="Partisipasi Prompt" value={`${SESSION_DETAILS.s1.participation.answered} / ${SESSION_DETAILS.s1.participation.total} Menjawab`} percent={89} />
                <div className="space-y-2">
                  <ComingSoonButton feature="Review jawaban refleksi" className="t-title-sm flex w-full items-center justify-center gap-1.5 rounded-xl bg-surface px-3 py-2 text-on-surface shadow-sm transition-colors hover:bg-surface-container-high">
                    <Icon name="visibility" size={16} /><span>Review Jawaban Refleksi</span>
                  </ComingSoonButton>
                  <ComingSoonButton feature="Log kurikulum" className="t-label-md flex w-full items-center justify-center gap-1 rounded-xl px-3 py-2 text-text-muted transition-colors hover:bg-surface hover:text-on-surface">
                    <Icon name="history_edu" size={16} /><span>Log Kurikulum</span>
                  </ComingSoonButton>
                </div>
              </div>
            </div>
          </article>

          {/* Sesi 2 */}
          <article className="relative overflow-hidden rounded-3xl bg-surface-container-lowest p-6 shadow-md lg:p-7">
            <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-primary" />
            <div className="flex flex-col justify-between gap-6 pl-2 lg:flex-row lg:items-start">
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="t-label-sm flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 font-semibold text-on-primary">
                    <span className="size-1.5 animate-ping rounded-full bg-surface-container-lowest" />
                    {SESSIONS[1].label}
                  </span>
                  <span className="t-label-sm flex items-center gap-1 font-semibold text-on-surface"><Icon name="event" size={16} className="text-primary" />{SESSIONS[1].dateLabel}</span>
                  <span className="t-label-sm rounded-full bg-surface-container-high px-2.5 py-0.5 font-normal text-on-surface">{SESSIONS[1].tag}</span>
                </div>
                <SessionTitle title={SESSIONS[1].title} description={SESSIONS[1].description} />
                <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-sage-tint/60 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm"><Icon name="edit_calendar" size={20} /></span>
                    <div>
                      <p className="t-title-sm leading-tight font-semibold">7 Hari Journaling Terikat</p>
                      <p className="t-label-sm font-normal text-on-surface-variant">{SESSIONS[1].rangeLabel} · <span className="font-semibold text-primary">Hari Ini: H-{SESSION_DETAILS.s2.todayDay}</span></p>
                    </div>
                  </div>
                  <div className="hidden h-8 w-px bg-canvas-sand/60 sm:block" />
                  <span className="t-label-md text-on-surface">Prompt Hari Ini: <em>“{SESSION_DETAILS.s2.todayPrompt}”</em></span>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="t-label-md flex items-center gap-2 rounded-xl bg-accent-mint/50 px-3 py-1.5 text-on-surface"><Icon name="check_circle" size={18} className="text-primary" /><span>{SESSION_DETAILS.s2.liveInfo}</span></div>
                  <div className="t-label-md flex items-center gap-2 rounded-xl bg-canvas-cream px-3 py-1.5 text-on-surface"><Icon name="article" size={18} className="text-tertiary" /><span>{s2File}</span></div>
                  <label className="t-label-md flex cursor-pointer items-center gap-1 font-semibold text-primary focus-within:outline-2 focus-within:outline-primary hover:text-primary-container">
                    <input type="file" accept=".pdf,.ppt,.pptx,application/pdf" className="sr-only" onChange={(e) => { onPickFile(e.target.files?.[0], setS2File, "Materi Sesi 2"); e.target.value = ""; }} />
                    <Icon name="cloud_upload" size={16} /><span>Ganti File Materi</span>
                  </label>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-4 rounded-2xl bg-surface-container-low p-4 lg:w-72">
                <div className="space-y-1.5">
                  <span className="t-label-sm font-normal text-text-muted">Kepatuhan Respon Pasangan H-{SESSION_DETAILS.s2.todayDay}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="t-headline-sm text-on-surface">{SESSION_DETAILS.s2.compliance.pairs} Pasang</span>
                    <span className="t-label-sm text-primary">{SESSION_DETAILS.s2.compliance.percent}% Mengisi</span>
                  </div>
                  <Bar percent={SESSION_DETAILS.s2.compliance.percent} />
                </div>
                <div className="space-y-2">
                  <ComingSoonButton feature="Pengelolaan materi & audio" className="t-title-sm flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-on-primary shadow-sm transition-all hover:bg-primary-container">
                    <Icon name="folder_managed" size={18} /><span>Kelola Materi &amp; Audio</span>
                  </ComingSoonButton>
                  <Link href="/admin/peserta" className="t-label-md flex w-full items-center justify-center gap-1 rounded-xl bg-surface px-3 py-2 text-on-surface transition-colors hover:bg-surface-container-high">
                    <Icon name="group" size={16} /><span>Cek Partisipasi Hari Ini</span>
                  </Link>
                </div>
              </div>
            </div>
          </article>

          {/* Sesi 3 */}
          <article className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm lg:p-7">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
              <div className="flex-1 space-y-4">
                <SessionMeta label={SESSIONS[2].label} labelClass="bg-surface-variant text-on-surface-variant" icon="calendar_clock" dateLabel={s3.dateLabel} tag={SESSIONS[2].tag} tagClass="bg-surface-container text-on-surface" />
                <SessionTitle title={SESSIONS[2].title} description={SESSIONS[2].description} />
                <div className="grid grid-cols-1 gap-3 rounded-2xl bg-surface-container-low/70 p-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="zoom-link" className="t-label-sm block font-normal text-text-muted">Tautan Join Webinar Zoom Pasutri</label>
                    <div className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 shadow-xs">
                      <Icon name="videocam" size={18} className="text-primary" />
                      <input id="zoom-link" type="url" value={s3.zoom} onChange={(e) => setS3((s) => ({ ...s, zoom: e.target.value }))} className="t-body-sm w-full bg-transparent text-on-surface outline-none" />
                    </div>
                    <span className="t-label-sm font-normal text-text-muted">Tombol join di app pasutri otomatis aktif 15 menit sebelum sesi.</span>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="journal-days" className="t-label-sm block font-normal text-text-muted">Durasi Journaling Pasca Sesi</label>
                    <div className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 shadow-xs">
                      <Icon name="tune" size={18} className="text-tertiary" />
                      <input id="journal-days" type="number" min={1} max={14} value={s3.days} onChange={(e) => setS3((s) => ({ ...s, days: Math.min(14, Math.max(1, Number(e.target.value) || 1)) }))} className="t-title-sm w-12 bg-transparent text-center text-on-surface outline-none" />
                      <span className="t-body-sm text-text-muted">Hari Journaling (H-15 s/d H-{14 + s3.days})</span>
                    </div>
                    <span className="t-label-sm font-normal text-text-muted">Diakhiri dengan rilis evaluasi Post-Test Assessment.</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="t-label-md flex items-center gap-2 rounded-xl bg-canvas-cream px-3 py-1.5 text-on-surface-variant">
                    <Icon name="pending_actions" size={18} className="text-text-muted" />
                    <span>{s3.slide ? `Draf: ${s3.slide}` : SESSION_DETAILS.s3.pptStatus}</span>
                  </div>
                  <label className="t-label-md flex cursor-pointer items-center gap-1.5 rounded-xl bg-surface px-3 py-1.5 text-on-surface transition-colors focus-within:outline-2 focus-within:outline-primary hover:bg-surface-container">
                    <input type="file" accept=".pdf,.ppt,.pptx,application/pdf" className="sr-only" onChange={(e) => { onPickFile(e.target.files?.[0], (name) => setS3((s) => ({ ...s, slide: name })), "Slide Sesi 3"); e.target.value = ""; }} />
                    <Icon name="upload_file" size={16} /><span>Unggah Slide Kurikulum</span>
                  </label>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-4 rounded-2xl bg-surface-container-low p-4 lg:w-72">
                <div className="space-y-1">
                  <span className="t-label-sm font-normal text-text-muted">Post-Test Assessment Terjadwal</span>
                  <p className="t-title-sm font-semibold text-on-surface">{SESSION_DETAILS.s3.postTest.questions} Soal Pertumbuhan</p>
                  <p className="t-label-sm font-normal text-text-muted">Akan terbuka pada {SESSION_DETAILS.s3.postTest.opensAt}</p>
                </div>
                <div className="space-y-2">
                  <button type="button" onClick={() => setRescheduleOpen(true)} className="t-title-sm flex w-full items-center justify-center gap-1.5 rounded-xl bg-surface px-3 py-2.5 text-on-surface shadow-sm transition-colors hover:bg-surface-container-high">
                    <Icon name="edit_calendar" size={18} /><span>Ubah Jadwal Sesi 3</span>
                  </button>
                  <button type="button" onClick={remind} disabled={reminderBusy} className="t-label-md flex w-full items-center justify-center gap-1 rounded-xl px-3 py-2 text-primary transition-colors hover:bg-surface disabled:opacity-60">
                    <Icon name="notifications_active" size={16} /><span>{reminderBusy ? "Mengirim..." : "Kirim Pengingat Jadwal"}</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Bank soal */}
      <section id="bank-soal-section" aria-label="Bank soal" className="scroll-mt-24 space-y-6 rounded-3xl bg-surface-container-lowest p-7 shadow-sm lg:p-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="t-label-sm rounded-full bg-accent-sunray/40 px-3 py-1 font-semibold text-on-surface">Instrumen Pengukuran Cohort 04</span>
              <span className="t-label-sm font-normal text-text-muted">Total {questions.length} Butir Likert</span>
            </div>
            <h2 className="t-headline-md text-on-surface">Bank Soal Self Growth Assessment (Pre &amp; Post Test)</h2>
            <p className="t-body-md max-w-3xl text-text-muted">Instrumen psikologis relasional untuk mengukur delta kematangan pasutri sebelum kelas dimulai (Pre-Test) dan setelah menuntaskan seluruh siklus (Post-Test). Editable oleh Coach per cohort.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ComingSoonButton feature="Distribusi pre-test" className="t-label-md flex items-center gap-2 rounded-full bg-surface-container px-4 py-2 text-on-surface transition-colors hover:bg-surface-container-high">
              <Icon name="insights" size={18} /><span>Distribusi Pre-Test (30 Pasangan)</span>
            </ComingSoonButton>
            <button type="button" onClick={() => { setEditing(null); setQuestionOpen(true); }} className="t-label-md flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-on-primary shadow-sm transition-colors hover:bg-primary-container">
              <Icon name="add_circle" size={18} /><span>Tambah Butir Soal</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DimensionCard icon="psychology" tone="bg-sage-tint text-primary" title={`${mindset} Butir: Mindset Pasutri`} note="Keterbukaan emosi, regulasi prasangka & cara pandang sakinah" count={mindset} badgeTone="text-primary" />
          <DimensionCard icon="repeat" tone="bg-surface-container-high text-tertiary" title={`${habit} Butir: Habit Rumah Tangga`} note="Ritual pillow talk, waktu hening gawai, dan musyawarah berkah" count={habit} badgeTone="text-tertiary" />
        </div>

        <div className="relative overflow-x-auto rounded-2xl bg-surface">
          <table className="t-body-sm w-full text-left">
            <caption className="sr-only">Butir soal pre/post test</caption>
            <thead>
              <tr className="t-label-sm bg-surface-container-low text-text-muted">
                <th scope="col" className="w-12 px-4 py-3.5 text-center font-semibold">No</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">Butir Pernyataan Reflektif</th>
                <th scope="col" className="w-48 px-4 py-3.5 font-semibold">Dimensi &amp; Tipe</th>
                <th scope="col" className="w-36 px-4 py-3.5 font-semibold">Format Skala</th>
                <th scope="col" className="w-40 px-4 py-3.5 text-center font-semibold">Rerata Skor Pre</th>
                <th scope="col" className="w-24 px-4 py-3.5 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-canvas-sand/40">
              {visible.map((q) => {
                const mind = q.dimension === "mindset";
                return (
                  <tr key={q.id} className="transition-colors hover:bg-canvas-cream/50">
                    <td className="t-label-md px-4 py-4 text-center text-text-muted">{String(q.no).padStart(2, "0")}</td>
                    <td className="px-4 py-4">
                      <p className="t-body-md leading-relaxed font-medium text-on-surface">“{q.statement}”</p>
                      {q.description && <span className="t-label-sm font-normal text-text-muted">{q.description}</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`t-label-sm inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${mind ? "bg-sage-tint text-on-surface" : "bg-secondary-container text-on-secondary-container"}`}>
                        <span className={`size-1.5 rounded-full ${mind ? "bg-primary" : "bg-secondary"}`} />
                        {mind ? "Mindset" : "Habit"} · {q.subDimension}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-text-muted">
                      <span className="t-label-md font-semibold text-on-surface">Likert 1 – 5</span>
                      <p className="t-label-sm font-normal">{SCALE_LABELS[q.scale]}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {q.preAverage > 0 ? (
                        <span className={`t-label-sm inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${q.preAverage < 3 ? "bg-secondary-container/60 text-on-secondary-container" : "bg-surface-container text-on-surface"}`}>
                          {q.preAverage.toFixed(2)}<span className="text-[10px] text-text-muted">/ 5.0</span>
                        </span>
                      ) : (
                        <span className="t-label-sm font-normal text-text-muted">Belum ada data</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" title="Ubah Pertanyaan" aria-label={`Ubah butir ${q.no}`} onClick={() => { setEditing(q); setQuestionOpen(true); }} className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-sage-tint hover:text-primary">
                          <Icon name="edit" size={18} />
                        </button>
                        <button type="button" title="Arsipkan Butir" aria-label={`Arsipkan butir ${q.no}`} onClick={() => setArchiving(q)} className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-error-container hover:text-error">
                          <Icon name="delete" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="t-label-md flex flex-col items-center justify-between gap-4 pt-2 text-text-muted sm:flex-row">
          <span>Menampilkan {visible.length} dari {questions.length} butir soal aktif ({mindset} Mindset + {habit} Habit)</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setShowAll((s) => !s)} aria-expanded={showAll} className="rounded-xl bg-canvas-cream px-3 py-1.5 text-on-surface transition-colors hover:bg-surface-container">
              {showAll ? "Tampilkan 4 Soal Saja" : `Muat Seluruh ${questions.length} Soal`}
            </button>
            <ComingSoonButton feature="Ekspor soal & rubrik PDF" className="flex items-center gap-1 rounded-xl bg-surface-container px-3 py-1.5 text-on-surface transition-colors hover:bg-surface-container-high">
              <Icon name="file_download" size={16} /><span>Ekspor Soal &amp; Rubrik PDF</span>
            </ComingSoonButton>
          </div>
        </div>
      </section>

      <aside className="flex flex-col items-start gap-4 rounded-3xl bg-sage-tint/40 p-6 md:flex-row">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary"><Icon name="info" size={20} /></span>
        <div className="flex-1 space-y-1 text-on-surface">
          <h2 className="t-title-sm font-semibold">Aturan Integritas Kurikulum Siklus Selaras Life</h2>
          <p className="t-body-sm leading-relaxed text-text-muted">
            Sesuai SOP, perubahan durasi hari journaling pada sesi yang sedang berjalan (Sesi 2) hanya dapat diperpanjang, tidak dapat dipersingkat guna menjaga konsistensi perenungan pasangan. Bank soal post-test akan otomatis mengunci format saat peserta pertama membuka instrumen di hari ke-21.
          </p>
        </div>
      </aside>

      <ClosingDialog open={closingOpen} onClose={() => setClosingOpen(false)} value={closing} onSave={setClosing} />
      <RescheduleDialog open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} onSave={(label) => setS3((s) => ({ ...s, dateLabel: label }))} />
      <QuestionDialog open={questionOpen} onClose={() => setQuestionOpen(false)} editing={editing} onSave={saveQuestionDraft} />
      <Dialog open={!!archiving} onClose={() => setArchiving(null)} size="sm" eyebrow="Bank Soal" title="Arsipkan butir soal?">
        {archiving && (
          <div className="space-y-4">
            <p className="t-body-sm text-text-muted">
              Butir {String(archiving.no).padStart(2, "0")} akan dikeluarkan dari instrumen aktif dan nomor butir berikutnya bergeser.
            </p>
            <p className="t-quote rounded-xl bg-canvas-cream p-3 italic">“{archiving.statement}”</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setArchiving(null)} className="t-title-sm rounded-full px-5 py-2.5 text-on-surface-variant hover:bg-canvas-ivory">Batal</button>
              <button type="button" onClick={confirmArchive} className="t-title-sm rounded-full bg-error px-6 py-2.5 text-on-error shadow-md hover:opacity-90">Arsipkan</button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function SessionMeta({ label, labelClass, icon, dateLabel, tag, tagClass }: { label: string; labelClass: string; icon: string; dateLabel: string; tag: string; tagClass: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className={`t-label-sm rounded-full px-3 py-1 font-semibold ${labelClass}`}>{label}</span>
      <span className="t-label-sm flex items-center gap-1 font-normal text-text-muted"><Icon name={icon} size={16} />{dateLabel}</span>
      <span className={`t-label-sm rounded-full px-2.5 py-0.5 font-normal ${tagClass}`}>{tag}</span>
    </div>
  );
}

function SessionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="t-headline-sm text-on-surface">{title}</h3>
      <p className="t-body-md mt-1 text-text-muted">{description}</p>
    </div>
  );
}

function Chip({ icon, iconClass, children, action }: { icon: string; iconClass: string; children: React.ReactNode; action: React.ReactNode }) {
  return (
    <div className="t-label-md flex items-center gap-2 rounded-xl bg-canvas-cream px-3 py-1.5 text-on-surface">
      <Icon name={icon} size={18} className={iconClass} />
      <span>{children}</span>
      {action}
    </div>
  );
}

function Bar({ percent }: { percent: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
      <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
    </div>
  );
}

function Meter({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <div className="space-y-1">
      <div className="t-label-sm flex justify-between">
        <span className="font-normal text-text-muted">{label}</span>
        <span className="font-semibold text-on-surface">{value}</span>
      </div>
      <Bar percent={percent} />
    </div>
  );
}

function DimensionCard({ icon, tone, title, note, count, badgeTone }: { icon: string; tone: string; title: string; note: string; count: number; badgeTone: string }) {
  const complete = count === 15;
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-canvas-cream p-4">
      <div className="flex items-center gap-3">
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon name={icon} size={20} /></span>
        <div>
          <p className="t-title-sm font-semibold text-on-surface">{title}</p>
          <p className="t-label-sm font-normal text-text-muted">{note}</p>
        </div>
      </div>
      <span className={`t-label-sm shrink-0 rounded-full bg-surface px-2.5 py-1 font-semibold shadow-xs ${complete ? badgeTone : "text-secondary"}`}>
        {complete ? "Lengkap" : count < 15 ? `Kurang ${15 - count}` : `Lebih ${count - 15}`}
      </span>
    </div>
  );
}

function ClosingDialog({ open, onClose, value, onSave }: { open: boolean; onClose: () => void; value: string; onSave: (v: string) => void }) {
  return (
    <Dialog open={open} onClose={onClose} eyebrow="Cohort 04" title="Ubah Pesan Kelulusan">
      <ClosingForm onClose={onClose} value={value} onSave={onSave} />
    </Dialog>
  );
}

function ClosingForm({ onClose, value, onSave }: { onClose: () => void; value: string; onSave: (v: string) => void }) {
  const { showToast } = useToast();
  const [text, setText] = useState(value);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 20) return setError("Tulis pesan apresiasi minimal 20 karakter.");
    setSaving(true);
    const result = await saveClosingMessage(text);
    setSaving(false);
    if (!result.ok) return setError(result.error);
    onSave(text.trim());
    onClose();
    showToast("Pesan kelulusan diperbarui untuk seluruh peserta Cohort 04.", { tone: "success" });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="space-y-1">
        <FieldLabel htmlFor="closing-message" hint={<span>{text.length}/400</span>}>Pesan Apresiasi &amp; Doa Kelulusan</FieldLabel>
        <textarea id="closing-message" rows={6} maxLength={400} value={text} onChange={(e) => { setText(e.target.value); setError(""); }} className={`${fieldClass} resize-none leading-relaxed`} />
        {error && <p role="alert" className="t-body-sm text-error">{error}</p>}
      </div>
      <DialogActions onCancel={onClose} submitLabel="Simpan Pesan" submitting={saving} />
    </form>
  );
}

function RescheduleDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (label: string) => void }) {
  return (
    <Dialog open={open} onClose={onClose} size="sm" eyebrow="Sesi 3" title="Ubah Jadwal Sesi 3">
      <RescheduleForm onClose={onClose} onSave={onSave} />
    </Dialog>
  );
}

function RescheduleForm({ onClose, onSave }: { onClose: () => void; onSave: (label: string) => void }) {
  const { showToast } = useToast();
  const [date, setDate] = useState("2026-10-03");
  const [time, setTime] = useState("19:30");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !time) return setError("Isi tanggal dan jam sesi.");
    if (date <= "2026-09-27") return setError("Jadwal Sesi 3 harus setelah Sesi 2 (27 Sep 2026).");
    setSaving(true);
    const result = await rescheduleSession("s3", { date, time });
    setSaving(false);
    if (!result.ok) return setError(result.error);
    const [h, m] = time.split(":");
    onSave(formatSessionDate(date, `${pad(Number(h))}:${m}`));
    onClose();
    showToast("Jadwal Sesi 3 diperbarui. Peserta akan menerima pemberitahuan perubahan.", { tone: "success", duration: 3500 });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <FieldLabel htmlFor="s3-date">Tanggal</FieldLabel>
          <input id="s3-date" type="date" min="2026-09-28" value={date} onChange={(e) => { setDate(e.target.value); setError(""); }} className={fieldClass} />
        </div>
        <div className="space-y-1">
          <FieldLabel htmlFor="s3-time">Jam (WIB)</FieldLabel>
          <input id="s3-time" type="time" value={time} onChange={(e) => { setTime(e.target.value); setError(""); }} className={fieldClass} />
        </div>
      </div>
      {error && <p role="alert" className="t-body-sm text-error">{error}</p>}
      <DialogActions onCancel={onClose} submitLabel="Simpan Jadwal" submitting={saving} />
    </form>
  );
}
