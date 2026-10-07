import type { ResponseAttachment } from "@/data/prompt-responses";

/** Entri jurnal milik peserta sebagaimana ditampilkan di /journal. */
export type MemberEntry = {
  id: string;
  /** ISO (yyyy-mm-dd) */
  date: string;
  dateLabel: string;
  /** Nama hari, mis. "Selasa" */
  dayLabel: string;
  /** Judul prompt hari itu; null untuk jurnal bebas. */
  promptTitle: string | null;
  /** Subjudul prompt (bila ada); null untuk jurnal bebas atau prompt tanpa subjudul. */
  promptSubtitle: string | null;
  excerpt: string;
  /** Teks untuk ringkasan/kartu: Catatan Rasa, atau jawaban pertama bila catatan kosong. */
  content: string;
  /** Catatan Rasa yang benar-benar ditulis peserta (kosong untuk entri berprompt tanpa catatan). */
  note: string;
  feeling: { emoji: string; label: string } | null;
  shared: boolean;
  answers: { label: string; type: string; value: string }[];
  attachments: ResponseAttachment[];
};

export type WeekDayStatus = "done" | "pending" | "missed" | "upcoming" | "empty";

/** Jawaban per id pertanyaan: teks, angka skala, opsi, atau label mood. */
export type AnswerMap = Record<string, string | number>;

export type SubmitEntryInput = {
  content: string;
  shared: boolean;
  answers: AnswerMap;
  attachments: { keep: number[]; added: { key: string; name: string }[] };
};
