import { z } from "zod";

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
        label: text(5, 300, "Tulis pertanyaan minimal 5 karakter."),
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
