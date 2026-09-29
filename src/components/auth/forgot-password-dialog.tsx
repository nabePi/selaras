"use client";

import { useEffect, useId, useRef, useState } from "react";
import { requestPasswordReset } from "@/lib/auth";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultTarget: string;
};

export function ForgotPasswordDialog({ open, onClose, defaultTarget }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLInputElement>("input")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // Klik di area gelap (di luar kartu) menutup dialog.
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-0 size-full max-h-none max-w-none items-end justify-center bg-transparent p-4 backdrop:bg-on-surface/40 backdrop:backdrop-blur-sm open:flex sm:items-center"
    >
      {open && <DialogCard titleId={titleId} defaultTarget={defaultTarget} onClose={onClose} />}
    </dialog>
  );
}

function DialogCard({
  titleId,
  defaultTarget,
  onClose,
}: {
  titleId: string;
  defaultTarget: string;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const [target, setTarget] = useState(defaultTarget);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = target.trim();
    if (!value) {
      setError("Mohon masukkan email atau WhatsApp pemulihan Anda.");
      return;
    }
    setSending(true);
    const result = await requestPasswordReset(value);
    setSending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
    showToast(`Tautan reset telah terkirim ke ${value}`, { tone: "success", duration: 3200 });
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-surface p-5 shadow-2xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-sage-tint text-primary">
            <Icon name="key" size={18} />
          </span>
          <h2 id={titleId} className="t-title-md text-on-surface">
            Atur Ulang Sandi
          </h2>
        </div>
        <button
          type="button"
          aria-label="Tutup"
          onClick={onClose}
          className="rounded-full p-1 text-text-muted hover:text-on-surface"
        >
          <Icon name="close" size={20} />
        </button>
      </div>

      <p className="t-body-sm text-text-muted">
        Tautan pemulihan kata sandi akan dikirimkan ke WhatsApp atau email yang terhubung dengan
        akun Anda.
      </p>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="recoveryTarget" className="sr-only">
          Email atau WhatsApp
        </label>
        <input
          id="recoveryTarget"
          value={target}
          onChange={(e) => {
            setTarget(e.target.value);
            setError("");
          }}
          autoComplete="username"
          placeholder="0812xxxxxxx atau email Anda"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "recoveryTarget-error" : undefined}
          className="t-body-lg w-full rounded-xl bg-canvas-ivory px-4 py-3 text-on-surface shadow-inner outline-none placeholder:text-text-muted/60 focus:bg-canvas-cream focus-visible:ring-2 focus-visible:ring-sage-medium"
        />
        {error && (
          <p id="recoveryTarget-error" role="alert" className="t-body-sm pl-1 text-error">
            {error}
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="t-title-sm flex-1 rounded-full bg-canvas-ivory px-3 py-2.5 text-on-surface transition-all hover:bg-canvas-sand/40"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={sending}
          className="t-title-sm flex-1 rounded-full bg-primary px-3 py-2.5 text-on-primary shadow-sm transition-all hover:opacity-95 disabled:opacity-80"
        >
          {sending ? "Mengirim..." : "Kirim Tautan"}
        </button>
      </div>
    </form>
  );
}
