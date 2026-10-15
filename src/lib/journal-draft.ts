import type { AnswerMap } from "./journal-types";

export type JournalDraft = { text: string; shared: boolean; answers: AnswerMap };

export function journalDraftKey(userId: number, date: string, promptId: string | null) {
  return `selaras:journal-draft:v1:${userId}:${date}:${promptId ?? "free"}`;
}

export function readJournalDraft(storage: Pick<Storage, "getItem">, key: string): JournalDraft | null {
  const raw = storage.getItem(key);
  if (raw === null) return null;
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object") throw new Error("Invalid draft");
  const draft = value as Record<string, unknown>;
  if (
    typeof draft.text !== "string" ||
    typeof draft.shared !== "boolean" ||
    !draft.answers || typeof draft.answers !== "object" || Array.isArray(draft.answers) ||
    !Object.values(draft.answers).every((answer) => typeof answer === "string" || (typeof answer === "number" && Number.isFinite(answer)))
  ) throw new Error("Invalid draft");
  return { text: draft.text, shared: draft.shared, answers: draft.answers as AnswerMap };
}
