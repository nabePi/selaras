import "server-only";
import { z } from "zod";
import { db } from "@/lib/db";
import { notFound } from "@/lib/server/errors";

export type Profile = {
  name: string;
  email: string;
  whatsapp: string;
  /** URL atau data URL gambar; null bila belum punya foto. */
  avatar: string | null;
  skills: string[];
  /** Kegiatan sehari-hari / kesibukan (teks bebas). */
  activities: string;
};

export const MAX_SKILLS = 15;
const MAX_SKILL_LENGTH = 30;
export const MAX_ACTIVITIES = 500;
const MAX_AVATAR_CHARS = 400_000;

const profileSchema = z.object({
  name: z
    .string()
    .transform((v) => v.trim().replace(/\s+/g, " "))
    .pipe(z.string().min(2, "Nama lengkap minimal 2 karakter.").max(80, "Nama lengkap maksimal 80 karakter."))
    .optional(),
  avatar: z
    .string()
    .max(MAX_AVATAR_CHARS, "Ukuran foto terlalu besar.")
    .regex(/^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/, "Format foto tidak didukung.")
    .optional(),
  activities: z
    .string()
    .transform((v) => v.replace(/\r\n/g, "\n").trim())
    .pipe(z.string().max(MAX_ACTIVITIES, `Maksimal ${MAX_ACTIVITIES} karakter.`))
    .optional(),
  skills: z
    .array(z.string())
    .max(MAX_SKILLS, `Maksimal ${MAX_SKILLS} keahlian.`)
    .transform((list) => {
      const seen = new Set<string>();
      return list
        .map((s) => s.trim().replace(/\s+/g, " ").slice(0, MAX_SKILL_LENGTH))
        .filter((s) => s && !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()));
    })
    .optional(),
});

const select = { name: true, email: true, whatsapp: true, avatarUrl: true, skills: true, activities: true } as const;

function toProfile(u: {
  name: string;
  email: string;
  whatsapp: string;
  avatarUrl: string | null;
  skills: string[];
  activities: string;
}): Profile {
  return { name: u.name, email: u.email, whatsapp: u.whatsapp, avatar: u.avatarUrl, skills: u.skills, activities: u.activities };
}

export async function getProfile(userId: number): Promise<Profile> {
  const user = await db.user.findUnique({ where: { id: userId }, select });
  if (!user) throw notFound("Akun");
  return toProfile(user);
}

/** Memperbarui sebagian profil (nama, foto, keahlian); field yang tidak dikirim tidak berubah. */
export async function updateProfile(userId: number, body: unknown): Promise<Profile> {
  const input = profileSchema.parse(body);
  const user = await db.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.avatar !== undefined && { avatarUrl: input.avatar }),
      ...(input.skills !== undefined && { skills: input.skills }),
      ...(input.activities !== undefined && { activities: input.activities }),
    },
    select,
  });
  return toProfile(user);
}
