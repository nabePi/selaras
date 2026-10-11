import "server-only";
import { cache } from "react";
import type { AdminUser } from "@/data/admin-users";
import { db } from "@/lib/db";
import { userCode } from "@/lib/codes";
import { ApiError, notFound } from "@/lib/server/errors";
import { isoDateWib } from "@/lib/server/time";
import { normalizeWhatsApp } from "@/lib/validation";
import { hashPassword } from "@/lib/server/password";
import { avatarSrc } from "@/server/avatar";
import { listSharedEntries } from "@/server/member/journal";
import { findMemberByIdentifier } from "@/server/member/credentials";
import type { z } from "zod";
import type { createUserSchema } from "./schemas";

import { maritalLabel } from "@/data/marital-status";

export const listUsers = cache(async (): Promise<AdminUser[]> => {
  const [rows, cares] = await Promise.all([
    db.user.findMany({ where: { role: "MEMBER" }, orderBy: { id: "asc" } }),
    // Coachee care terbaru per peserta.
    db.coacheeCare.findMany({
      distinct: ["userId"],
      orderBy: { createdAt: "desc" },
      select: { userId: true, authorName: true, createdAt: true },
    }),
  ]);
  const lastCare = new Map(cares.map((c) => [c.userId, { coach: c.authorName, date: isoDateWib(c.createdAt) }]));
  return Promise.all(rows.map(async (u) => ({
    id: userCode.format(u.id),
    name: u.name,
    avatar: await avatarSrc(u.avatarUrl),
    whatsapp: u.whatsapp,
    email: u.email,
    skills: u.skills,
    activities: u.activities,
    maritalStatus: u.maritalStatus ? (maritalLabel(u.maritalStatus.toLowerCase().replace("_", "-")) ?? undefined) : undefined,
    joined: isoDateWib(u.joinedAt),
    lastCare: lastCare.get(u.id),
    status: u.status === "ACTIVE" ? ("active" as const) : ("pending" as const),
  })));
});

/** Jurnal peserta yang boleh dibaca admin: hanya yang dibagikan ke coach. */
export async function listUserJournals(code: string) {
  const user = await findMember(code).catch(() => null);
  if (!user) return null;
  return { user: { id: userCode.format(user.id), name: user.name }, ...(await listSharedEntries(user.id)) };
}

async function findMember(code: string) {
  const id = userCode.parse(code);
  const user = id && (await db.user.findFirst({ where: { id, role: "MEMBER" } }));
  if (!user) throw notFound("Pengguna");
  return user;
}

/** Password awal akun buatan admin: 4 huruf pertama nama + 4 digit terakhir WhatsApp, mis. "wahy7890". */
export function defaultPasswordFor(name: string, nationalWhatsApp: string): string {
  const letters = name
    .normalize("NFD")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 4)
    .toLowerCase();
  return letters + nationalWhatsApp.slice(-4);
}

/**
 * Admin membuat akun peserta (aktif langsung) hanya dari nama dan WhatsApp. Password default
 * dikembalikan sekali agar admin bisa menyampaikannya lewat WhatsApp; peserta wajib menggantinya
 * saat login pertama.
 */
export async function createUser(input: z.output<typeof createUserSchema>) {
  const national = normalizeWhatsApp(input.whatsapp);
  if (!national)
    throw new ApiError(400, "Nomor WhatsApp tidak valid (contoh: 0812 3456 7890).", { whatsapp: "Nomor WhatsApp tidak valid." });
  if (await findMemberByIdentifier(national))
    throw new ApiError(409, "Nomor WhatsApp ini sudah terdaftar.", { whatsapp: "Nomor WhatsApp sudah terdaftar." });

  const defaultPassword = defaultPasswordFor(input.name, national);
  const user = await db.user.create({
    data: {
      name: input.name,
      whatsapp: `0${national}`,
      passwordHash: await hashPassword(defaultPassword),
      mustChangePassword: true,
      status: "ACTIVE",
      activatedAt: new Date(),
    },
  });
  return { id: userCode.format(user.id), name: user.name, whatsapp: user.whatsapp, defaultPassword };
}

export async function activateUser(code: string) {
  const user = await findMember(code);
  if (user.status === "ACTIVE") throw new ApiError(409, `Akun ${user.name} sudah aktif.`);
  await db.user.update({
    where: { id: user.id },
    data: { status: "ACTIVE", activatedAt: new Date() },
  });
}

/**
 * Mengembalikan password peserta ke password default (sama seperti saat akun dibuat admin). Semua sesi
 * dan tautan reset lama dicabut; peserta wajib membuat password baru saat masuk berikutnya. Password
 * default dikembalikan sekali agar admin bisa menyampaikannya lewat WhatsApp.
 */
export async function resetToDefaultPassword(code: string) {
  const user = await findMember(code);
  const national = normalizeWhatsApp(user.whatsapp);
  if (!national) throw new ApiError(400, `Nomor WhatsApp ${user.name} tidak valid, password default tidak bisa dibuat.`);
  const defaultPassword = defaultPasswordFor(user.name, national);
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(defaultPassword), mustChangePassword: true } }),
    db.session.deleteMany({ where: { userId: user.id } }),
    db.passwordResetToken.deleteMany({ where: { userId: user.id } }),
  ]);
  return { id: userCode.format(user.id), name: user.name, whatsapp: user.whatsapp, defaultPassword };
}
