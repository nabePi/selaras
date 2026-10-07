/**
 * Aksi admin dari komponen client.
 *
 * Aksi untuk Users, Prompt Jurnal, dan Assessment memanggil API sungguhan (`/api/admin/*`).
 * Sisanya (peserta/kelas/nudge/catatan coach) masih SIMULASI — belum ada backend-nya; ganti
 * isinya saat API tersedia. UI menangani hasil `{ ok: false, error }` dan keadaan loading.
 */
import type { AssessmentItem, AssessmentKind } from "@/data/assessment";
import type { JournalPrompt, PromptQuestion } from "@/data/journal-prompts";
import { api } from "@/lib/api-client";

export type ActionResult = { ok: true } | { ok: false; error: string };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function simulate(ms = 600): Promise<ActionResult> {
  await wait(ms);
  return { ok: true };
}

export type NudgeTarget =
  | { kind: "couple"; id: string; name: string }
  | { kind: "audience"; audience: string; count: number };

export const activateCouple = (id: string) => (void id, simulate(700));

// ---- API sungguhan ----

export const activateUser = (id: string) => api<{ id: string }>(`/api/admin/users/${id}/activate`, "POST");
export type CreatedUser = { id: string; name: string; whatsapp: string; defaultPassword: string };
export const createUser = (input: { name: string; whatsapp: string }) => api<CreatedUser>("/api/admin/users", "POST", input);
export const resetUserPassword = (id: string) => api<{ id: string }>(`/api/admin/users/${id}/reset-password`, "POST");

export type PromptPayload = {
  title: string;
  subtitle: string;
  date: string;
  questions: Pick<PromptQuestion, "type" | "label" | "options" | "required" | "audience">[];
};

/** Menghapus prompt beserta semua jawaban pesertanya (tidak bisa dibatalkan). */
export const deletePromptJurnal = (id: string) =>
  api<{ deletedResponses: number }>(`/api/admin/prompts/${id}`, "DELETE");

/** Tanpa `id` membuat prompt baru; dengan `id` mengubah prompt yang belum terbit. */
export const savePromptJurnal = (input: PromptPayload, id?: string) =>
  id
    ? api<JournalPrompt>(`/api/admin/prompts/${id}`, "PATCH", input)
    : api<JournalPrompt>("/api/admin/prompts", "POST", input);

export const setAssessmentVisibility = (kind: AssessmentKind, visible: boolean) =>
  api<{ visible: boolean }>(`/api/admin/assessment/${kind}/visibility`, "PATCH", { visible });

export type AssessmentItemPayload = Omit<AssessmentItem, "id">;

export const saveAssessmentItem = (kind: AssessmentKind, input: AssessmentItemPayload & { id?: string }) => {
  const { id, ...body } = input;
  return id
    ? api<AssessmentItem>(`/api/admin/assessment/${kind}/items/${id}`, "PATCH", body)
    : api<AssessmentItem>(`/api/admin/assessment/${kind}/items`, "POST", body);
};
export const deleteAssessmentItem = (kind: AssessmentKind, id: string) =>
  api<{ id: string }>(`/api/admin/assessment/${kind}/items/${id}`, "DELETE");

// ---- Simulasi (belum ada backend) ----
export const addCouple = (input: object) => (void input, simulate(800));
export const sendNudge = (target: NudgeTarget, message?: string) => (void target, void message, simulate(700));
export const saveCoachNote = (coupleId: string, note: string) => (void coupleId, void note, simulate(500));
export const saveCurriculum = (input: object) => (void input, simulate(900));
export const saveClosingMessage = (message: string) => (void message, simulate(500));
export const saveQuestion = (input: object) => (void input, simulate(500));
export const archiveQuestion = (id: string) => (void id, simulate(400));
export const rescheduleSession = (sessionId: string, input: object) => (void sessionId, void input, simulate(600));
export const finalizeCoachNote = (coupleId: string, note: string) => (void coupleId, void note, simulate(500));
export const saveAllCoachNotes = (count: number) => (void count, simulate(1000));
