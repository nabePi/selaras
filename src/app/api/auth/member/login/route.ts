import { db } from "@/lib/db";
import { ApiError } from "@/lib/server/errors";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { ok, publicRoute, readJson } from "@/lib/server/route";
import { createSession } from "@/lib/server/session";
import { normalizeWhatsApp } from "@/lib/validation";
import { memberLoginSchema } from "@/server/admin/schemas";

const DUMMY_HASH = hashPassword("tidak-dipakai");

/** Mencari peserta lewat email, atau nomor WhatsApp (format apa pun: 0812…, +62 812…, 812…). */
async function findMember(identifier: string) {
  if (identifier.includes("@")) {
    return db.user.findFirst({ where: { email: identifier.toLowerCase(), role: "MEMBER" } });
  }
  const national = normalizeWhatsApp(identifier);
  if (!national) return null;
  const rows = await db.$queryRaw<{ id: number }[]>`
    SELECT "id" FROM "User"
    WHERE "role" = 'MEMBER'
      AND regexp_replace("whatsapp", '\\D', '', 'g') IN (${"0" + national}, ${"62" + national}, ${national})
    LIMIT 1`;
  return rows[0] ? db.user.findUnique({ where: { id: rows[0].id } }) : null;
}

export const POST = publicRoute(async ({ request }) => {
  const { identifier, password } = await readJson(request, memberLoginSchema);
  const user = await findMember(identifier);
  const valid = await verifyPassword(password, user?.passwordHash ?? (await DUMMY_HASH));
  if (!user || !valid) throw new ApiError(401, "Email/WhatsApp atau kata sandi salah.");
  if (user.status !== "ACTIVE")
    throw new ApiError(403, "Akunmu belum diaktifkan. Tim pendamping akan menghubungimu setelah verifikasi.");

  await createSession(user.id, "member");
  return ok({ id: user.id, name: user.name });
});
