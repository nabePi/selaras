import { ADMIN_USERS } from "@/data/admin-users";
import { JOURNAL_FEELINGS } from "@/data/member";
import type { JournalPrompt, QuestionType } from "@/data/journal-prompts";

/**
 * Data contoh jawaban peserta per prompt. Static dan deterministik: ganti dengan API.
 * Peserta = pengguna berstatus aktif.
 */
export type ResponseAnswer = {
  label: string;
  type: QuestionType;
  value: string;
};

/** Lampiran yang diunggah peserta di jurnal. Static: video memakai berkas contoh. */
export type ResponseAttachment =
  | { kind: "image"; title: string; src: string }
  | { kind: "audio"; title: string; meta: string }
  | { kind: "video"; title: string; src: string; poster: string };

export type PromptResponse = {
  userId: string;
  name: string;
  avatar?: string;
  /** Jam mengisi (WIB); null bila belum mengisi. */
  answeredAt: string | null;
  answers: ResponseAnswer[];
  attachments: ResponseAttachment[];
};

const TEXT_ANSWERS = [
  "Aku merasa lebih tenang karena kami sempat mengobrol santai setelah makan malam, tanpa gawai.",
  "Pasanganku diam-diam membuatkan teh hangat saat aku lelah. Hal kecil, tapi sangat berarti.",
  "Masih sulit menyampaikan perasaan tanpa terdengar menyalahkan. Aku ingin belajar lebih lembut.",
  "Alhamdulillah, kami bisa saling mendengarkan lebih lama hari ini. Semoga bisa terus konsisten.",
  "Aku sadar sering menyela saat dia bercerita. Besok ingin mencoba menahan diri dan bertanya dulu.",
  "Rasanya campur aduk, tapi aku bersyukur kami masih mau duduk bersama dan membicarakannya.",
];

function answerFor(
  q: JournalPrompt["questions"][number],
  userIndex: number,
  questionIndex: number,
): ResponseAnswer {
  const seed = userIndex * 3 + questionIndex * 2;
  switch (q.type) {
    case "scale":
      return { label: q.label, type: q.type, value: `${(seed % 10) + 1} / 10` };
    case "choice": {
      const options = q.options?.filter(Boolean) ?? [];
      return {
        label: q.label,
        type: q.type,
        value: options[seed % options.length] ?? "-",
      };
    }
    case "mood": {
      const m = JOURNAL_FEELINGS[seed % JOURNAL_FEELINGS.length];
      return { label: q.label, type: q.type, value: `${m.emoji} ${m.label}` };
    }
    default:
      return {
        label: q.label,
        type: q.type,
        value: TEXT_ANSWERS[seed % TEXT_ANSWERS.length],
      };
  }
}

function attachmentsFor(seed: number): ResponseAttachment[] {
  const list: ResponseAttachment[] = [];
  if (seed % 2 === 0)
    list.push({
      kind: "image",
      title: "Foto momen hari ini",
      src: "/images/entry-journal.jpg",
    });
  if (seed % 3 === 0)
    list.push({
      kind: "audio",
      title: "Voice note refleksi",
      meta: "Durasi 1:12 menit",
    });
  if (seed % 5 === 0)
    list.push({
      kind: "video",
      title: "Video cerita singkat",
      src: "/videos/selaras-reels.mp4",
      poster: "/videos/selaras-reels-poster.jpg",
    });
  return list;
}

export function getPromptResponses(prompt: JournalPrompt): PromptResponse[] {
  const participants = ADMIN_USERS.filter((u) => u.status === "active");
  // Salah satu dari tiap empat peserta belum mengisi (variasi per prompt).
  const offset = Number(prompt.id.replace(/\D/g, "")) || 0;

  return participants.map((u, i) => {
    const answered = (i + offset) % 4 !== 3;
    return {
      userId: u.id,
      name: u.name,
      avatar: u.avatar,
      answeredAt: answered
        ? `${String(5 + ((i * 3 + offset) % 15)).padStart(2, "0")}.${String((i * 17) % 60).padStart(2, "0")} WIB`
        : null,
      attachments: answered ? attachmentsFor(i + offset) : [],
      answers: answered
        ? prompt.questions.map((q, qi) => answerFor(q, i + offset, qi))
        : [],
    };
  });
}

export function getPromptResponse(prompt: JournalPrompt, userId: string) {
  return getPromptResponses(prompt).find((r) => r.userId === userId);
}
