import type { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/server/password";

/**
 * Membuat akun admin dari SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (/ SEED_ADMIN_NAME) bila
 * emailnya belum terdaftar. Aman dijalankan berulang; password admin yang sudah ada tidak
 * pernah ditimpa. Tanpa env tersebut, tidak melakukan apa pun.
 */
export async function ensureAdmin(db: PrismaClient) {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD kosong: akun admin tidak dibuat.");
    return;
  }
  if (await db.user.findUnique({ where: { email } })) {
    console.log(`Admin ${email} sudah ada; dilewati.`);
    return;
  }
  await db.user.create({
    data: {
      name: process.env.SEED_ADMIN_NAME?.trim() || "Admin Selaras",
      email,
      whatsapp: "-",
      passwordHash: await hashPassword(password),
      role: "ADMIN",
      status: "ACTIVE",
      activatedAt: new Date(),
    },
  });
  console.log(`Admin dibuat: ${email}`);
}
