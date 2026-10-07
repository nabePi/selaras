"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Course, Participant } from "@/data/courses";
import { enrollParticipant, getCourseEnrollments, unenrollParticipant } from "@/lib/admin-actions";
import { Dialog, fieldClass } from "../dialog";
import { Icon } from "../icon";
import { useToast } from "../toast-provider";

/** Dialog untuk mendaftarkan peserta ke kelas dan mengeluarkannya kembali. */
export function CourseParticipantsButton({ course }: { course: Course }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [enrolled, setEnrolled] = useState<Participant[]>([]);
  const [available, setAvailable] = useState<Participant[]>([]);
  const [query, setQuery] = useState("");

  async function show() {
    setOpen(true);
    setLoading(true);
    const result = await getCourseEnrollments(course.id);
    setLoading(false);
    if (!result.ok) return showToast(result.error);
    setEnrolled(result.data.enrolled);
    setAvailable(result.data.available);
  }

  async function change(userId: number, action: typeof enrollParticipant) {
    setBusy(userId);
    const result = await action(course.id, userId);
    setBusy(null);
    if (!result.ok) return showToast(result.error);
    setEnrolled(result.data.enrolled);
    setAvailable(result.data.available);
    router.refresh();
  }

  const q = query.trim().toLowerCase();
  const matches = available.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || p.whatsapp.includes(q) || (p.email ?? "").toLowerCase().includes(q),
  );

  return (
    <>
      <button
        type="button"
        onClick={() => void show()}
        className="t-label-md flex items-center gap-1.5 rounded-full bg-sage-tint px-4 py-2 text-primary transition-colors hover:bg-primary hover:text-on-primary"
      >
        <Icon name="group_add" size={16} />
        Peserta ({course.enrolledCount})
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} eyebrow={course.title} title="Peserta Kelas" size="lg">
        <div className="space-y-5">
          <section className="space-y-2">
            <h3 className="t-title-sm text-on-surface">Terdaftar ({enrolled.length})</h3>
            {loading ? (
              <p className="t-body-sm text-text-muted">Memuat…</p>
            ) : enrolled.length === 0 ? (
              <p className="t-body-sm text-text-muted">Belum ada peserta di kelas ini.</p>
            ) : (
              <ul className="space-y-1.5">
                {enrolled.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-surface-container-low px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="t-body-sm truncate font-semibold text-on-surface">{p.name}</p>
                      <p className="t-label-sm truncate text-text-muted">{p.email ?? p.whatsapp}</p>
                    </div>
                    <button
                      type="button"
                      disabled={busy === p.id}
                      onClick={() => void change(p.id, unenrollParticipant)}
                      className="t-label-md rounded-full px-3 py-1.5 text-error transition-colors hover:bg-error-container disabled:opacity-50"
                    >
                      Keluarkan
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-2">
            <h3 className="t-title-sm text-on-surface">Tambah peserta</h3>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama, email, atau WhatsApp…"
              aria-label="Cari peserta"
              className={`${fieldClass} border border-outline-variant`}
            />
            {!loading && matches.length === 0 ? (
              <p className="t-body-sm text-text-muted">
                {available.length === 0 ? "Semua peserta aktif sudah terdaftar." : "Tidak ada peserta yang cocok."}
              </p>
            ) : (
              <ul className="max-h-64 space-y-1.5 overflow-y-auto">
                {matches.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-canvas-cream px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="t-body-sm truncate font-semibold text-on-surface">{p.name}</p>
                      <p className="t-label-sm truncate text-text-muted">{p.email ?? p.whatsapp}</p>
                    </div>
                    <button
                      type="button"
                      disabled={busy === p.id}
                      onClick={() => void change(p.id, enrollParticipant)}
                      className="t-label-md flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-on-primary transition-colors hover:bg-primary-container disabled:opacity-50"
                    >
                      <Icon name="add" size={14} />
                      Tambah
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </Dialog>
    </>
  );
}
