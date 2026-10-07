"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDateId } from "@/data/admin-prompts";
import type { JournalPrompt } from "@/data/journal-prompts";
import { deletePromptJurnal } from "@/lib/admin-actions";
import { Dialog } from "../dialog";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";

/** Tombol hapus prompt dengan dialog peringatan; menghapus prompt beserta semua jawaban pesertanya. */
export function DeletePromptButton({ prompt, responseCount }: { prompt: JournalPrompt; responseCount: number }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const close = () => {
    if (deleting) return;
    setOpen(false);
    setUnderstood(false);
  };

  async function confirm() {
    setDeleting(true);
    const result = await deletePromptJurnal(prompt.id);
    setDeleting(false);
    if (!result.ok) return showToast(result.error);
    setOpen(false);
    setUnderstood(false);
    router.refresh();
    showToast(
      result.data.deletedResponses
        ? `Prompt “${prompt.title}” dan ${result.data.deletedResponses} jawaban peserta dihapus.`
        : `Prompt “${prompt.title}” dihapus.`,
      { tone: "success" },
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="t-label-md flex items-center gap-1.5 rounded-full bg-error-container px-4 py-2 whitespace-nowrap text-error transition-colors hover:bg-error hover:text-on-error"
      >
        <Icon name="delete" size={16} />
        Hapus
      </button>

      <Dialog open={open} onClose={close} eyebrow="Peringatan" title="Hapus Prompt?" size="sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void confirm();
          }}
          className="space-y-4"
        >
          <div className="flex items-start gap-2.5 rounded-2xl bg-error-container p-3.5 text-on-error-container">
            <Icon name="warning" size={20} filled className="mt-0.5 shrink-0 text-error" />
            <p className="t-body-sm leading-snug font-semibold">Tindakan ini permanen dan tidak bisa dibatalkan.</p>
          </div>

          <p className="t-body-md text-on-surface">
            Prompt <span className="font-semibold">“{prompt.title}”</span> (tayang {formatDateId(prompt.date)}) akan dihapus
            bersama:
          </p>
          <ul className="t-body-sm list-disc space-y-1 pl-5 text-on-surface-variant">
            <li>{prompt.questions.length} pertanyaan di dalamnya</li>
            <li>
              {responseCount > 0 ? (
                <>
                  <span className="font-semibold text-error">{responseCount} jawaban peserta</span> beserta isi jurnal,
                  catatan, dan lampiran foto/audio/video-nya
                </>
              ) : (
                "Belum ada jawaban peserta"
              )}
            </li>
            {responseCount > 0 && (
              <li>Entri jurnal peserta pada prompt ini hilang dari riwayat dan kalender mereka</li>
            )}
          </ul>

          {responseCount > 0 && (
            <label className="flex cursor-pointer items-start gap-2.5 select-none">
              <input
                type="checkbox"
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
                className="mt-0.5 size-4 cursor-pointer rounded-md accent-error"
              />
              <span className="t-body-sm text-on-surface">Saya mengerti jawaban {responseCount} peserta akan ikut terhapus.</span>
            </label>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={close}
              disabled={deleting}
              className="t-title-sm rounded-full px-5 py-2.5 text-on-surface-variant transition-colors hover:bg-canvas-ivory"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={deleting || (responseCount > 0 && !understood)}
              className="t-title-sm flex items-center gap-1.5 rounded-full bg-error px-6 py-2.5 text-on-error shadow-md transition-all hover:opacity-90 disabled:opacity-50"
            >
              <Icon name="delete_forever" size={18} />
              {deleting ? "Menghapus..." : "Ya, Hapus Prompt"}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
