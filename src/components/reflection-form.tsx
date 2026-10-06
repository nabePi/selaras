"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./icon";
import type { PromptQuestion } from "@/data/journal-prompts";
import type { ResponseAttachment } from "@/data/prompt-responses";
import { api } from "@/lib/api-client";
import {
  attachmentKind,
  formatSize,
  MAX_ATTACHMENTS,
  maxBytesFor,
  type AttachmentKind,
} from "@/lib/attachments";
import type { AnswerMap } from "@/lib/journal-types";
import { PromptQuestions } from "./prompt-questions";
import { useToast } from "./toast-provider";

type Initial = { content: string; shared: boolean; answers: AnswerMap; attachments: ResponseAttachment[] };

type Attachment = {
  id: string;
  /** id lampiran yang sudah tersimpan di server (entri yang sedang disunting) */
  existingId?: number;
  /** kunci objek R2 setelah unggahan selesai */
  key?: string;
  name: string;
  size: number;
  kind: AttachmentKind;
  previewUrl: string;
  status: "uploading" | "done" | "error";
  progress: number;
  error?: string;
};

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** PUT langsung ke R2 lewat URL bertanda tangan, dengan laporan progres. */
function putFile(url: string, file: File, onProgress: (pct: number) => void, register: (xhr: XMLHttpRequest) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    register(xhr);
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Unggahan ditolak server.")));
    xhr.onerror = () => reject(new Error("Gagal mengunggah. Periksa koneksi internetmu."));
    xhr.onabort = () => reject(new Error("aborted"));
    xhr.send(file);
  });
}

function fromExisting(a: ResponseAttachment): Attachment {
  return {
    id: `existing-${a.id}`,
    existingId: a.id,
    name: a.title,
    size: 0,
    kind: a.kind,
    previewUrl: a.kind === "audio" ? "" : a.src,
    status: "done",
    progress: 100,
  };
}

