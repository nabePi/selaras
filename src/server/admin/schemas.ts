import { z } from "zod";

import { normalizeRich, richToPlain } from "@/lib/rich-text";
import { hasEmoji, MAX_MOOD_LABEL, MAX_MOODS, MIN_MOODS, parseMood } from "@/lib/mood";

const text = (min: number, max: number, minMsg: string) =>
  z.string().trim().min(min, minMsg).max(max);

export const promptSchema = z.object({
  title: text(3, 80, "Isi judul minimal 3 karakter."),
  subtitle: z.string().trim().max(140).default(""),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pilih tanggal tayang.").refine(
    (v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)),
    "Tanggal tidak valid.",
  ),
  questions: z
    .array(
      z.object({
        type: z.enum(["text", "scale", "choice", "mood"]),
        // Teks pertanyaan boleh berformat (tebal/miring/garis bawah/kutipan); panjang dihitung dari teks polosnya.
        label: z
          .string()
          .max(3000)
          .transform(normalizeRich)
          .refine((v) => richToPlain(v).length >= 5, "Tulis pertanyaan minimal 5 karakter.")
          .refine((v) => richToPlain(v).length <= 300, "Pertanyaan maksimal 300 karakter."),
        required: z.boolean().default(true),
        audience: z.enum(["semua", "menikah", "belum-menikah"]).default("semua"),
        options: z.array(z.string().trim().max(120)).max(12).optional(),
      }),
    )
    .min(1, "Tambahkan minimal satu pertanyaan.")
    .max(30)
    .superRefine((qs, ctx) => {
      qs.forEach((q, i) => {
        if (q.type === "choice" && (q.options ?? []).filter(Boolean).length < 2)
          ctx.addIssue({
            code: "custom",
            path: [i, "options"],
            message: "Opsi ganda butuh minimal 2 pilihan yang terisi.",
          });
        // Mood Check: tanpa pilihan = lima perasaan bawaan; bila diisi, tiap pilihan = emoji + teks.
        if (q.type === "mood") {
          const moods = (q.options ?? []).map((o) => o.trim()).filter(Boolean);
          const parsed = moods.map(parseMood);
          const labels = parsed.flatMap((m) => m?.label.toLowerCase() ?? []);
          const msg =
            moods.length === 0
              ? null
              : moods.length < MIN_MOODS || moods.length > MAX_MOODS
                ? `Mood Check butuh ${MIN_MOODS}-${MAX_MOODS} pilihan.`
                : parsed.some((m) => !m || !hasEmoji(m.emoji) || m.label.length > MAX_MOOD_LABEL)
                  ? `Tiap pilihan butuh emoji dan teks (maks ${MAX_MOOD_LABEL} karakter).`
                  : new Set(labels).size !== labels.length
                    ? "Teks pilihan mood tidak boleh sama."
                    : null;
          if (msg) ctx.addIssue({ code: "custom", path: [i, "options"], message: msg });
        }
      });
    }),
});
export type PromptInput = z.infer<typeof promptSchema>;

export const assessmentItemSchema = z.object({
  part: z.enum(["mindset", "habit"]),
  dimension: text(3, 50, "Isi nama dimensi."),
  text: text(10, 400, "Tulis pernyataan minimal 10 karakter."),
});

export const memberLoginSchema = z.object({
  identifier: z.string().trim().min(1, "Isi email atau nomor WhatsApp.").max(200),
  password: z.string().min(1, "Isi kata sandi.").max(200),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email tidak valid."),
  password: z.string().min(1, "Isi password.").max(200),
});

export const createUserSchema = z.object({
  name: z
    .string()
    .transform((v) => v.trim().replace(/\s+/g, " "))
    .pipe(z.string().min(2, "Nama lengkap minimal 2 karakter.").max(80, "Nama lengkap maksimal 80 karakter.")),
  whatsapp: z.string().trim().min(1, "Isi nomor WhatsApp.").max(30),
});

export const changePasswordSchema = z.object({
  identifier: z.string().trim().min(1).max(200),
  currentPassword: z.string().min(1, "Isi password sementara.").max(200),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter.").max(200),
});
