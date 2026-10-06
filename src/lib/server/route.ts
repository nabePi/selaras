import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError } from "./errors";
import { requireAdminApi, requireMemberApi, type SessionUser } from "./session";

export const ok = <T>(data: T, init?: ResponseInit) => NextResponse.json({ data }, init);

function fail(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message, fields: error.fields }, { status: error.status });
  }
  if (error instanceof z.ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of error.issues) fields[issue.path.join(".") || "_"] ??= issue.message;
    return NextResponse.json(
      { error: Object.values(fields)[0] ?? "Data tidak valid.", fields },
      { status: 400 },
    );
  }
  console.error("[api]", error);
  return NextResponse.json({ error: "Terjadi kesalahan di server." }, { status: 500 });
}

const firstOf = (value: string | null) => value?.split(",")[0]?.trim() || null;

/**
 * Host & skema yang dilihat peramban. Di belakang proxy (Traefik/Cloudflare) `request.url` berisi
 * alamat internal container (mis. http://0.0.0.0:3000), jadi header forwarded yang dipakai.
 */
export function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const host = firstOf(request.headers.get("x-forwarded-host")) ?? firstOf(request.headers.get("host")) ?? url.host;
  const proto = firstOf(request.headers.get("x-forwarded-proto")) ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

/** Menolak request mutasi lintas-origin (pertahanan CSRF tambahan di atas cookie SameSite=Lax). */
function assertSameOrigin(request: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return;
  const origin = request.headers.get("origin");
  if (!origin) return;
  // Cukup bandingkan host: origin penyerang selalu punya host berbeda. Skema sengaja diabaikan
  // karena proxy bisa meneruskan https sebagai http ke container.
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new ApiError(403, "Origin tidak diizinkan.");
  }
  const hosts = [
    firstOf(request.headers.get("x-forwarded-host")),
    firstOf(request.headers.get("host")),
    new URL(request.url).host,
  ];
  if (!hosts.includes(originHost)) throw new ApiError(403, "Origin tidak diizinkan.");
}

export async function readJson<S extends z.ZodType>(request: Request, schema: S): Promise<z.output<S>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, "Body harus berupa JSON.");
  }
  return schema.parse(body);
}

type Handler<P> = (ctx: { request: Request; params: P; admin: SessionUser }) => Promise<Response>;

/** Route handler khusus admin: cek origin, sesi ADMIN, dan ubah error jadi respons JSON. */
export function adminRoute<P = Record<string, never>>(handler: Handler<P>) {
  return async (request: Request, context: { params: Promise<P> }) => {
    try {
      assertSameOrigin(request);
      const admin = await requireAdminApi();
      return await handler({ request, params: await context.params, admin });
    } catch (error) {
      return fail(error);
    }
  };
}

type MemberHandler<P> = (ctx: { request: Request; params: P; user: SessionUser }) => Promise<Response>;

/** Route handler khusus peserta aktif. */
export function memberRoute<P = Record<string, never>>(handler: MemberHandler<P>) {
  return async (request: Request, context: { params: Promise<P> }) => {
    try {
      assertSameOrigin(request);
      const user = await requireMemberApi();
      return await handler({ request, params: await context.params, user });
    } catch (error) {
      return fail(error);
    }
  };
}

/** Route handler publik (mis. login) — tetap cek origin dan format error. */
export function publicRoute<P = Record<string, never>>(
  handler: (ctx: { request: Request; params: P }) => Promise<Response>,
) {
  return async (request: Request, context: { params: Promise<P> }) => {
    try {
      assertSameOrigin(request);
      return await handler({ request, params: await context.params });
    } catch (error) {
      return fail(error);
    }
  };
}
