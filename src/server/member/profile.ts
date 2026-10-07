import "server-only";
import { z } from "zod";
import { db } from "@/lib/db";
import { ApiError, notFound } from "@/lib/server/errors";
import { MARITAL_STATUSES, type MaritalStatus } from "@/data/marital-status";
import { isEmail } from "@/lib/validation";
import { avatarSrc, deleteStoredAvatar, verifyAvatarKey } from "@/server/avatar";

export type Profile = {
  name: string;
  email: string | null;
  whatsapp: string;
  /** URL gambar (URL baca bertanda tangan dari R2, atau data URL lama); null bila belum punya foto. */
  avatar: string | null;
  skills: string[];
  /** Kegiatan sehari-hari / kesibukan (teks bebas). */
  activities: string;
  /** Status pernikahan; null bila belum diisi. */
  maritalStatus: MaritalStatus | null;
};

type DbMaritalStatus = "MENIKAH" | "BELUM_MENIKAH" | "CERAI_HIDUP" | "CERAI_MATI";
const MARITAL_OUT = { MENIKAH: "menikah", BELUM_MENIKAH: "belum-menikah", CERAI_HIDUP: "cerai-hidup", CERAI_MATI: "cerai-mati" } as const;
const MARITAL_IN = { menikah: "MENIKAH", "belum-menikah": "BELUM_MENIKAH", "cerai-hidup": "CERAI_HIDUP", "cerai-mati": "CERAI_MATI" } as const;

export const MAX_SKILLS = 15;
const MAX_SKILL_LENGTH = 30;
export const MAX_ACTIVITIES = 500;

const profileSchema = z.object({
  name: z
    .string()
    .transform((v) => v.trim().replace(/\s+/g, " "))
    .pipe(z.string().min(2, "Nama lengkap minimal 2 karakter.").max(80, "Nama lengkap maksimal 80 karakter."))
    .optional(),
  /** Kosong menghapus email. */
  email: z
    .string()
    .transform((v) => v.trim().toLowerCase())
    .pipe(z.string().max(120, "Email maksimal 120 karakter.").refine((v) => v === "" || isEmail(v), "Format email tidak valid."))
    .optional(),
  /** Key R2 foto baru, hasil unggah lewat `/api/profile/avatar/presign`. */
  avatarKey: z.string().min(1).max(300).optional(),
  maritalStatus: z
    .enum(MARITAL_STATUSES.map((s) => s.value) as [MaritalStatus, ...MaritalStatus[]], { error: "Pilih status pernikahan yang tersedia." })
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

const select = { name: true, email: true, whatsapp: true, avatarUrl: true, skills: true, activities: true, maritalStatus: true } as const;

async function toProfile(u: {
  name: string;
  email: string | null;
  whatsapp: string;
  avatarUrl: string | null;
  skills: string[];
  activities: string;
  maritalStatus: DbMaritalStatus | null;
}): Promise<Profile> {
  return {
    name: u.name,
    email: u.email,
    whatsapp: u.whatsapp,
    avatar: (await avatarSrc(u.avatarUrl)) ?? null,
    skills: u.skills,
    activities: u.activities,
    maritalStatus: u.maritalStatus ? MARITAL_OUT[u.maritalStatus] : null,
  };
}

/** Profil dianggap lengkap bila foto, keahlian, dan kegiatan sehari-hari sudah diisi. */
export const isProfileComplete = (p: Pick<Profile, "avatar" | "skills" | "activities">) =>
  Boolean(p.avatar) && p.skills.length > 0 && p.activities.trim() !== "";

export async function getProfile(userId: number): Promise<Profile> {
  const user = await db.user.findUnique({ where: { id: userId }, select });
  if (!user) throw notFound("Akun");
  return toProfile(user);
}

/** Memperbarui sebagian profil (nama, foto, keahlian); field yang tidak dikirim tidak berubah. */
export async function updateProfile(userId: number, body: unknown): Promise<Profile> {
  const input = profileSchema.parse(body);
  if (input.email) {
    const clash = await db.user.findFirst({ where: { email: input.email, id: { not: userId } }, select: { id: true } });
    if (clash) throw emailTaken();
  }
  const previous =
    input.avatarKey !== undefined
      ? (await db.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } }))?.avatarUrl
      : undefined;
  if (input.avatarKey !== undefined) await verifyAvatarKey(userId, input.avatarKey);
  const user = await db.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.email !== undefined && { email: input.email || null }),
      ...(input.avatarKey !== undefined && { avatarUrl: input.avatarKey }),
      ...(input.skills !== undefined && { skills: input.skills }),
      ...(input.activities !== undefined && { activities: input.activities }),
      ...(input.maritalStatus !== undefined && { maritalStatus: MARITAL_IN[input.maritalStatus] }),
    },
    select,
  }).catch((error: unknown) => {
    // Balapan antara cek email dan update: unique constraint pada `email`.
    if (typeof error === "object" && error && (error as { code?: string }).code === "P2002") throw emailTaken();
    throw error;
  });
  // Foto lama (R2) dibuang setelah yang baru tersimpan, agar tidak ada berkas yatim.
  if (previous && previous !== input.avatarKey) await deleteStoredAvatar(previous);
  return toProfile(user);
}

const emailTaken = () => new ApiError(409, "Email ini sudah dipakai akun lain.", { email: "Email sudah dipakai akun lain." });
