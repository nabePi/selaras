import "server-only";
import { db } from "@/lib/db";
import { normalizeWhatsApp } from "@/lib/validation";

/** Mencari peserta lewat email, atau nomor WhatsApp (format apa pun: 0812…, +62 812…, 812…). */
export async function findMemberByIdentifier(identifier: string) {
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
