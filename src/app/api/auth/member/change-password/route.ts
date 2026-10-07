import { db } from "@/lib/db";
import { ApiError } from "@/lib/server/errors";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { ok, publicRoute, readJson } from "@/lib/server/route";
import { changePasswordSchema } from "@/server/admin/schemas";
import { findMemberByIdentifier } from "@/server/member/credentials";

const DUMMY_HASH = hashPassword("tidak-dipakai");

/**
 * Mengganti password sementara (akun buatan admin). Tidak butuh sesi: peserta membuktikan diri
 * dengan password sementara itu. Setelahnya semua sesi dicabut dan peserta harus masuk kembali.
 */
export const POST = publicRoute(async ({ request }) => {
  const { identifier, currentPassword, newPassword } = await readJson(request, changePasswordSchema);
  const user = await findMemberByIdentifier(identifier);
  const valid = await verifyPassword(currentPassword, user?.passwordHash ?? (await DUMMY_HASH));
  if (!user || !valid || !user.mustChangePassword) throw new ApiError(401, "Password sementara salah.");
  if (newPassword === currentPassword)
    throw new ApiError(400, "Password baru harus berbeda dari password sementara.", {
      newPassword: "Password baru harus berbeda dari password sementara.",
    });

  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(newPassword), mustChangePassword: false } }),
    db.session.deleteMany({ where: { userId: user.id } }),
  ]);
  return ok({ changed: true });
});
