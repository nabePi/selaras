"use client";

import { useMemo, useRef, useState } from "react";
import {
  CYCLE_STATS,
  DAYS_PER_SESSION,
  DEFAULT_FALLBACK,
  DEFAULT_VOICE_NOTE,
  INITIAL_SCHEDULE,
  PROMPT_MAX_LENGTH,
  PROMPT_SESSIONS,
  RESPONSE_TYPES,
  WEEKDAYS,
  dateForSlot,
  slotKey,
  type ResponseType,
  type ScheduleItem,
  type ScheduleState,
} from "@/data/admin-prompts";
import { publishPrompt, saveFallbackSettings, savePromptDraft } from "@/lib/admin-actions";
import { Dialog, DialogActions, FieldLabel, fieldClass } from "../dialog";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";
import { PageHeader, btnPrimary, btnSoft } from "./page-header";
import { PhonePreview } from "./phone-preview";

type Voice = { name: string; meta: string; url?: string };
type Item = ScheduleItem & { voice?: Voice };
type Form = {
  session: number;
  day: number;
  date: string;
  responseType: ResponseType;
  prompt: string;
  voice: Voice | null;
};

const toForm = (i: Item): Form => ({
  session: i.session,
  day: i.day,
  date: i.date,
  responseType: i.responseType,
  prompt: i.prompt,
  voice: i.voice ?? null,
});

const blankForm = (session: number, day: number): Form => ({
  session,
  day,
  date: dateForSlot(session, day),
  responseType: "text",
  prompt: "",
  voice: null,
});

const STATE_LABEL: Record<ScheduleState, string> = {
  done: "Selesai",
  active: "AKTIF",
  scheduled: "Terjadwal",
  locked: "Terkunci",
  draft: "Draf",
};

function durationOf(file: File): Promise<string> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      const s = Math.round(audio.duration);
      resolve(`Durasi ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} menit`);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("Durasi tidak diketahui");
    };
    audio.src = url;
  });
}

