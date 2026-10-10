"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CARE_ACCEPT, CARE_COACHES, CARE_FORMATS, CARE_LIMITS, careFileKind, MAX_CARE_FILES, type CareFile } from "@/data/coachee-care";
import { formatFileSize } from "@/data/courses";
import { api } from "@/lib/api-client";
import { EMPTY_DOC, isDocEmpty, type BlogNode } from "@/lib/blog-content";
import { putFile } from "@/lib/course-upload";
import { fieldClass, FieldLabel } from "../dialog";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";
import { btnPrimary } from "./page-header";
import { BlogEditor } from "./blog-editor";

const INPUT = `${fieldClass} border border-outline-variant focus-visible:border-sage-medium`;

const discard = (key: string) => void api("/api/admin/coachee-care/upload/discard", "POST", { key });

/** Unggah satu berkas langsung ke R2 lewat URL bertanda tangan; mengembalikan pesan galat bila gagal. */
async function uploadOne(file: File, onProgress: (pct: number) => void): Promise<CareFile | string> {
  const kind = careFileKind(file.type);
  if (!kind) return `${file.name}: format tidak didukung (gunakan ${CARE_FORMATS}).`;
  if (file.size > CARE_LIMITS[kind].maxBytes) return `${file.name}: melebihi batas ${CARE_LIMITS[kind].label}.`;
  const presigned = await api<{ key: string; uploadUrl: string }>("/api/admin/coachee-care/upload", "POST", {
    name: file.name,
    type: file.type,
    size: file.size,
  });
  if (!presigned.ok) return presigned.error;
  try {
    await putFile(presigned.data.uploadUrl, file, onProgress);
  } catch (e) {
    return e instanceof Error ? e.message : "Gagal mengunggah.";
  }
  return { key: presigned.data.key, name: file.name, mime: file.type, size: file.size, kind };
}

