import "server-only";
import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { ApiError } from "./errors";

/**
 * Captcha hitung sederhana tanpa penyimpanan: jawabannya ada di dalam token yang ditandatangani
 * HMAC, jadi server tidak perlu menyimpan apa pun. Tiap token hanya berlaku satu kali (per proses).
 */
const TTL_MS = 10 * 60 * 1000;
const secret = () => process.env.CAPTCHA_SECRET || process.env.DATABASE_URL || "selaras-captcha";
const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

const used = new Map<string, number>();
function markUsed(nonce: string, expires: number) {
  const now = Date.now();
  for (const [k, exp] of used) if (exp < now) used.delete(k);
  if (used.has(nonce)) return false;
  used.set(nonce, expires);
  return true;
}

export function createCaptcha() {
  const a = randomInt(2, 10);
  const b = randomInt(2, 10);
  const minus = randomInt(0, 2) === 1 && a > b;
  const answer = minus ? a - b : a + b;
  const expires = Date.now() + TTL_MS;
  const payload = `${expires}.${answer}.${randomBytes(8).toString("base64url")}`;
  return { token: `${payload}.${sign(payload)}`, question: `${a} ${minus ? "−" : "+"} ${b} = ?` };
}

/** Melempar ApiError 400 bila token/jawaban salah atau kedaluwarsa. */
export function verifyCaptcha(token: unknown, answer: unknown) {
  const fail = () => new ApiError(400, "Jawaban captcha salah atau kedaluwarsa. Coba lagi.");
  if (typeof token !== "string" || typeof answer !== "string" && typeof answer !== "number") throw fail();
  const parts = token.split(".");
  if (parts.length !== 4) throw fail();
  const [expires, expected, nonce, sig] = parts;
  const payload = `${expires}.${expected}.${nonce}`;
  const good = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (good.length !== given.length || !timingSafeEqual(good, given)) throw fail();
  const exp = Number(expires);
  if (!Number.isFinite(exp) || exp < Date.now()) throw fail();
  // Token hangus pada percobaan pertama, benar atau salah, agar jawabannya tidak bisa ditebak berulang.
  if (!markUsed(nonce, exp)) throw fail();
  if (String(answer).trim() !== expected) throw fail();
}