export function PromptStudio() {
  const { showToast } = useToast();
  const initial = useMemo(() => {
    const map: Record<string, Item> = {};
    for (const i of INITIAL_SCHEDULE) {
      map[slotKey(i.session, i.day)] = i.state === "active" ? { ...i, voice: DEFAULT_VOICE_NOTE } : i;
    }
    return map;
  }, []);

  const [schedule, setSchedule] = useState(initial);
  const [form, setForm] = useState<Form>(() => toForm(initial[slotKey(1, 5)]));
  const [mode, setMode] = useState<"edit" | "new">("edit");
  const [expanded, setExpanded] = useState(false);
  const [fallback, setFallback] = useState({ enabled: true, template: DEFAULT_FALLBACK });
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [busy, setBusy] = useState<"publish" | "draft" | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const existing = schedule[slotKey(form.session, form.day)];
  const duplicate = mode === "new" && !!existing;
  const readOnly = mode === "edit" && existing?.state === "done";
  const session = PROMPT_SESSIONS.find((s) => s.value === form.session)!;
  const dayInvalid = form.prompt.trim().length < 10;

  const visibleSessions = expanded ? [1, 2] : [form.session];

  function selectSlot(sessionNo: number, day: number) {
    const item = schedule[slotKey(sessionNo, day)];
    if (mode === "new") {
      setForm((f) => ({ ...f, session: sessionNo, day, date: dateForSlot(sessionNo, day) }));
      return;
    }
    if (item) {
      setForm(toForm(item));
    } else {
      setMode("new");
      setForm(blankForm(sessionNo, day));
    }
    stopAudio();
  }

  function startNew() {
    setMode("new");
    setForm((f) => blankForm(f.session, f.day));
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openExisting() {
    if (!existing) return;
    setMode("edit");
    setForm(toForm(existing));
  }

  function reset() {
    if (mode === "edit" && existing) setForm(toForm(existing));
    else setForm((f) => blankForm(f.session, f.day));
  }

  function stopAudio() {
    audioRef.current?.pause();
    setPlaying(false);
  }

  function togglePlay() {
    const voice = form.voice;
    if (!voice?.url) {
      showToast("Pemutar audio contoh akan hadir pada fase berikutnya ✨");
      return;
    }
    if (!audioRef.current || audioRef.current.src !== voice.url) {
      audioRef.current?.pause();
      audioRef.current = new Audio(voice.url);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      void audioRef.current.play();
      setPlaying(true);
    }
  }

  async function onPickAudio(file: File | undefined) {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      showToast("Berkas audio maksimal 20 MB.");
      return;
    }
    stopAudio();
    const meta = `${(file.size / 1024 / 1024).toFixed(1)} MB · ${await durationOf(file)}`;
    setForm((f) => ({ ...f, voice: { name: file.name, meta, url: URL.createObjectURL(file) } }));
  }

  function commit(state: ScheduleState) {
    const key = slotKey(form.session, form.day);
    const prev = schedule[key];
    const base: Item = prev ?? {
      session: form.session,
      day: form.day,
      title: form.prompt.trim().split(/\s+/).slice(0, 4).join(" "),
      prompt: "",
      responseType: form.responseType,
      date: form.date,
      state,
    };
    setSchedule((s) => ({
      ...s,
      [key]: {
        ...base,
        prompt: form.prompt.trim(),
        responseType: form.responseType,
          date: form.date,
        voice: form.voice ?? undefined,
        state: prev ? prev.state : state,
      },
    }));
    setMode("edit");
  }

  async function publish() {
    if (readOnly || duplicate) return;
    if (dayInvalid) {
      showToast("Tulis pertanyaan refleksi minimal 10 karakter.");
      document.getElementById("prompt-input")?.focus();
      return;
    }
    setBusy("publish");
    const result = await publishPrompt(form);
    setBusy(null);
    if (!result.ok) return showToast(result.error);
    const isUpdate = mode === "edit";
    commit("scheduled");
    showToast(
      isUpdate ? `Prompt Hari ke-${form.day} diperbarui dan tersinkron ke aplikasi peserta.` : `Prompt Hari ke-${form.day} dijadwalkan untuk ${new Date(`${form.date}T00:00:00Z`).toLocaleDateString("id-ID", { day: "numeric", month: "long", timeZone: "UTC" })} pukul 05.00 WIB.`,
      { tone: "success", duration: 3500 },
    );
  }

  async function saveDraft() {
    if (readOnly || duplicate) return;
    setBusy("draft");
    const result = await savePromptDraft(form);
    setBusy(null);
    if (!result.ok) return showToast(result.error);
    if (mode === "new") commit("draft");
    showToast("Draf prompt tersimpan.", { tone: "success" });
  }

  const charCount = form.prompt.length;

  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <PageHeader
        pill="Modul Pembinaan Ruhani & Pasutri"
        pulse={false}
        meta="Cohort 04 Aktif (Minggu 1)"
        title="Kelola Prompt Jurnal"
        description="Kurasi pertanyaan refleksi berurutan per sesi untuk peserta Cohort 4 Young Marriage. Satu pintu dialog bernilai ibadah setiap Subuh."
        actions={
          <>
            <button type="button" onClick={() => setFallbackOpen(true)} className={btnSoft}>
              <Icon name="tune" size={18} className="text-tertiary" />
              <span>Pengaturan Fallback Otomatis</span>
            </button>
            <button type="button" onClick={startNew} className={btnPrimary}>
              <Icon name="event_upcoming" size={18} />
              <span>Jadwalkan Prompt Baru</span>
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-12">
        {/* Editor */}
        <section ref={editorRef} aria-label="Editor prompt harian" className="scroll-mt-24 space-y-6 xl:col-span-5">
          <div className="space-y-6 rounded-3xl bg-canvas-ivory p-6 shadow-sm lg:p-7">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-sage-tint text-primary">
                  <Icon name="calendar_add_on" size={22} />
                </span>
                <div>
                  <h2 className="t-headline-sm text-on-surface">Editor Prompt Harian</h2>
                  <p className="t-label-sm font-normal text-text-muted">Atur gating urutan sesi dan tanggal distribusi</p>
                </div>
              </div>
              <span className="t-label-sm flex shrink-0 items-center gap-1.5 rounded-full bg-accent-mint/60 px-3 py-1 text-on-surface">
                <span className="size-1.5 rounded-full bg-primary" />
                {mode === "new" ? "Prompt Baru" : "Live Sync"}
              </span>
            </div>

            {duplicate && (
              <div role="alert" className="flex items-start gap-3 rounded-2xl bg-secondary-container/60 p-4 text-on-secondary-container">
                <Icon name="error_outline" size={20} className="mt-0.5 shrink-0 text-error" />
                <div className="flex-1 space-y-1">
                  <p className="t-title-sm">Slot Tanggal Ini Telah Terisi</p>
                  <p className="t-body-sm opacity-90">
                    Hari ke-{form.day} sudah memiliki prompt terbit. Sesuai SOP, Anda tidak dapat membuat duplikat dan
                    diarahkan untuk menyunting prompt yang ada.
                  </p>
                  <button type="button" onClick={openExisting} className="t-label-md mt-1 inline-block font-semibold underline">
                    Buka Prompt Eksisting untuk Diubah
                  </button>
                </div>
              </div>
            )}

            {readOnly && (
              <div role="status" className="flex items-start gap-3 rounded-2xl bg-sage-tint p-4">
                <Icon name="lock" size={20} className="mt-0.5 shrink-0 text-primary" />
                <p className="t-body-sm text-primary">
                  Prompt ini sudah terbit dan direspons peserta, sehingga tidak dapat diubah. Pilih hari lain di jadwal.
                </p>
              </div>
            )}

            <fieldset disabled={readOnly} className="min-w-0 space-y-6 disabled:opacity-70">
              <legend className="sr-only">Formulir prompt</legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField id="select-session" label="Siklus Pembinaan" value={String(form.session)} onChange={(v) => selectSlot(Number(v), form.day)}>
                  {PROMPT_SESSIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </SelectField>
                <SelectField id="select-day" label="Urutan Hari (Gated Sequence)" value={String(form.day)} onChange={(v) => selectSlot(form.session, Number(v))}>
                  {WEEKDAYS.map((w, i) => (
                    <option key={w} value={i + 1}>
                      {i + 1 === form.day ? `Hari ke-${i + 1} dari ${DAYS_PER_SESSION} Hari (${w})` : `Hari ke-${i + 1} (${w})`}
                      {i === 6 ? " - Review" : ""}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div className="flex flex-col justify-between gap-4 rounded-2xl bg-canvas-cream p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-sage-tint text-primary"><Icon name="schedule_send" size={20} /></span>
                  <div>
                    <p className="t-title-sm text-on-surface">Distribusi Serentak Subuh</p>
                    <p className="t-label-sm font-normal text-text-muted">Pukul 05.00 WIB (Satu Prompt Global)</p>
                  </div>
                </div>
                <div>
                  <label htmlFor="distribution-date" className="sr-only">Tanggal distribusi</label>
                  <input
                    id="distribution-date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="t-body-sm rounded-xl bg-surface-container-lowest px-3 py-2 text-on-surface shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-sage-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span id="response-format-label" className="t-label-sm tracking-wider text-text-muted uppercase">Format Respons Pasutri</span>
                  <span className="t-label-sm text-primary">Tersinkron ke Journal App</span>
                </div>
                <div role="radiogroup" aria-labelledby="response-format-label" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {RESPONSE_TYPES.map((r) => {
                    const active = form.responseType === r.value;
                    return (
                      <label
                        key={r.value}
                        className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl px-3 py-2.5 text-center transition-all focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary ${
                          active ? "bg-primary text-on-primary shadow-sm" : "bg-canvas-cream text-on-surface-variant hover:bg-surface-container-low"
                        }`}
                      >
                        <input type="radio" name="responseType" value={r.value} checked={active} onChange={() => setForm((f) => ({ ...f, responseType: r.value }))} className="sr-only" />
                        <Icon name={r.icon} size={18} />
                        <span className="t-label-sm">{r.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="prompt-input" className="t-label-sm tracking-wider text-text-muted uppercase">Teks Pertanyaan Refleksi</label>
                  <span className={`t-label-sm font-normal ${charCount >= PROMPT_MAX_LENGTH ? "text-error" : "text-text-muted"}`}>{charCount} / {PROMPT_MAX_LENGTH} karakter</span>
                </div>
                <textarea
                  id="prompt-input"
                  rows={3}
                  maxLength={PROMPT_MAX_LENGTH}
                  value={form.prompt}
                  onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
                  placeholder="Tuliskan pertanyaan yang memantik kelembutan hati..."
                  className="t-headline-sm w-full resize-none rounded-2xl bg-canvas-cream p-4 leading-relaxed text-on-surface shadow-sm outline-none transition-all placeholder:text-text-muted focus:bg-surface focus-visible:ring-2 focus-visible:ring-sage-medium"
                />
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className={`t-label-sm flex items-center gap-2 font-normal ${form.prompt.trim() === fallback.template ? "text-tertiary" : "text-primary"}`}>
                    <Icon name="verified" size={16} />
                    {form.prompt.trim() === fallback.template ? "Status: Template Fallback" : "Status: Custom Coach Prompt (Bukan Fallback)"}
                  </span>
                  <button type="button" onClick={() => setForm((f) => ({ ...f, prompt: fallback.template.slice(0, PROMPT_MAX_LENGTH) }))} className="t-label-sm text-tertiary hover:underline">
                    Gunakan Template Rekomendasi
                  </button>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl bg-surface-container-low/70 p-5">
                <span className="flex items-center gap-2.5">
                  <Icon name="graphic_eq" size={20} className="text-primary" />
                  <span className="t-title-sm font-semibold text-on-surface">Voice Note Renungan</span>
                </span>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-canvas-ivory p-3">
                  {form.voice ? (
                    <>
                      <div className="flex min-w-0 items-center gap-3">
                        <button type="button" aria-label={playing ? "Jeda voice note" : "Putar voice note"} onClick={togglePlay} className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm transition-transform hover:scale-105">
                          <Icon name={playing ? "pause" : "play_arrow"} size={20} />
                        </button>
                        <div className="min-w-0">
                          <p className="t-title-sm truncate text-[13px] leading-tight font-semibold text-on-surface">{form.voice.name}</p>
                          <p className="text-[11px] text-text-muted">{form.voice.meta}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <label title="Ganti Audio" className="cursor-pointer rounded-lg p-2 text-text-muted transition-colors focus-within:outline-2 focus-within:outline-primary hover:bg-surface-container hover:text-on-surface">
                          <input type="file" accept="audio/*" className="sr-only" onChange={(e) => { void onPickAudio(e.target.files?.[0]); e.target.value = ""; }} />
                          <Icon name="cloud_upload" size={18} />
                          <span className="sr-only">Ganti audio</span>
                        </label>
                        <button type="button" title="Hapus Voice Note" aria-label="Hapus voice note" onClick={() => { stopAudio(); setForm((f) => ({ ...f, voice: null })); }} className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-container hover:text-error">
                          <Icon name="delete" size={18} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <label className="t-label-md flex w-full cursor-pointer items-center justify-center gap-2 py-1 text-tertiary focus-within:outline-2 focus-within:outline-primary">
                      <input type="file" accept="audio/*" className="sr-only" onChange={(e) => { void onPickAudio(e.target.files?.[0]); e.target.value = ""; }} />
                      <Icon name="cloud_upload" size={18} />
                      <span>Unggah voice note renungan (opsional)</span>
                    </label>
                  )}
                </div>
              </div>
            </fieldset>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button type="button" onClick={reset} disabled={readOnly} className="t-label-md flex items-center gap-1.5 px-4 py-2 text-text-muted transition-colors hover:text-on-surface disabled:opacity-50">
                <Icon name="restart_alt" size={18} />
                <span>Reset Perubahan</span>
              </button>
              <div className="flex gap-3">
                <button type="button" onClick={saveDraft} disabled={readOnly || duplicate || busy !== null} className="t-label-md rounded-full bg-canvas-cream px-5 py-2.5 text-on-surface transition-colors hover:bg-surface-container-low disabled:opacity-50">
                  {busy === "draft" ? "Menyimpan..." : "Simpan Sebagai Draft"}
                </button>
                <button type="button" onClick={publish} disabled={readOnly || duplicate || busy !== null} className="t-label-md rounded-full bg-primary px-6 py-2.5 text-on-primary shadow-sm transition-all hover:bg-primary-container disabled:opacity-50">
                  {busy === "publish" ? "Memproses..." : mode === "edit" ? "Perbarui Prompt" : "Publikasikan ke Cohort"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Simulator */}
        <section aria-label="Simulator ponsel" className="flex flex-col items-center xl:col-span-4">
          <div className="flex w-full items-center justify-between px-2 pb-3">
            <span className="flex items-center gap-2">
              <Icon name="smartphone" size={20} className="text-primary" />
              <span className="t-title-sm font-semibold text-on-surface">Smartphone Preview Simulator</span>
            </span>
            <span className="t-label-sm rounded-full bg-canvas-ivory px-2.5 py-1 font-normal text-text-muted">Laras &amp; Rayhan (PWA)</span>
          </div>
          <PhonePreview
            prompt={form.prompt}
            responseType={form.responseType}
            dayLabel={`Hari ke-${form.day} dari ${DAYS_PER_SESSION} Hari`}
            sessionTitle={session.label}
            voice={form.voice}
          />
        </section>

        {/* Jadwal */}
        <section aria-label="Jadwal dan status siklus" className="flex flex-col gap-6 xl:col-span-3">
          <div className="space-y-4 rounded-3xl bg-canvas-ivory p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="t-title-sm font-semibold text-on-surface">Siklus Cohort 04</span>
              <span className="t-label-sm rounded-full bg-accent-sunray px-2.5 py-0.5 font-medium text-on-surface">{CYCLE_STATS.dayLabel}</span>
            </div>
            <div className="space-y-1.5">
              <div className="t-body-sm flex justify-between text-text-muted">
                <span>Tingkat Kepatuhan Renungan</span>
                <span className="font-semibold text-on-surface">{CYCLE_STATS.compliance}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                <div className="h-full rounded-full bg-primary" style={{ width: `${CYCLE_STATS.compliance}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-2xl bg-canvas-cream p-3 text-center">
                <span className="t-headline-sm block text-primary">{CYCLE_STATS.responded}</span>
                <span className="text-[11px] text-text-muted">Pasutri Merespons</span>
              </div>
              <div className="rounded-2xl bg-canvas-cream p-3 text-center">
                <span className="t-headline-sm block text-tertiary">{CYCLE_STATS.needNudge}</span>
                <span className="text-[11px] text-text-muted">Perlu Nudge Subuh</span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 rounded-3xl bg-canvas-ivory p-6 shadow-sm">
            <div className="space-y-0.5">
              <h2 className="t-title-sm font-semibold text-on-surface">Jadwal Prompt Berurutan</h2>
              <p className="t-label-sm font-normal text-text-muted">Gated timeline anti-duplikasi</p>
            </div>
            <div className="space-y-4">
              {visibleSessions.map((sNo) => (
                <div key={sNo} className="space-y-2.5">
                  {expanded && <p className="t-label-sm tracking-wider text-text-muted uppercase">Sesi {sNo}</p>}
                  <ul className="space-y-2.5">
                    {Array.from({ length: DAYS_PER_SESSION }, (_, i) => i + 1).map((d) => (
                      <ScheduleRow
                        key={d}
                        day={d}
                        item={schedule[slotKey(sNo, d)]}
                        selected={form.session === sNo && form.day === d}
                        onSelect={() => selectSlot(sNo, d)}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setExpanded((e) => !e)} aria-expanded={expanded} className="t-label-md flex w-full items-center justify-center gap-2 rounded-2xl bg-canvas-cream py-2.5 text-center text-on-surface transition-colors hover:bg-surface-container-low">
              <Icon name="view_timeline" size={18} />
              <span>{expanded ? "Tampilkan Sesi Terpilih Saja" : "Lihat Seluruh 14 Hari Siklus"}</span>
            </button>
          </div>
        </section>
      </div>

      <FallbackDialog open={fallbackOpen} onClose={() => setFallbackOpen(false)} value={fallback} onSave={setFallback} />
    </div>
  );
}

function SelectField({ id, label, value, onChange, children }: { id: string; label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="t-label-sm block tracking-wider text-text-muted uppercase">{label}</label>
      <div className="relative">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="t-title-sm w-full cursor-pointer appearance-none rounded-2xl bg-canvas-cream px-4 py-3 pr-10 text-on-surface shadow-sm outline-none transition-colors focus:bg-surface focus-visible:ring-2 focus-visible:ring-sage-medium">
          {children}
        </select>
        <Icon name="expand_more" size={20} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-text-muted" />
      </div>
    </div>
  );
}

function ScheduleRow({ day, item, selected, onSelect }: { day: number; item: Item | undefined; selected: boolean; onSelect: () => void }) {
  const ring = selected ? "ring-2 ring-primary/60" : "";

  if (!item) {
    return (
      <li>
        <button type="button" onClick={onSelect} className={`flex w-full items-center justify-between gap-3 rounded-2xl bg-canvas-cream/60 p-3 text-left transition-colors hover:bg-surface-container-low ${ring}`}>
          <span className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-container text-[11px] font-bold text-text-muted">{day}</span>
            <span className="min-w-0">
              <span className="t-title-sm block truncate text-[13px] font-semibold text-on-surface">H-{day}: Belum dijadwalkan</span>
              <span className="text-[11px] text-text-muted">Slot kosong</span>
            </span>
          </span>
          <span className="shrink-0 text-[11px] font-semibold text-primary">Jadwalkan</span>
        </button>
      </li>
    );
  }

  if (item.state === "active") {
    return (
      <li>
        <button type="button" onClick={onSelect} className={`flex w-full items-center justify-between gap-3 rounded-2xl bg-primary-container p-3.5 text-left text-on-primary-container shadow-md ${ring}`}>
          <span className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-on-primary-container text-[11px] font-bold text-primary-container">{day}</span>
            <span className="min-w-0">
              <span className="t-title-sm block truncate text-[13px] font-bold">H-{day}: {item.title}</span>
              <span className="text-[11px] opacity-90">Tayang Hari Ini · {item.responseRate}% Aktif</span>
            </span>
          </span>
          <span className="shrink-0 animate-pulse rounded-full bg-on-primary px-2.5 py-0.5 text-[10px] font-bold text-primary">AKTIF</span>
        </button>
      </li>
    );
  }

  const done = item.state === "done";
  const locked = item.state === "locked";
  return (
    <li>
      <button type="button" onClick={onSelect} className={`flex w-full items-center justify-between gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-surface-container-low ${locked ? "bg-canvas-cream/50 opacity-75" : "bg-canvas-cream"} ${ring}`}>
        <span className="flex min-w-0 flex-1 items-center gap-3">
          <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${done ? "bg-sage-tint text-primary" : "bg-surface-container text-text-muted"}`}>
            {done ? <Icon name="check" size={16} /> : locked ? <Icon name="lock" size={14} /> : day}
          </span>
          <span className="min-w-0">
            <span className="t-title-sm block truncate text-[13px] font-semibold text-on-surface">H-{day}: {item.title}</span>
            <span className="text-[11px] text-text-muted">
              {done ? `${item.responseRate}% Pasutri Merespons` : locked ? "Terkunci (Menunggu Hari 6)" : item.state === "draft" ? "Draf belum terbit" : "Terjadwal Esok Subuh"}
            </span>
          </span>
        </span>
        {done ? (
          <span className="shrink-0 rounded-md bg-sage-tint px-2 py-0.5 text-[10px] text-primary">{STATE_LABEL.done}</span>
        ) : locked ? (
          <Icon name="lock_clock" size={16} className="shrink-0 text-text-muted" />
        ) : (
          <span className="shrink-0 text-[11px] font-semibold text-primary">Edit</span>
        )}
      </button>
    </li>
  );
}

function FallbackDialog({ open, onClose, value, onSave }: { open: boolean; onClose: () => void; value: { enabled: boolean; template: string }; onSave: (v: { enabled: boolean; template: string }) => void }) {
  return (
    <Dialog open={open} onClose={onClose} eyebrow="Pengaturan" title="Fallback Otomatis Prompt">
      <FallbackForm onClose={onClose} value={value} onSave={onSave} />
    </Dialog>
  );
}

function FallbackForm({ onClose, value, onSave }: { onClose: () => void; value: { enabled: boolean; template: string }; onSave: (v: { enabled: boolean; template: string }) => void }) {
  const { showToast } = useToast();
  const [enabled, setEnabled] = useState(value.enabled);
  const [template, setTemplate] = useState(value.template);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (enabled && template.trim().length < 10) {
      setError("Template fallback minimal 10 karakter.");
      return;
    }
    setSaving(true);
    const result = await saveFallbackSettings({ enabled, template });
    setSaving(false);
    if (!result.ok) return setError(result.error);
    onSave({ enabled, template: template.trim() });
    onClose();
    showToast("Pengaturan fallback disimpan.", { tone: "success" });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <p className="t-body-sm text-text-muted">
        Bila belum ada prompt yang dijadwalkan untuk suatu hari, sistem memakai template ini agar peserta tetap
        mendapat pertanyaan pada waktu Subuh.
      </p>
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-canvas-ivory p-4">
        <span>
          <span className="t-title-sm block text-on-surface">Aktifkan fallback otomatis</span>
          <span className="t-body-sm text-text-muted">Kirim template rekomendasi jika slot kosong.</span>
        </span>
        <input type="checkbox" role="switch" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="size-5 shrink-0 accent-primary" />
      </label>
      <div className="space-y-1">
        <FieldLabel htmlFor="fallback-template" hint={<span>{template.length}/{PROMPT_MAX_LENGTH}</span>}>Template fallback</FieldLabel>
        <textarea id="fallback-template" rows={4} maxLength={PROMPT_MAX_LENGTH} disabled={!enabled} value={template} onChange={(e) => { setTemplate(e.target.value); setError(""); }} className={`${fieldClass} resize-none leading-relaxed disabled:opacity-60`} />
        {error && <p role="alert" className="t-body-sm text-error">{error}</p>}
      </div>
      <DialogActions onCancel={onClose} submitLabel="Simpan Pengaturan" submitting={saving} />
    </form>
  );
}
