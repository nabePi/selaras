"use client";

import { useEffect, useId, useRef } from "react";
import { Icon } from "./icon";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  /** Lebar kartu; default "md" (max-w-lg) */
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
};

const SIZES = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" } as const;

/**
 * Modal berbasis <dialog> bawaan: focus trap, Esc, dan backdrop ditangani peramban.
 * Konten hanya dirender saat terbuka, jadi state form di dalamnya selalu segar.
 */
export function Dialog({ open, onClose, title, eyebrow, size = "md", children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>("[data-autofocus], input, textarea, select")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-0 size-full max-h-none max-w-none items-center justify-center bg-transparent p-4 backdrop:bg-on-surface/40 backdrop:backdrop-blur-sm open:flex"
    >
      {open && (
        <div
          className={`max-h-[90dvh] w-full ${SIZES[size]} space-y-5 overflow-y-auto rounded-3xl bg-surface p-6 shadow-2xl sm:p-7`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              {eyebrow && (
                <span className="t-label-sm font-semibold tracking-wider text-primary uppercase">
                  {eyebrow}
                </span>
              )}
              <h2 id={titleId} className="t-headline-sm text-on-surface">
                {title}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Tutup"
              onClick={onClose}
              className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-canvas-ivory"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

const FIELD =
  "t-body-sm w-full rounded-2xl bg-canvas-ivory px-4 py-2.5 text-on-surface outline-none placeholder:text-text-muted/60 focus-visible:ring-2 focus-visible:ring-sage-medium";

export const fieldClass = FIELD;

export function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="t-label-sm flex items-center justify-between font-normal text-text-muted">
      <span>{children}</span>
      {hint}
    </label>
  );
}

export function DialogActions({
  onCancel,
  submitLabel,
  submitting = false,
  submitDisabled = false,
}: {
  onCancel: () => void;
  submitLabel: string;
  submitting?: boolean;
  submitDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="t-title-sm rounded-full px-5 py-2.5 text-on-surface-variant transition-colors hover:bg-canvas-ivory"
      >
        Batal
      </button>
      <button
        type="submit"
        disabled={submitting || submitDisabled}
        className="t-title-sm rounded-full bg-primary px-6 py-2.5 text-on-primary shadow-md transition-all hover:bg-primary-container disabled:opacity-70"
      >
        {submitting ? "Memproses..." : submitLabel}
      </button>
    </div>
  );
}
