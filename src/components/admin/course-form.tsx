"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { hasOffline, hasOnline, isMapsUrl, meetingPlatform, SESSION_MODES, type Course, type CourseFile, type CourseSession } from "@/data/courses";
import { saveCourse } from "@/lib/admin-actions";
import { fieldClass, FieldLabel } from "../dialog";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";
import { CourseDocumentsField, CourseFileField, CoursePostersField, CourseRecordingsField } from "./course-file-field";
import { btnPrimary, btnSoft } from "./page-header";

const INPUT = `${fieldClass} border border-outline-variant focus-visible:border-sage-medium`;

type Errors = { title?: string; form?: string; sessions: Record<string, { title?: string; date?: string; endTime?: string; meetingUrl?: string; locationName?: string; mapsUrl?: string }> };

const slim = (f: CourseFile | null) => (f ? { key: f.key, name: f.name, size: f.size } : null);
const slimRecording = (f: CourseFile) => ({ ...slim(f)!, title: (f.title ?? "").trim() });

function GroupLabel({ children }: { children: React.ReactNode }) {
  return <p className="t-label-sm font-normal text-text-muted">{children}</p>;
}

function errorText(msg?: string) {
  return (
    msg && (
      <p role="alert" className="t-body-sm text-error">
        {msg}
      </p>
    )
  );
}