export function ReflectionForm({
  questions = [],
  initial,
}: {
  /** Pertanyaan prompt hari ini; kosong = jurnal bebas. */
  questions?: PromptQuestion[];
  /** Entri hari ini yang sudah tersimpan (untuk menyunting). */
  initial?: Initial | null;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const switchLabelId = useId();

  const [text, setText] = useState(initial?.content ?? "");
  const [shared, setShared] = useState(initial?.shared ?? true);
  const [answers, setAnswers] = useState<AnswerMap>(initial?.answers ?? {});
  const [answerErrors, setAnswerErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<Attachment[]>(() => (initial?.attachments ?? []).map(fromExisting));
  const [fileError, setFileError] = useState("");
  const [textError, setTextError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachmentsRef = useRef<Attachment[]>(attachments);
  const xhrs = useRef(new Map<string, XMLHttpRequest>());
  const redirectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const running = xhrs.current;
    return () => {
      running.forEach((x) => x.abort());
      attachmentsRef.current.forEach((a) => a.previewUrl.startsWith("blob:") && URL.revokeObjectURL(a.previewUrl));
      clearTimeout(redirectTimer.current);
    };
  }, []);

  const words = countWords(text);
  const counter =
    words === 0
      ? { text: "0 kata · Teks jawaban wajib", tone: textError ? "text-accent-coral" : "text-text-muted" }
      : words < 20
        ? { text: `${words} kata · Ceritakan sedikit lebih dalam`, tone: "text-text-muted" }
        : { text: `${words} kata · Refleksi bermakna tercapai`, tone: "font-semibold text-primary" };

  const uploading = attachments.some((a) => a.status === "uploading");

  function patch(id: string, change: Partial<Attachment>) {
    const next = attachmentsRef.current.map((a) => (a.id === id ? { ...a, ...change } : a));
    attachmentsRef.current = next;
    setAttachments(next);
  }

  async function upload(file: File, item: Attachment) {
    const presigned = await api<{ key: string; uploadUrl: string }>("/api/journal/attachments/presign", "POST", {
      name: file.name,
      type: file.type,
      size: file.size,
    });
    if (!presigned.ok) return patch(item.id, { status: "error", error: presigned.error });
    try {
      await putFile(
        presigned.data.uploadUrl,
        file,
        (progress) => patch(item.id, { progress }),
        (xhr) => xhrs.current.set(item.id, xhr),
      );
      patch(item.id, { status: "done", progress: 100, key: presigned.data.key });
    } catch (e) {
      if ((e as Error).message !== "aborted") patch(item.id, { status: "error", error: (e as Error).message });
    } finally {
      xhrs.current.delete(item.id);
    }
  }

  function addFiles(files: File[]) {
    const errors: string[] = [];
    const accepted: { file: File; item: Attachment }[] = [];
    let count = attachmentsRef.current.length;
    for (const file of files) {
      const kind = attachmentKind(file.type);
      if (!kind) {
        errors.push(`${file.name}: format tidak didukung.`);
      } else if (count >= MAX_ATTACHMENTS) {
        errors.push(`Maksimal ${MAX_ATTACHMENTS} lampiran.`);
        break;
      } else if (file.size > maxBytesFor(kind)) {
        errors.push(kind === "image" ? `${file.name}: foto melebihi batas 5 MB.` : `${file.name}: melebihi batas 100 MB.`);
      } else {
        count += 1;
        accepted.push({
          file,
          item: {
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            kind,
            previewUrl: URL.createObjectURL(file),
            status: "uploading",
            progress: 0,
          },
        });
      }
    }
    setFileError(errors.join(" "));
    if (!accepted.length) return;
    const next = [...attachmentsRef.current, ...accepted.map((a) => a.item)];
    attachmentsRef.current = next;
    setAttachments(next);
    accepted.forEach(({ file, item }) => void upload(file, item));
  }

  function removeAttachment(id: string) {
    const target = attachmentsRef.current.find((a) => a.id === id);
    if (!target) return;
    xhrs.current.get(id)?.abort();
    if (target.previewUrl.startsWith("blob:")) URL.revokeObjectURL(target.previewUrl);
    // Berkas yang sudah terunggah tapi belum dikirim: hapus dari R2 (lampiran lama dihapus saat jurnal disimpan).
    if (target.key && target.existingId === undefined) {
      void api("/api/journal/attachments/delete", "POST", { key: target.key });
    }
    setFileError("");
    const next = attachmentsRef.current.filter((a) => a.id !== id);
    attachmentsRef.current = next;
    setAttachments(next);
  }

  async function submit() {
    const missing: Record<string, string> = {};
    for (const q of questions) {
      const v = answers[q.id];
      if (v === undefined || (typeof v === "string" && !v.trim())) missing[q.id] = "Pertanyaan ini belum dijawab.";
    }
    setAnswerErrors(missing);
    if (Object.keys(missing).length) {
      showToast("Lengkapi semua pertanyaan prompt hari ini.");
      return;
    }
    if (words === 0) {
      setTextError(true);
      textareaRef.current?.focus();
      return;
    }
    if (uploading) {
      showToast("Tunggu sampai semua lampiran selesai diunggah.");
      return;
    }
    if (attachments.some((a) => a.status === "error")) {
      showToast("Ada lampiran yang gagal diunggah. Hapus lampiran tersebut lalu coba lagi.");
      return;
    }
    setSubmitting(true);
    const result = await api("/api/journal/entries", "POST", {
      content: text,
      shared,
      answers,
      attachments: {
        keep: attachments.flatMap((a) => (a.existingId !== undefined ? [a.existingId] : [])),
        added: attachments.flatMap((a) => (a.existingId === undefined && a.key ? [{ key: a.key, name: a.name }] : [])),
      },
    });
    if (!result.ok) {
      setSubmitting(false);
      showToast(result.error);
      return;
    }
    showToast("Mengarahkan kembali ke Beranda...", {
      title: "Alhamdulillah, jurnal tersimpan!",
      tone: "success",
      duration: 2200,
    });
    router.refresh();
    redirectTimer.current = setTimeout(() => router.push("/home"), 2200);
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col"
    >
      {questions.length > 0 && (
        <div className="mb-4">
          <PromptQuestions
            questions={questions}
            answers={answers}
            errors={answerErrors}
            onAnswer={(id, value) => {
              setAnswers((a) => ({ ...a, [id]: value }));
              setAnswerErrors((e) => ({ ...e, [id]: "" }));
            }}
          />
        </div>
      )}

      {/* Catatan */}
      <div className="mb-4 flex flex-col gap-1">
        <div className="flex items-center justify-between px-1">
          <label htmlFor="reflectionText" className="t-title-sm flex items-center gap-1.5 text-on-surface">
            Catatan Rasa
            <span aria-hidden="true" className="text-accent-coral">*</span>
          </label>
          <span className={`t-label-sm font-normal ${counter.tone}`}>{counter.text}</span>
        </div>
        <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm transition-shadow focus-within:shadow-md">
          <textarea
            id="reflectionText"
            ref={textareaRef}
            rows={7}
            required
            aria-invalid={textError}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (textError) setTextError(false);
            }}
            placeholder="Mulai ceritakan di sini... (teks jawaban wajib)"
            className="t-body-lg w-full resize-none border-0 bg-transparent leading-relaxed text-on-surface outline-none placeholder:text-text-muted/60"
          />
          <div className="flex justify-end pt-2">
            <Icon name="edit_note" size={18} className="text-surface-container-highest" />
          </div>
        </div>
      </div>

      {/* Lampiran */}
      <div className="mb-4 flex flex-col gap-1">
        <div className="flex items-center justify-between px-1">
          <span className="t-title-sm text-on-surface">Lampiran Kenangan (Opsional)</span>
          <span className="t-label-sm font-normal text-text-muted">
            {attachments.length}/{MAX_ATTACHMENTS} · Foto 5MB · Video/Suara 100MB
          </span>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl bg-surface-container-low p-3.5">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between rounded-xl bg-surface-container-lowest p-2.5 shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container">
                  {attachment.kind === "image" ? (
                    <Image
                      unoptimized
                      src={attachment.previewUrl}
                      alt="Pratinjau lampiran"
                      width={56}
                      height={56}
                      className="size-full object-cover"
                    />
                  ) : attachment.kind === "video" && attachment.previewUrl ? (
                    <video
                      src={`${attachment.previewUrl}#t=0.1`}
                      muted
                      preload="metadata"
                      className="size-full object-cover"
                    />
                  ) : (
                    <Icon name="graphic_eq" size={26} className="text-primary" />
                  )}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="t-title-sm truncate text-on-surface">{attachment.name}</span>
                  {attachment.status === "uploading" ? (
                    <div className="flex items-center gap-2">
                      <div
                        role="progressbar"
                        aria-label={`Mengunggah ${attachment.name}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={attachment.progress}
                        className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-container-high"
                      >
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${attachment.progress}%` }} />
                      </div>
                      <span className="t-body-sm text-text-muted">{attachment.progress}%</span>
                    </div>
                  ) : attachment.status === "error" ? (
                    <span role="alert" className="t-body-sm text-error">
                      {attachment.error ?? "Gagal diunggah."}
                    </span>
                  ) : (
                    <span className="t-body-sm text-text-muted">
                      {attachment.size ? `${formatSize(attachment.size)} · ` : ""}
                      {attachment.existingId !== undefined ? "Tersimpan" : "Siap dilampirkan"}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                aria-label={`Hapus lampiran ${attachment.name}`}
                onClick={() => removeAttachment(attachment.id)}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-error-container/40 hover:text-error"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
          ))}

          <label className="t-label-md flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-surface-container-lowest/70 px-4 py-3 font-medium text-on-surface transition-colors focus-within:outline-2 focus-within:outline-primary hover:bg-surface-container-lowest">
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              className="sr-only"
              onChange={(e) => {
                addFiles(Array.from(e.target.files ?? []));
                e.target.value = "";
              }}
            />
            <Icon name="add_photo_alternate" size={20} className="text-primary" />
            <span>Tambah foto, video, atau suara</span>
          </label>

          {fileError && (
            <p role="alert" className="t-body-sm px-1 text-center text-error">
              {fileError}
            </p>
          )}
          <p className="t-body-sm px-1 text-center text-text-muted">
            Tersimpan privat di cloud jurnalmu.
          </p>
        </div>
      </div>

      {/* Privasi */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-surface-container-low p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-sage-tint text-primary">
              <Icon name="shield_person" size={18} filled />
            </span>
            <div>
              <h3 id={switchLabelId} className="t-title-sm text-on-surface">
                Bagikan ke Coach &amp; Fasilitator
              </h3>
              <p className={`t-body-sm font-medium ${shared ? "text-primary" : "text-tertiary"}`}>
                {shared ? "Aktif · Pendampingan Personal" : "Pribadi (Hanya Saya)"}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={shared}
            aria-labelledby={switchLabelId}
            onClick={() => setShared((s) => !s)}
            className={`relative h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              shared ? "bg-primary" : "bg-canvas-sand"
            }`}
          >
            <span
              className={`block size-6 rounded-full bg-surface-container-lowest shadow-sm transition-transform duration-300 ${
                shared ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        <div className="rounded-xl bg-surface-container-lowest/80 p-3">
          <p className="t-body-sm leading-relaxed text-on-surface-variant">
            {shared
              ? "Teks refleksi hanya bisa dibaca oleh fasilitator kelasmu untuk bimbingan personal yang hangat. Jawaban skala akan dianonimkan untuk kurikulum bersama."
              : "Teks jurnal terkunci sepenuhnya dan disimpan eksklusif pada akunmu. Coach tidak dapat membaca narasi ini."}
          </p>
        </div>
      </div>

      {/* Aksi */}
      <div className="flex flex-col gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-on-primary shadow-sm transition-all duration-200 hover:bg-primary-container active:scale-[0.98] disabled:opacity-80"
        >
          <Icon name="send" size={20} filled />
          <span className="t-title-sm tracking-wide">{submitting ? "Menyimpan..." : uploading ? "Mengunggah lampiran..." : initial ? "Perbarui Jurnal" : "Simpan & Kirim Jurnal"}</span>
        </button>
      </div>
    </form>
  );
}
