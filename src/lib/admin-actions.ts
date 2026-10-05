/**
 * SIMULASI — belum ada backend.
 *
 * Setiap aksi admin yang seharusnya mengubah data di server atau mengirim pesan
 * (WhatsApp, PDF, dll.) melewati fungsi di bawah. Saat API tersedia, ganti isi fungsi
 * ini dengan panggilan sungguhan; UI sudah menangani hasil `{ ok: false, error }`
 * dan keadaan loading. Perubahan di layar saat ini hanya hidup di memori halaman.
 */

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
export const activateUser = (id: string) => (void id, simulate(700));
export const resetUserPassword = (id: string) => (void id, simulate(700));
export const addCouple = (input: object) => (void input, simulate(800));
export const sendNudge = (target: NudgeTarget, message?: string) => (void target, void message, simulate(700));
export const saveCoachNote = (coupleId: string, note: string) => (void coupleId, void note, simulate(500));
export const savePromptJurnal = (input: object) => (void input, simulate(800));
export const saveCurriculum = (input: object) => (void input, simulate(900));
export const saveClosingMessage = (message: string) => (void message, simulate(500));
export const saveQuestion = (input: object) => (void input, simulate(500));
export const archiveQuestion = (id: string) => (void id, simulate(400));
export const rescheduleSession = (sessionId: string, input: object) => (void sessionId, void input, simulate(600));
export const finalizeCoachNote = (coupleId: string, note: string) => (void coupleId, void note, simulate(500));
export const saveAllCoachNotes = (count: number) => (void count, simulate(1000));
export const saveAssessmentItem = (kind: string, input: object) => (void kind, void input, simulate(500));
export const deleteAssessmentItem = (kind: string, id: string) => (void kind, void id, simulate(400));
