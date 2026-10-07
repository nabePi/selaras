import { ApiError } from "@/lib/server/errors";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { ok, publicRoute, readJson } from "@/lib/server/route";
import { createSession } from "@/lib/server/session";
import { memberLoginSchema } from "@/server/admin/schemas";
import { findMemberByIdentifier } from "@/server/member/credentials";

const DUMMY_HASH = hashPassword("tidak-dipakai");

export const POST = publicRoute(async ({ request }) => {
  const { identifier, password } = await readJson(request, memberLoginSchema);
  const user = await findMemberByIdentifier(identifier);
  const valid = await verifyPassword(password, user?.passwordHash ?? (await DUMMY_HASH));
  if (!user || !valid) throw new ApiError(401, "Email/WhatsApp atau kata sandi salah.");
  if (user.status !== "ACTIVE")
    throw new ApiError(403, "Akunmu belum diaktifkan. Tim pendamping akan menghubungimu setelah verifikasi.");

  // Akun buatan admin masih memakai password default: belum boleh punya sesi sebelum menggantinya.
  if (user.mustChangePassword) return ok({ mustChangePassword: true as const });

  await createSession(user.id, "member");
  return ok({ mustChangePassword: false as const, id: user.id, name: user.name });
});
