/**
 * `signIn` memanggil API sungguhan. `registerAccount` dan `requestPasswordReset` masih
 * SIMULASI (belum ada backend-nya). Form di `components/auth/*` menangani hasil
 * `{ ok: false, error }` dan keadaan loading.
 */
import { api } from "@/lib/api-client";

export type AuthResult = { ok: true } | { ok: false; error: string };

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type SignInInput = {
  /** Email atau nomor WhatsApp */
  identifier: string;
  password: string;
  remember: boolean;
};

export async function signIn(input: SignInInput): Promise<AuthResult> {
  const result = await api<{ id: number }>("/api/auth/member/login", "POST", {
    identifier: input.identifier,
    password: input.password,
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export type RegisterInput = {
  fullName: string;
  /** Nomor WhatsApp nasional tanpa awalan, mis. "81234567890" */
  whatsapp: string;
  email: string;
  password: string;
  partnerName?: string;
};

export async function registerAccount(input: RegisterInput): Promise<AuthResult> {
  void input;
  await delay(1100);
  return { ok: true };
}

export async function requestPasswordReset(target: string): Promise<AuthResult> {
  void target;
  await delay(600);
  return { ok: true };
}
