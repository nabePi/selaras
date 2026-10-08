/**
 * Aksi admin dari komponen client.
 *
 * Aksi untuk Users, Prompt Jurnal, dan Assessment memanggil API sungguhan (`/api/admin/*`).
 * Sisanya (peserta/kelas/nudge/catatan coach) masih SIMULASI — belum ada backend-nya; ganti
 * isinya saat API tersedia. UI menangani hasil `{ ok: false, error }` dan keadaan loading.
 */
import type { BlogNode, BlogPostFull } from "@/lib/blog-content";
import type { AssessmentItem, AssessmentKind } from "@/data/assessment";
import type { Course, Participant, SessionMode } from "@/data/courses";
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
  questions: Pick<PromptQuestion, "type" | "label" | "options" | "required" | "audience" | "scaleMax">[];
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

type FilePayload = { key: string; name: string; size: number };

export type CoursePayload = {
  title: string;
  description: string;
  posters: FilePayload[];
  sessions: {
    title: string;
    date: string;
    time: string;
    endTime: string;
    mode: SessionMode;
    meetingUrl: string;
    locationName: string;
    mapsUrl: string;
    instructorName: string;
    instructorBio: string;
    instructorPhoto: FilePayload | null;
    recording: FilePayload | null;
    documents: FilePayload[];
  }[];
};

/** Tanpa `id` membuat kelas baru; dengan `id` mengganti isi kelas (termasuk seluruh sesinya). */
export const saveCourse = (input: CoursePayload, id?: string) =>
  id ? api<Course>(`/api/admin/courses/${id}`, "PATCH", input) : api<Course>("/api/admin/courses", "POST", input);

/** Menghapus kelas beserta semua sesi dan berkasnya (tidak bisa dibatalkan). */
export const deleteCourse = (id: string) => api<{ deletedFiles: number }>(`/api/admin/courses/${id}`, "DELETE");

type Enrollments = { enrolled: Participant[]; available: Participant[] };

export const getCourseEnrollments = (courseId: string) =>
  api<Enrollments>(`/api/admin/courses/${courseId}/enrollments`, "GET");
export const enrollParticipant = (courseId: string, userId: number) =>
  api<Enrollments>(`/api/admin/courses/${courseId}/enrollments`, "POST", { userId });
export const unenrollParticipant = (courseId: string, userId: number) =>
  api<Enrollments>(`/api/admin/courses/${courseId}/enrollments/${userId}`, "DELETE");

export type BlogPayload = {
  title: string;
  excerpt: string;
  cover: { key: string } | null;
  content: BlogNode;
  tags: string[];
  status: "DRAFT" | "PUBLISHED";
  authorMode: "account" | "manual";
  authorName: string;
  authorBio: string;
  authorPhoto: { key: string } | null;
};

/** Tanpa `id` membuat artikel baru; dengan `id` memperbarui artikel. */
export const saveBlogPost = (input: BlogPayload, id?: string) =>
  id ? api<BlogPostFull>(`/api/admin/blog/${id}`, "PATCH", input) : api<BlogPostFull>("/api/admin/blog", "POST", input);

export const deleteBlogPost = (id: string) => api<{ deletedFiles: number }>(`/api/admin/blog/${id}`, "DELETE");
export const deleteBlogComment = (id: string) => api<{ deleted: true }>(`/api/admin/blog/comments/${id}`, "DELETE");