/** Form memberi coachee care: judul, pesan berformat, dan banyak lampiran. */
export function CoacheeCareForm({ user }: { user: { id: string; name: string } }) {
  const router = useRouter();
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [coach, setCoach] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState<BlogNode>(EMPTY_DOC);
  const [files, setFiles] = useState<CareFile[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ coach?: string; title?: string; message?: string }>({});
  const back = `/admin/users/${user.id}/coachee-care`;

  async function pick(list: FileList | null) {
    if (!list) return;
    let next = files;
    for (const file of Array.from(list)) {
      if (next.length >= MAX_CARE_FILES) {
        showToast(`Maksimal ${MAX_CARE_FILES} berkas.`);
        break;
      }
      setProgress(0);
      const result = await uploadOne(file, setProgress);
      setProgress(null);
      if (typeof result === "string") showToast(result);
      else {
        next = [...next, result];
        setFiles(next);
      }
    }
  }

  function removeFile(f: CareFile) {
    discard(f.key);
    setFiles((fs) => fs.filter((x) => x.key !== f.key));
  }

  function cancel() {
    files.forEach((f) => discard(f.key));
    router.push(back);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving || progress !== null) return;
    const next: typeof errors = {};
    if (!coach) next.coach = "Pilih coach pemberi care.";
    if (title.trim().length < 3) next.title = "Judul minimal 3 karakter.";
    if (isDocEmpty(message)) next.message = "Pesan care wajib diisi.";
    setErrors(next);
    if (next.coach || next.title || next.message) return;

    setSaving(true);
    const result = await api(`/api/admin/users/${user.id}/coachee-care`, "POST", {
      coach,
      title,
      message,
      files: files.map((f) => ({ key: f.key, name: f.name })),
    });
    setSaving(false);
    if (!result.ok) return showToast(result.error);
    showToast("Coachee care berhasil dikirim.", { tone: "success" });
    router.push(back);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <header className="space-y-2">
        <span className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1 tracking-wide text-primary">
          <span className="size-1.5 rounded-full bg-primary" />
          Coachee Care
        </span>
        <h1 className="t-headline-lg tracking-tight text-on-surface">Beri Coachee Care</h1>
        <p className="t-body-md text-text-muted">
          Untuk {user.name} ({user.id})
        </p>
      </header>

      <form onSubmit={submit} noValidate className="space-y-6 rounded-3xl bg-canvas-ivory p-6 shadow-sm sm:p-8">
        <div className="space-y-1">
          <FieldLabel htmlFor="care-coach">Coach pemberi care</FieldLabel>
          <select id="care-coach" value={coach} onChange={(e) => setCoach(e.target.value)} aria-invalid={!!errors.coach} className={INPUT}>
            <option value="" disabled>
              Pilih coach…
            </option>
            {CARE_COACHES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.coach && (
            <p role="alert" className="t-body-sm text-error">
              {errors.coach}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <FieldLabel htmlFor="care-title">Judul</FieldLabel>
          <input id="care-title" value={title} maxLength={160} onChange={(e) => setTitle(e.target.value)} placeholder="Mis. Catatan pekan pertama" aria-invalid={!!errors.title} className={INPUT} />
          {errors.title && (
            <p role="alert" className="t-body-sm text-error">
              {errors.title}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <p className="t-label-sm font-normal text-text-muted">Pesan care</p>
          <BlogEditor initial={EMPTY_DOC} onChange={setMessage} onBusy={() => {}} media={false} label="Pesan care" placeholder="Tulis masukan untuk peserta…" invalid={!!errors.message} />
          {errors.message && (
            <p role="alert" className="t-body-sm text-error">
              {errors.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="t-label-sm font-normal text-text-muted">Lampiran</p>
          {files.length > 0 && (
            <ul className="space-y-1.5">
              {files.map((f) => (
                <li key={f.key} className="flex items-center gap-2 rounded-2xl bg-canvas-cream px-3 py-2">
                  <Icon name={f.kind === "image" ? "image" : f.kind === "audio" ? "audio_file" : f.kind === "video" ? "movie" : "description"} size={18} className="shrink-0 text-primary" />
                  <span className="t-body-sm min-w-0 flex-1 truncate text-on-surface">{f.name}</span>
                  <span className="t-label-sm shrink-0 text-text-muted">{formatFileSize(f.size)}</span>
                  <button type="button" aria-label={`Hapus ${f.name}`} onClick={() => removeFile(f)} className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-container-low hover:text-error">
                    <Icon name="delete" size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {progress !== null ? (
            <div className="flex w-full max-w-xs items-center gap-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-high">
                <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
              </div>
              <span className="t-label-sm text-text-muted tabular-nums">{progress}%</span>
            </div>
          ) : (
            <button type="button" onClick={() => inputRef.current?.click()} className="t-label-md flex w-fit cursor-pointer items-center gap-2 rounded-full bg-canvas-cream px-4 py-2.5 text-on-surface shadow-sm transition-colors hover:bg-surface-container-low">
              <Icon name="attach_file" size={16} />
              Tambah berkas
            </button>
          )}
          <p className="t-label-sm text-text-muted">
            {CARE_FORMATS} · maks 20 MB gambar, 200 MB dokumen, 500 MB audio, 4 GB video · maksimal {MAX_CARE_FILES} berkas
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={CARE_ACCEPT}
            hidden
            onChange={(e) => {
              void pick(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {progress !== null && <span className="t-body-sm text-text-muted">Menunggu unggahan selesai…</span>}
          <Link
            href={back}
            onClick={(e) => {
              e.preventDefault();
              cancel();
            }}
            className="t-title-sm rounded-full px-5 py-2.5 text-on-surface-variant transition-colors hover:bg-canvas-ivory"
          >
            Batal
          </Link>
          <button type="submit" disabled={saving || progress !== null} className={btnPrimary}>
            <Icon name="send" size={18} />
            {saving ? "Mengirim…" : "Kirim Coachee Care"}
          </button>
        </div>
      </form>
    </div>
  );
}
