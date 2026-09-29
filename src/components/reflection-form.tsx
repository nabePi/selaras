"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./icon";
import { setStoredValue, useStoredValue } from "@/lib/stored-value";
import { useToast } from "./toast-provider";

const MB = 1024 * 1024;
const MAX_IMAGE = 5 * MB;
const MAX_AUDIO = 100 * MB;

type Attachment = { name: string; size: number; kind: "image" | "audio"; url: string };

function formatSize(bytes: number) {
  return `${(bytes / MB).toFixed(1)} MB`;
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function ReflectionForm({ draftKey }: { draftKey: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const switchLabelId = useId();

  // Teks awal berasal dari draf tersimpan; begitu pengguna mengetik, state lokal yang dipakai.
  const storedDraft = useStoredValue(draftKey);
  const [edited, setEdited] = useState<string | null>(null);
  const text = edited ?? storedDraft ?? "";
  const [shared, setShared] = useState(true);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [fileError, setFileError] = useState("");
  const [textError, setTextError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachmentUrl = useRef<string | null>(null);
  const redirectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      if (attachmentUrl.current) URL.revokeObjectURL(attachmentUrl.current);
      clearTimeout(redirectTimer.current);
    },
    [],
  );

  const words = countWords(text);
  const counter =
    words === 0
      ? { text: "0 kata · Teks jawaban wajib", tone: textError ? "text-accent-coral" : "text-text-muted" }
      : words < 20
        ? { text: `${words} kata · Ceritakan sedikit lebih dalam`, tone: "text-text-muted" }
        : { text: `${words} kata · Refleksi bermakna tercapai`, tone: "font-semibold text-primary" };

  function setFile(file: File | null) {
    if (attachmentUrl.current) URL.revokeObjectURL(attachmentUrl.current);
    attachmentUrl.current = null;
    setFileError("");
    if (!file) return setAttachment(null);

    const kind = file.type.startsWith("image/") ? "image" : "audio";
    if (file.size > (kind === "image" ? MAX_IMAGE : MAX_AUDIO)) {
      setAttachment(null);
      return setFileError(
        kind === "image"
          ? "Foto melebihi batas 5 MB. Pilih foto yang lebih kecil."
          : "Rekaman melebihi batas 100 MB.",
      );
    }
    const url = URL.createObjectURL(file);
    attachmentUrl.current = url;
    setAttachment({ name: file.name, size: file.size, kind, url });
  }

  function saveDraft() {
    if (!setStoredValue(draftKey, text)) {
      showToast("Draf tidak dapat disimpan di peramban ini.");
      return;
    }
    showToast("Lanjutkan kapan saja sebelum pergantian sesi.", {
      title: "Draf Berhasil Disimpan",
      tone: "success",
      duration: 2000,
    });
  }

  function submit() {
    if (words === 0) {
      setTextError(true);
      textareaRef.current?.focus();
      return;
    }
    setSubmitting(true);
    // Belum ada backend: jurnal belum dikirim ke server. Hubungkan ke API di sini.
    setStoredValue(draftKey, null);
    showToast("Mengarahkan kembali ke Beranda...", {
      title: "Alhamdulillah, jurnal tersimpan!",
      tone: "success",
      duration: 2200,
    });
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
              setEdited(e.target.value);
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
          <span className="t-label-sm font-normal text-text-muted">Maks. 5MB / 100MB</span>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl bg-surface-container-low p-3.5">
          {attachment && (
            <div className="flex items-center justify-between rounded-xl bg-surface-container-lowest p-2.5 shadow-sm">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container">
                  {attachment.kind === "image" ? (
                    <Image
                      unoptimized
                      src={attachment.url}
                      alt="Pratinjau lampiran"
                      width={56}
                      height={56}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Icon name="graphic_eq" size={26} className="text-primary" />
                  )}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="t-title-sm truncate text-on-surface">{attachment.name}</span>
                  <span className="t-body-sm text-text-muted">
                    {formatSize(attachment.size)} · Siap dilampirkan
                  </span>
                </div>
              </div>
              <button
                type="button"
                aria-label="Hapus lampiran"
                onClick={() => setFile(null)}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-error-container/40 hover:text-error"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
          )}

          <label className="t-label-md flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-surface-container-lowest/70 px-4 py-3 font-medium text-on-surface transition-colors focus-within:outline-2 focus-within:outline-primary hover:bg-surface-container-lowest">
            <input
              type="file"
              accept="image/*,audio/*"
              className="sr-only"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
            <Icon name="add_photo_alternate" size={20} className="text-primary" />
            <span>Tambah foto atau cuplikan suara</span>
          </label>

          {fileError && (
            <p role="alert" className="t-body-sm px-1 text-center text-error">
              {fileError}
            </p>
          )}
          <p className="t-body-sm px-1 text-center text-text-muted">
            Otomatis dikompres aman &amp; tersimpan privat dalam cloud jurnalmu.
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
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-on-primary shadow-sm transition-all duration-200 hover:bg-primary-container active:scale-[0.98] disabled:opacity-80"
        >
          <Icon name="send" size={20} filled />
          <span className="t-title-sm tracking-wide">Simpan &amp; Kirim Jurnal</span>
        </button>
        <button
          type="button"
          onClick={saveDraft}
          disabled={submitting}
          className="t-label-md flex w-full items-center justify-center gap-2 rounded-full bg-surface-container px-6 py-3.5 text-tertiary transition-all duration-200 hover:bg-surface-container-high active:scale-[0.99]"
        >
          <Icon name="bookmark" size={18} />
          <span>Simpan Draf Saja</span>
        </button>
      </div>
    </form>
  );
}
