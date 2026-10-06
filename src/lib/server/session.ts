import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ApiError } from "./errors";

/**
 * Admin dan peserta memakai cookie terpisah supaya keduanya bisa masuk bersamaan di satu
 * peramban tanpa saling menimpa.
 */
export type SessionScope = "admin" | "member";
export const SESSION_COOKIES: Record<SessionScope, string> = {
  admin: "selaras_admin_session",
  member: "selaras_member_session",
};
const ROLE_OF_SCOPE = { admin: "ADMIN", member: "MEMBER" } as const;
const SESSION_DAYS = 7;

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "MEMBER" | "ADMIN";
  status: "PENDING" | "ACTIVE";
};

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

export const hashToken = sha256;
export const newToken = () => randomBytes(32).toString("base64url");

export async function createSession(userId: number, scope: SessionScope) {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.session.create({ data: { id: sha256(token), userId, expiresAt } });
  const jar = await cookies();
  jar.set(SESSION_COOKIES[scope], token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(scope: SessionScope) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIES[scope])?.value;
  if (token) await db.session.deleteMany({ where: { id: sha256(token) } });
  jar.delete(SESSION_COOKIES[scope]);
}

/** Pengguna dari cookie sesi, atau null. Di-cache per request. */
export const getSessionUser = cache(async (scope: SessionScope): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIES[scope])?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { id: sha256(token) },
    select: {
      expiresAt: true,
      user: { select: { id: true, name: true, email: true, role: true, status: true } },
    },
  });
  if (!session || session.expiresAt < new Date()) return null;
  // Cookie admin hanya berlaku untuk akun ADMIN, cookie peserta hanya untuk MEMBER.
  return session.user.role === ROLE_OF_SCOPE[scope] ? session.user : null;
});

/** Untuk halaman/layout server: alihkan ke halaman masuk bila bukan admin. */
export async function requireAdminPage(): Promise<SessionUser> {
  const user = await getSessionUser("admin");
  if (!user) redirect("/admin/masuk");
  return user;
}

/** Untuk halaman member: hanya peserta yang sudah diaktifkan. */
export async function requireMemberPage(): Promise<SessionUser> {
  const user = await getSessionUser("member");
  if (!user || user.status !== "ACTIVE") redirect("/masuk");
  return user;
}

export async function requireMemberApi(): Promise<SessionUser> {
  const user = await getSessionUser("member");
  if (!user) throw new ApiError(401, "Sesi berakhir. Silakan masuk kembali.");
  if (user.status !== "ACTIVE") throw new ApiError(403, "Akses ditolak.");
  return user;
}

/** Untuk route handler: lempar 401/403 sebagai ApiError. */
export async function requireAdminApi(): Promise<SessionUser> {
  const user = await getSessionUser("admin");
  if (!user) throw new ApiError(401, "Sesi berakhir. Silakan masuk kembali.");
  return user;
}
