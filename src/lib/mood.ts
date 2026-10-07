import { JOURNAL_FEELINGS } from "@/data/member";

/** Satu pilihan Mood Check: emoji + teks yang ditulis admin. */
export type MoodOption = { emoji: string; label: string };

export const DEFAULT_MOODS: readonly MoodOption[] = JOURNAL_FEELINGS;
export const MIN_MOODS = 2;
export const MAX_MOODS = 8;
export const MAX_MOOD_LABEL = 30;

/**
 * Pilihan mood disimpan sebagai teks "😊 Tenang" (emoji, spasi, label) — format yang sama dengan
 * jawaban peserta, jadi jawaban lama tetap terbaca. Pertanyaan mood tanpa pilihan memakai DEFAULT_MOODS.
 */
export const encodeMood = (m: MoodOption) => `${m.emoji} ${m.label}`;

/** Memisah "😊 Tenang" di spasi pertama; tidak memvalidasi (dipakai juga untuk baris form yang belum lengkap). */
export function splitMood(value: string): MoodOption {
  const i = value.indexOf(" ");
  return i < 0 ? { emoji: value, label: "" } : { emoji: value.slice(0, i), label: value.slice(i + 1) };
}

export function parseMood(value: string): MoodOption | null {
  const m = splitMood(value);
  return m.emoji && m.label.trim() ? { emoji: m.emoji, label: m.label.trim() } : null;
}

export function moodOptionsOf(q: { options?: string[] }): readonly MoodOption[] {
  const parsed = (q.options ?? []).flatMap((o) => parseMood(o) ?? []);
  return parsed.length ? parsed : DEFAULT_MOODS;
}

export const hasEmoji = (s: string) => /\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(s);

/** Grapheme (emoji utuh, termasuk ZWJ/bendera) terakhir pada teks; "" bila kosong. */
export function lastGrapheme(text: string): string {
  const clean = text.replace(/\s/g, "");
  if (!clean) return "";
  const parts =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(clean), (s) => s.segment)
      : Array.from(clean);
  return parts.at(-1) ?? "";
}
