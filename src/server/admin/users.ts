import "server-only";
import { cache } from "react";
import { createHash, randomBytes } from "node:crypto";
import type { AdminUser } from "@/data/admin-users";
import { db } from "@/lib/db";
import { userCode } from "@/lib/codes";
import { ApiError, notFound } from "@/lib/server/errors";
import { isoDateWib } from "@/lib/server/time";
import { sendPasswordResetEmail } from "@/server/mailer";

const RESET_TTL_MS = 60 * 60 * 1000;

export const listUsers = cache(async (): Promise<AdminUser[]> => {
  const rows = await db.user.findMany({ where: { role: "MEMBER" }, orderBy: { id: "asc" } });
  return rows.map((u) => ({
    id: userCode.format(u.id),
    name: u.name,
    avatar: u.avatarUrl ?? undefined,
    whatsapp: u.whatsapp,
    email: u.email,
    skills: u.skills,
    activities: u.activities,
    joined: isoDateWib(u.joinedAt),
    status: u.status === "ACTIVE" ? "active" : "pending",
  }));
});

async function findMember(code: string) {
  const id = userCode.parse(code);
  const user = id && (await db.user.findFirst({ where: { id, role: "MEMBER" } }));
  if (!user) throw notFound("Pengguna");
  return user;
}

export async function activateUser(code: string) {
  const user = await findMember(code);
  if (user.status === "ACTIVE") throw new ApiError(409, `Akun ${user.name} sudah aktif.`);
  await db.user.update({
    where: { id: user.id },
    data: { status: "ACTIVE", activatedAt: new Date() },
  });
}

/** Membuat token reset sekali pakai (berlaku 1 jam) dan mengirim tautannya ke email pengguna. */
export async function requestPasswordReset(code: string, origin: string) {
  const user = await findMember(code);
  const token = randomBytes(32).toString("base64url");
  await db.$transaction([
    db.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
    db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: createHash("sha256").update(token).digest("hex"),
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      },
    }),
  ]);
  await sendPasswordResetEmail(user.email, `${origin}/atur-ulang-password?token=${token}`);
}
