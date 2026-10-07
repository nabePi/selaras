"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { UPLOAD_RULES, formatFileSize, type CourseFile, type UploadPurpose } from "@/data/courses";
import { discardCourseFile, uploadCourseFile } from "@/lib/course-upload";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";

type Common = {
  purpose: UploadPurpose;
  /** Kunci berkas yang sudah tersimpan di kelas; berkas lain dianggap unggahan baru. */
  savedKeys: Set<string>;
  /** Dipanggil +1 saat unggahan mulai dan -1 saat selesai, untuk menonaktifkan tombol simpan. */
  onBusy: (delta: 1 | -1) => void;
};

const dropClass =
  "t-label-md flex w-fit cursor-pointer items-center gap-2 rounded-full bg-canvas-cream px-4 py-2.5 text-on-surface shadow-sm transition-colors hover:bg-surface-container-low";

function useUpload({ purpose, onBusy }: Pick<Common, "purpose" | "onBusy">) {
  const { showToast } = useToast();
  const [progress, setProgress] = useState<number | null>(null);

  async function upload(file: File): Promise<CourseFile | null> {
    setProgress(0);
    onBusy(1);
    const result = await uploadCourseFile(file, purpose, setProgress);
    onBusy(-1);
    setProgress(null);
    if (!result.ok) {
      showToast(result.error);
      return null;
    }
    return result.file;
  }
  return { upload, progress };
}

function Progress({ pct }: { pct: number }) {
  return (
    <div className="flex w-full max-w-xs items-center gap-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-high">
        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
      </div>
      <span className="t-label-sm text-text-muted tabular-nums">{pct}%</span>
    </div>
  );
}

