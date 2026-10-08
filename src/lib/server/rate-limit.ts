import "server-only";
import { ApiError } from "./errors";

const hits = new Map<string, { count: number; resetAt: number }>();

/** Pembatas jendela tetap di memori proses (cukup untuk meredam spam komentar dari satu alamat). */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (hits.size > 5000) for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (++entry.count > limit) throw new ApiError(429, "Terlalu banyak permintaan. Coba lagi sebentar.");
}

/** Alamat klien dari header proxy. */
export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
