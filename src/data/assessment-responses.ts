import { ADMIN_USERS } from "@/data/admin-users";
import { ASSESSMENT_SETS, type AssessmentKind, type AssessmentPart } from "@/data/assessment";

/**
 * Tipe jawaban assessment. `getAssessmentResponses` hanyalah generator data contoh untuk
 * `prisma/seed.ts`; halaman admin membaca dari database.
 * Peserta = pengguna berstatus aktif.
 */
export type AssessmentResponse = {
  userId: string;
  name: string;
  avatar?: string;
  /** Tanggal mengisi (ISO); null bila belum mengisi. */
  answeredAt: string | null;
  /** Nilai 1-5 per id soal. */
  answers: Record<string, number>;
  /** Rata-rata per bagian; null bila belum mengisi. */
  scores: Record<AssessmentPart, number | null>;
};

const average = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;

export function getAssessmentResponses(kind: AssessmentKind): AssessmentResponse[] {
  const items = ASSESSMENT_SETS[kind];
  const participants = ADMIN_USERS.filter((u) => u.status === "active");

  return participants.map((u, i) => {
    // Pre: hampir semua sudah mengisi. Post: baru sebagian (sesi belum selesai).
    const answered = kind === "pre" ? i % 5 !== 4 : i % 2 === 0;
    const answers: Record<string, number> = {};
    if (answered) {
      items.forEach((it, qi) => {
        const base = kind === "pre" ? 2 : 3;
        answers[it.id] = Math.min(5, base + ((i * 2 + qi * 3) % 3));
      });
    }
    const byPart = (part: AssessmentPart) =>
      average(items.filter((it) => it.part === part).map((it) => answers[it.id]).filter(Boolean));

    return {
      userId: u.id,
      name: u.name,
      avatar: u.avatar,
      answeredAt: answered
        ? kind === "pre"
          ? `2026-09-${String(24 + (i % 3)).padStart(2, "0")}`
          : `2026-10-0${1 + (i % 4)}`
        : null,
      answers,
      scores: { mindset: byPart("mindset"), habit: byPart("habit") },
    };
  });
}
