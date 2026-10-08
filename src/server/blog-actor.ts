import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getSessionUser, type SessionUser } from "@/lib/server/session";

const VISITOR_COOKIE = "selaras_visitor";

/** Peserta aktif yang sedang masuk, atau null untuk pengunjung. Sesi admin sengaja tidak dipakai di blog. */
export async function getBlogUser(): Promise<SessionUser | null> {
  const member = await getSessionUser("member");
  return member?.status === "ACTIVE" ? member : null;
}

/** Pengenal pelaku suka: "u:<id>" untuk akun, "v:<token>" untuk pengunjung (cookie dibuat bila belum ada). */
export async function resolveActor(opts: { create: boolean }): Promise<string | null> {
  const user = await getBlogUser();
  if (user) return `u:${user.id}`;
  const jar = await cookies();
  let token = jar.get(VISITOR_COOKIE)?.value;
  if (!token && opts.create) {
    token = randomBytes(18).toString("base64url");
    jar.set(VISITOR_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return token ? `v:${token}` : null;
}
