"use client";

import { Icon } from "../icon";
import { useToast } from "../toast-provider";

/** Password default yang tampil sekali, bisa disalin admin untuk disampaikan lewat WhatsApp. */
export function DefaultPasswordResult({
  intro,
  whatsapp,
  password,
  onClose,
}: {
  intro: React.ReactNode;
  whatsapp: string;
  password: string;
  onClose: () => void;
}) {
  const { showToast } = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(password);
      showToast("Password default disalin.", { tone: "success" });
    } catch {
      showToast("Tidak bisa menyalin otomatis. Salin manual dari kotak di atas.");
    }
  }

  return (
    <div className="space-y-4">
      <p className="t-body-md text-text-muted">
        {intro} Sampaikan password default ini lewat WhatsApp ke {whatsapp}. Password ini hanya ditampilkan sekali.
      </p>
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-canvas-ivory px-4 py-3">
        <code className="t-title-md tracking-wider text-on-surface select-all">{password}</code>
        <button
          type="button"
          onClick={() => void copy()}
          className="t-label-md flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-on-surface transition-colors hover:bg-surface-container"
        >
          <Icon name="content_copy" size={15} />
          Salin
        </button>
      </div>
      <div className="flex items-start gap-2.5 rounded-2xl bg-sage-tint p-3.5">
        <Icon name="info" size={18} className="mt-0.5 shrink-0 text-primary" />
        <p className="t-body-sm leading-snug text-primary">
          Saat masuk dengan nomor WhatsApp dan password ini, peserta diminta membuat password baru lalu masuk kembali.
        </p>
      </div>
      <div className="flex justify-end pt-2">
        <button type="button" onClick={onClose} className="t-title-sm rounded-full bg-primary px-6 py-2.5 text-on-primary shadow-md hover:bg-primary-container">
          Selesai
        </button>
      </div>
    </div>
  );
}
