"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Course } from "@/data/courses";
import { deleteCourse } from "@/lib/admin-actions";
import { Dialog } from "../dialog";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";

/** Tombol hapus kelas dengan dialog peringatan; ikut menghapus semua sesi dan berkasnya. */
export function DeleteCourseButton({ course }: { course: Course }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function confirm() {
    setDeleting(true);
    const result = await deleteCourse(course.id);
    setDeleting(false);
    if (!result.ok) return showToast(result.error);
    setOpen(false);
    router.refresh();
    showToast(`Kelas “${course.title}” dihapus.`, { tone: "success" });
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

      <Dialog open={open} onClose={() => !deleting && setOpen(false)} eyebrow="Peringatan" title="Hapus Kelas?" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-2xl bg-error-container p-3.5 text-on-error-container">
            <Icon name="warning" size={20} filled className="mt-0.5 shrink-0 text-error" />
            <p className="t-body-sm leading-snug font-semibold">Tindakan ini permanen dan tidak bisa dibatalkan.</p>
          </div>
          <p className="t-body-md text-on-surface">
            Kelas <span className="font-semibold">“{course.title}”</span> akan dihapus bersama {course.sessions.length} sesi,
            rekaman video, dokumen, dan poster-posternya.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={deleting}
              className="t-title-sm rounded-full px-5 py-2.5 text-on-surface-variant transition-colors hover:bg-canvas-ivory"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => void confirm()}
              disabled={deleting}
              className="t-title-sm flex items-center gap-1.5 rounded-full bg-error px-6 py-2.5 text-on-error shadow-md transition-all hover:opacity-90 disabled:opacity-50"
            >
              <Icon name="delete_forever" size={18} />
              {deleting ? "Menghapus..." : "Ya, Hapus Kelas"}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
