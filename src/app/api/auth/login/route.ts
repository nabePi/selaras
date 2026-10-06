import { db } from "@/lib/db";
import { ApiError } from "@/lib/server/errors";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { ok, publicRoute, readJson } from "@/lib/server/route";
import { createSession } from "@/lib/server/session";
import { loginSchema } from "@/server/admin/schemas";

// Hash tiruan agar waktu respons sama baik email terdaftar maupun tidak.
const DUMMY_HASH = hashPassword("tidak-dipakai");

export const POST = publicRoute(async ({ request }) => {
  const { email, password } = await readJson(request, loginSchema);
  const user = await db.user.findUnique({ where: { email } });
  const valid = await verifyPassword(password, user?.passwordHash ?? (await DUMMY_HASH));
  if (!user || !valid || user.role !== "ADMIN") throw new ApiError(401, "Email atau password salah.");

  await createSession(user.id, "admin");
  return ok({ id: user.id, name: user.name, email: user.email, role: user.role });
});