/** Tambah kelas baru, atau ubah kelas yang sudah ada bila `initial` diberikan. */
export function CourseForm({ initial }: { initial?: Course }) {
  const router = useRouter();
  const { showToast } = useToast();
  const nextId = useRef(1);
  const newSession = (uid: string): CourseSession => ({
    uid,
    title: "",
    date: "",
    time: "",
    endTime: "",
    mode: "ONLINE",
    meetingUrl: "",
    locationName: "",
    mapsUrl: "",
    instructorName: "",
    instructorBio: "",
    instructorPhoto: null,
    recordings: [],
    documents: [],
  });

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [posters, setPosters] = useState<CourseFile[]>(initial?.posters ?? []);
  const [sessions, setSessions] = useState<CourseSession[]>(() => initial?.sessions ?? [newSession("n0")]);
  const [errors, setErrors] = useState<Errors>({ sessions: {} });
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);

  // Berkas yang sudah ada di database tidak boleh dibuang dari R2 saat form ditutup.
  const [savedKeys] = useState(() => {
    const keys = new Set<string>();
    for (const p of initial?.posters ?? []) keys.add(p.key);
    for (const s of initial?.sessions ?? []) {
      if (s.instructorPhoto) keys.add(s.instructorPhoto.key);
      for (const r of s.recordings) keys.add(r.key);
      for (const d of s.documents) keys.add(d.key);
    }
    return keys;
  });
  const onBusy = (delta: 1 | -1) => setUploading((n) => n + delta);

  const update = (uid: string, patch: Partial<CourseSession>) =>
    setSessions((ss) => ss.map((s) => (s.uid === uid ? { ...s, ...patch } : s)));

  function move(index: number, dir: -1 | 1) {
    setSessions((ss) => {
      const to = index + dir;
      if (to < 0 || to >= ss.length) return ss;
      const copy = [...ss];
      [copy[index], copy[to]] = [copy[to], copy[index]];
      return copy;
    });
  }

  function copyInstructor(uid: string, fromUid: string) {
    const from = sessions.find((s) => s.uid === fromUid);
    if (from) update(uid, { instructorName: from.instructorName, instructorBio: from.instructorBio, instructorPhoto: from.instructorPhoto });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving || uploading) return;
    const next: Errors = { sessions: {} };
    if (title.trim().length < 3) next.title = "Judul kelas minimal 3 karakter.";
    if (sessions.length === 0) next.form = "Tambahkan minimal satu sesi.";
    for (const s of sessions) {
      const err: Errors["sessions"][string] = {};
      if (s.title.trim().length < 3) err.title = "Judul sesi minimal 3 karakter.";
      if (!s.date) err.date = "Tanggal sesi wajib diisi.";
      if (s.endTime && !s.time) err.endTime = "Isi jam mulai dulu.";
      else if (s.endTime && s.endTime <= s.time) err.endTime = "Jam berakhir harus setelah jam mulai.";
      if (hasOnline(s.mode) && s.meetingUrl.trim() && !meetingPlatform(s.meetingUrl.trim())) err.meetingUrl = "Tautan harus diawali https://";
      if (hasOffline(s.mode)) {
        if (!s.locationName.trim()) err.locationName = "Nama lokasi wajib diisi.";
        if (s.mapsUrl.trim() && !isMapsUrl(s.mapsUrl.trim())) err.mapsUrl = "Gunakan tautan Google Maps (maps.app.goo.gl atau google.com/maps).";
      }
      if (Object.keys(err).length) next.sessions[s.uid] = err;
    }
    setErrors(next);
    if (next.title || next.form || Object.keys(next.sessions).length) return;

    setSaving(true);
    const result = await saveCourse(
      {
        title,
        description,
        posters: posters.map((p) => slim(p)!),
        sessions: sessions.map((s) => ({
          title: s.title,
          date: s.date,
          time: s.time,
          endTime: s.time ? s.endTime : "",
          mode: s.mode,
          meetingUrl: hasOnline(s.mode) ? s.meetingUrl : "",
          locationName: hasOffline(s.mode) ? s.locationName : "",
          mapsUrl: hasOffline(s.mode) ? s.mapsUrl : "",
          instructorName: s.instructorName,
          instructorBio: s.instructorBio,
          instructorPhoto: slim(s.instructorPhoto),
          recordings: s.recordings.map(slimRecording),
          documents: s.documents.map((d) => slim(d)!),
        })),
      },
      initial?.id,
    );
    setSaving(false);
    if (!result.ok) return showToast(result.error);
    showToast(initial ? "Kelas diperbarui." : "Kelas dibuat.", { tone: "success" });
    router.push("/admin/kelas");
    router.refresh();
  }

  const common = { savedKeys, onBusy };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <div className="flex items-center justify-between gap-3">
        <span className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1 tracking-wide text-primary">
          {initial ? "Edit Kelas" : "Kelas Baru"}
        </span>
        <Link href="/admin/kelas" className={btnSoft}>
          <Icon name="arrow_back" size={18} />
          <span>Kembali ke Daftar</span>
        </Link>
      </div>

      <header className="max-w-3xl space-y-2">
        <h1 className="t-headline-lg tracking-tight text-on-surface">{initial ? initial.title : "Buat Kelas Baru"}</h1>
        <p className="t-body-md leading-relaxed text-text-muted">
          Isi informasi kelas, lalu tambahkan sesinya. Tiap sesi bisa online (Zoom/Google Meet), offline (lokasi + Google Maps), atau hybrid, dan punya pengajar, rekaman, dan
          dokumen sendiri.
        </p>
      </header>

      <form onSubmit={submit} noValidate className="space-y-6">
        <section className="space-y-4 rounded-3xl bg-canvas-ivory p-6 shadow-sm">
          <h2 className="t-title-md text-on-surface">Informasi Kelas</h2>
          <div className="space-y-1">
            <FieldLabel htmlFor="course-title">Judul kelas</FieldLabel>
            <input
              id="course-title"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="cth: Mirrage Life"
              className={`${INPUT} ${errors.title ? "ring-2 ring-error" : ""}`}
            />
            {errorText(errors.title)}
          </div>
          <div className="space-y-1">
            <FieldLabel htmlFor="course-desc">Deskripsi kelas</FieldLabel>
            <textarea
              id="course-desc"
              value={description}
              maxLength={4000}
              rows={5}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan tentang kelas ini…"
              className={`${INPUT} py-3`}
            />
          </div>
          <div className="space-y-1">
            <GroupLabel>Poster kelas (bisa lebih dari satu)</GroupLabel>
            <CoursePostersField value={posters} onChange={setPosters} {...common} />
          </div>
        </section>

        <div className="space-y-4">
          <h2 className="t-title-md text-on-surface">Sesi ({sessions.length})</h2>
          {errorText(errors.form)}
          {sessions.map((s, i) => {
            const err = errors.sessions[s.uid] ?? {};
            const platform = meetingPlatform(s.meetingUrl.trim());
            const others = sessions.filter((x) => x.uid !== s.uid && (x.instructorName || x.instructorPhoto));
            return (
              <section key={s.uid} className="space-y-5 rounded-3xl bg-canvas-ivory p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="t-title-sm flex items-center gap-2 text-on-surface">
                    <span className="t-label-md flex size-7 items-center justify-center rounded-full bg-primary text-on-primary">{i + 1}</span>
                    Sesi {i + 1}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button type="button" aria-label="Naikkan sesi" disabled={i === 0} onClick={() => move(i, -1)} className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-container-low disabled:opacity-30">
                      <Icon name="arrow_upward" size={18} />
                    </button>
                    <button type="button" aria-label="Turunkan sesi" disabled={i === sessions.length - 1} onClick={() => move(i, 1)} className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-container-low disabled:opacity-30">
                      <Icon name="arrow_downward" size={18} />
                    </button>
                    <button
                      type="button"
                      aria-label="Hapus sesi"
                      disabled={sessions.length === 1}
                      onClick={() => setSessions((ss) => ss.filter((x) => x.uid !== s.uid))}
                      className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-container-low hover:text-error disabled:opacity-30"
                    >
                      <Icon name="delete" size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <FieldLabel htmlFor={`st-${s.uid}`}>Judul sesi</FieldLabel>
                  <input
                    id={`st-${s.uid}`}
                    value={s.title}
                    maxLength={160}
                    onChange={(e) => update(s.uid, { title: e.target.value })}
                    placeholder="cth: Wanita Mandiri, Taat pada Suami, Bisakah?"
                    className={`${INPUT} ${err.title ? "ring-2 ring-error" : ""}`}
                  />
                  {errorText(err.title)}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <FieldLabel htmlFor={`sd-${s.uid}`}>Tanggal</FieldLabel>
                    <input id={`sd-${s.uid}`} type="date" value={s.date} onChange={(e) => update(s.uid, { date: e.target.value })} className={`${INPUT} ${err.date ? "ring-2 ring-error" : ""}`} />
                    {errorText(err.date)}
                  </div>
                  <div className="space-y-1">
                    <FieldLabel htmlFor={`sh-${s.uid}`}>Jam mulai (WIB, opsional)</FieldLabel>
                    <input id={`sh-${s.uid}`} type="time" value={s.time} onChange={(e) => update(s.uid, { time: e.target.value })} className={INPUT} />
                  </div>
                  <div className="space-y-1">
                    <FieldLabel htmlFor={`se-${s.uid}`}>Jam berakhir (WIB, opsional)</FieldLabel>
                    <input id={`se-${s.uid}`} type="time" value={s.endTime} onChange={(e) => update(s.uid, { endTime: e.target.value })} className={`${INPUT} ${err.endTime ? "ring-2 ring-error" : ""}`} />
                    {errorText(err.endTime)}
                  </div>
                </div>

                <div className="space-y-1">
                  <GroupLabel>Format sesi</GroupLabel>
                  <div role="radiogroup" aria-label="Format sesi" className="flex flex-wrap gap-2">
                    {SESSION_MODES.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        role="radio"
                        aria-checked={s.mode === m.value}
                        onClick={() => update(s.uid, { mode: m.value })}
                        className={`t-label-md rounded-full border px-4 py-1.5 transition-colors ${
                          s.mode === m.value
                            ? "border-primary bg-primary text-on-primary"
                            : "border-outline-variant bg-surface text-on-surface hover:bg-surface-container-low"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {hasOnline(s.mode) && (
                  <div className="space-y-1">
                    <FieldLabel htmlFor={`sl-${s.uid}`}>Tautan Zoom / Google Meet</FieldLabel>
                    <input
                      id={`sl-${s.uid}`}
                      type="url"
                      value={s.meetingUrl}
                      onChange={(e) => update(s.uid, { meetingUrl: e.target.value })}
                      placeholder="https://zoom.us/j/… atau https://meet.google.com/…"
                      className={`${INPUT} ${err.meetingUrl ? "ring-2 ring-error" : ""}`}
                    />
                    {platform && s.meetingUrl.trim() && <p className="t-label-sm text-text-muted">Terdeteksi: {platform}</p>}
                    {errorText(err.meetingUrl)}
                  </div>
                )}

                {hasOffline(s.mode) && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <FieldLabel htmlFor={`sp-${s.uid}`}>Nama lokasi acara</FieldLabel>
                      <input
                        id={`sp-${s.uid}`}
                        value={s.locationName}
                        maxLength={200}
                        onChange={(e) => update(s.uid, { locationName: e.target.value })}
                        placeholder="cth: Aula Masjid Al-Falah, Jakarta"
                        className={`${INPUT} ${err.locationName ? "ring-2 ring-error" : ""}`}
                      />
                      {errorText(err.locationName)}
                    </div>
                    <div className="space-y-1">
                      <FieldLabel htmlFor={`sm-${s.uid}`}>Tautan Google Maps (opsional)</FieldLabel>
                      <input
                        id={`sm-${s.uid}`}
                        type="url"
                        value={s.mapsUrl}
                        onChange={(e) => update(s.uid, { mapsUrl: e.target.value })}
                        placeholder="https://maps.app.goo.gl/…"
                        className={`${INPUT} ${err.mapsUrl ? "ring-2 ring-error" : ""}`}
                      />
                      {errorText(err.mapsUrl)}
                    </div>
                  </div>
                )}

                <div className="space-y-4 rounded-2xl bg-surface-container-low p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="t-title-sm text-on-surface">Pengajar</h4>
                    {others.length > 0 && (
                      <select
                        aria-label="Salin pengajar dari sesi lain"
                        value=""
                        onChange={(e) => e.target.value && copyInstructor(s.uid, e.target.value)}
                        className="t-label-md cursor-pointer rounded-full border border-outline-variant bg-surface px-3 py-1.5 text-on-surface"
                      >
                        <option value="">Salin dari sesi lain…</option>
                        {others.map((o) => (
                          <option key={o.uid} value={o.uid}>
                            Sesi {sessions.indexOf(o) + 1}: {o.instructorName || "tanpa nama"}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="space-y-1">
                    <FieldLabel htmlFor={`sn-${s.uid}`}>Nama pengajar</FieldLabel>
                    <input id={`sn-${s.uid}`} value={s.instructorName} maxLength={120} onChange={(e) => update(s.uid, { instructorName: e.target.value })} placeholder="cth: Ershy Rafanti, S.Psi., LCPC" className={INPUT} />
                  </div>
                  <div className="space-y-1">
                    <FieldLabel htmlFor={`sb-${s.uid}`}>Keterangan pengajar</FieldLabel>
                    <textarea id={`sb-${s.uid}`} value={s.instructorBio} maxLength={1000} rows={3} onChange={(e) => update(s.uid, { instructorBio: e.target.value })} placeholder="Latar belakang singkat pengajar" className={`${INPUT} py-3`} />
                  </div>
                  <div className="space-y-1">
                    <GroupLabel>Foto pengajar</GroupLabel>
                    <CourseFileField purpose="instructor" label="Foto" emptyIcon="person" previewClass="aspect-[4/5] w-24" value={s.instructorPhoto} onChange={(f) => update(s.uid, { instructorPhoto: f })} {...common} />
                  </div>
                </div>

                <div className="space-y-1">
                  <GroupLabel>Video rekaman sesi</GroupLabel>
                  <CourseRecordingsField value={s.recordings} onChange={(recordings) => update(s.uid, { recordings })} {...common} purpose="recording" />
                </div>

                <div className="space-y-1">
                  <GroupLabel>Dokumen sesi</GroupLabel>
                  <CourseDocumentsField purpose="document" value={s.documents} onChange={(documents) => update(s.uid, { documents })} {...common} />
                </div>
              </section>
            );
          })}

          <button type="button" onClick={() => setSessions((ss) => [...ss, newSession(`n${nextId.current++}`)])} className={btnSoft}>
            <Icon name="add" size={18} />
            <span>Tambah Sesi</span>
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {uploading > 0 && <span className="t-body-sm text-text-muted">Menunggu unggahan selesai…</span>}
          <Link href="/admin/kelas" className="t-title-sm rounded-full px-5 py-2.5 text-on-surface-variant transition-colors hover:bg-canvas-ivory">
            Batal
          </Link>
          <button type="submit" disabled={saving || uploading > 0} className={btnPrimary}>
            <Icon name="save" size={18} />
            {saving ? "Menyimpan…" : initial ? "Simpan Perubahan" : "Simpan Kelas"}
          </button>
        </div>
      </form>
    </div>
  );
}
