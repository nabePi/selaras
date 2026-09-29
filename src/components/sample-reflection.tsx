"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Icon } from "./icon";

export function SampleReflection() {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSave() {
    if (value.trim().length > 5) {
      setSaved(true);
      return;
    }
    textareaRef.current?.focus();
    setInvalid(true);
    setTimeout(() => setInvalid(false), 1200);
  }

  return (
    <>
      <div className="relative w-full">
        <label htmlFor="sampleInput" className="sr-only">
          Tulis satu kalimat refleksi
        </label>
        <textarea
          id="sampleInput"
          ref={textareaRef}
          rows={3}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          placeholder="Contoh: Kemarin dia menyeduh teh hangat tanpa diminta saat aku sedang lelah bekerja..."
          className={`t-body-md w-full resize-none rounded-2xl bg-surface-container-low p-3.5 text-on-surface shadow-inner outline-none transition-all placeholder:text-text-muted/60 focus:bg-canvas-ivory ${
            invalid ? "ring-2 ring-secondary" : ""
          }`}
        />
        <div className="mt-2 flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-text-muted">
            <Icon name="lock" size={16} />
            <span className="t-label-sm">
              {saved ? "Tersimpan lokal di sesi ini" : "Tersimpan di peramban"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className={`t-body-sm flex min-h-9 items-center gap-1.5 rounded-full px-3.5 font-semibold text-on-primary transition-colors hover:bg-primary ${
              saved ? "bg-primary" : "bg-sage-medium"
            }`}
          >
            <span>Simpan Cuplikan</span>
            <Icon name="check" size={16} />
          </button>
        </div>
      </div>

      {saved && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-2xl bg-sage-tint p-3 text-primary"
        >
          <Icon name="celebration" size={20} className="mt-0.5 shrink-0" />
          <div className="flex flex-col">
            <span className="t-title-sm">Refleksi indah telah tertulis!</span>
            <p className="t-body-sm mt-0.5 text-on-surface-variant">
              Buat akun gratis untuk mengabadikan perjalanan cintamu dan
              membagikannya ke pasangan saat siap.
            </p>
            <Link
              href="/daftar"
              className="t-body-sm mt-2 self-start font-semibold text-primary underline"
            >
              Buat Akun Sekarang →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