/** Satu berkas (poster, foto pengajar, atau rekaman). Gambar tampil sebagai pratinjau. */
export function CourseFileField({
  value,
  onChange,
  label,
  emptyIcon,
  previewClass = "aspect-[3/4] w-28",
  ...common
}: Common & {
  value: CourseFile | null;
  onChange: (file: CourseFile | null) => void;
  label: string;
  emptyIcon: string;
  previewClass?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, progress } = useUpload(common);
  const rule = UPLOAD_RULES[common.purpose];
  const isImage = common.purpose === "poster" || common.purpose === "instructor";

  async function pick(file: File | undefined) {
    if (!file) return;
    const uploaded = await upload(file);
    if (!uploaded) return;
    if (value && !common.savedKeys.has(value.key)) discardCourseFile(value.key);
    onChange(uploaded);
  }

  function remove() {
    if (value && !common.savedKeys.has(value.key)) discardCourseFile(value.key);
    onChange(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start gap-4">
        {isImage && (
          <div className={`relative shrink-0 overflow-hidden rounded-2xl bg-canvas-sand ${previewClass}`}>
            {value?.url ? (
              // URL bertanda tangan R2 / blob lokal: tidak melalui optimizer Next.
              <Image src={value.url} alt={label} fill unoptimized sizes="160px" className="object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center text-text-muted">
                <Icon name={emptyIcon} size={28} />
              </span>
            )}
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
          {!isImage && value && (
            <p className="t-body-sm flex min-w-0 items-center gap-2 text-on-surface">
              <Icon name="movie" size={18} className="shrink-0 text-primary" />
              <span className="truncate">{value.name}</span>
              {value.size > 0 && <span className="shrink-0 text-text-muted">· {formatFileSize(value.size)}</span>}
            </p>
          )}
          {progress !== null ? (
            <Progress pct={progress} />
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => inputRef.current?.click()} className={dropClass}>
                <Icon name="upload" size={16} />
                {value ? `Ganti ${label.toLowerCase()}` : `Unggah ${label.toLowerCase()}`}
              </button>
              {value && (
                <button
                  type="button"
                  onClick={remove}
                  className="t-label-md flex items-center gap-1.5 rounded-full px-3 py-2 text-error transition-colors hover:bg-error-container"
                >
                  <Icon name="delete" size={16} />
                  Hapus
                </button>
              )}
            </div>
          )}
          <p className="t-label-sm text-text-muted">
            {rule.formats} · maks {rule.maxLabel}
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={rule.accept}
        hidden
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/** Daftar dokumen (PDF, Word, PowerPoint, Excel) dengan unggah beberapa berkas sekaligus. */
export function CourseDocumentsField({
  value,
  onChange,
  ...common
}: Common & { value: CourseFile[]; onChange: (files: CourseFile[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, progress } = useUpload(common);
  const rule = UPLOAD_RULES.document;

  async function pick(files: FileList | null) {
    if (!files) return;
    let next = value;
    for (const file of Array.from(files)) {
      const uploaded = await upload(file);
      if (uploaded) {
        next = [...next, uploaded];
        onChange(next);
      }
    }
  }

  function remove(file: CourseFile) {
    if (!common.savedKeys.has(file.key)) discardCourseFile(file.key);
    onChange(value.filter((f) => f.key !== file.key));
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((f) => (
            <li key={f.key} className="flex items-center gap-2 rounded-2xl bg-canvas-cream px-3 py-2">
              <Icon name="description" size={18} className="shrink-0 text-primary" />
              {f.url ? (
                <a href={f.url} target="_blank" rel="noreferrer" className="t-body-sm min-w-0 flex-1 truncate text-on-surface hover:underline">
                  {f.name}
                </a>
              ) : (
                <span className="t-body-sm min-w-0 flex-1 truncate text-on-surface">{f.name}</span>
              )}
              {f.size > 0 && <span className="t-label-sm shrink-0 text-text-muted">{formatFileSize(f.size)}</span>}
              <button
                type="button"
                aria-label={`Hapus ${f.name}`}
                onClick={() => remove(f)}
                className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-container-low hover:text-error"
              >
                <Icon name="delete" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {progress !== null ? (
        <Progress pct={progress} />
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} className={dropClass}>
          <Icon name="attach_file" size={16} />
          Unggah dokumen
        </button>
      )}
      <p className="t-label-sm text-text-muted">
        {rule.formats} · maks {rule.maxLabel} per berkas
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={rule.accept}
        hidden
        onChange={(e) => {
          void pick(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/** Beberapa poster kelas: kisi pratinjau dengan tombol hapus, dan unggah banyak gambar sekaligus. */
export function CoursePostersField({
  value,
  onChange,
  ...common
}: Omit<Common, "purpose"> & { value: CourseFile[]; onChange: (files: CourseFile[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, progress } = useUpload({ ...common, purpose: "poster" });
  const rule = UPLOAD_RULES.poster;

  async function pick(files: FileList | null) {
    if (!files) return;
    let next = value;
    for (const file of Array.from(files)) {
      const uploaded = await upload(file);
      if (uploaded) {
        next = [...next, uploaded];
        onChange(next);
      }
    }
  }

  function remove(file: CourseFile) {
    if (!common.savedKeys.has(file.key)) discardCourseFile(file.key);
    onChange(value.filter((f) => f.key !== file.key));
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {value.map((f, i) => (
            <li key={f.key} className="relative aspect-[3/4] w-28 overflow-hidden rounded-2xl bg-canvas-sand">
              {f.url && <Image src={f.url} alt={`Poster ${i + 1}`} fill unoptimized sizes="112px" className="object-cover" />}
              <button
                type="button"
                aria-label={`Hapus poster ${i + 1}`}
                onClick={() => remove(f)}
                className="absolute top-1.5 right-1.5 rounded-full bg-inverse-surface/80 p-1 text-inverse-on-surface transition-colors hover:bg-error"
              >
                <Icon name="close" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {progress !== null ? (
        <Progress pct={progress} />
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} className={dropClass}>
          <Icon name="add_photo_alternate" size={16} />
          {value.length ? "Tambah poster" : "Unggah poster"}
        </button>
      )}
      <p className="t-label-sm text-text-muted">
        {rule.formats} · maks {rule.maxLabel} per poster · maksimal 10
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={rule.accept}
        hidden
        onChange={(e) => {
          void pick(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
