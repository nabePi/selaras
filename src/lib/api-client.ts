/** Klien tipis untuk API admin (`/api/admin/*`) dari komponen client. */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; fields?: Record<string, string> };

export async function api<T>(path: string, method: "GET" | "POST" | "PATCH" | "DELETE", body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as { data?: T; error?: string; fields?: Record<string, string> } | null;
    if (res.ok && json && "data" in json) return { ok: true, data: json.data as T };
    if (res.status === 401 && typeof window !== "undefined" && !path.startsWith("/api/auth/")) {
      const login = path.startsWith("/api/admin/") ? "/admin/masuk" : "/masuk";
      window.location.assign(new URL(login, window.location.origin).href);
    }
    return { ok: false, error: json?.error ?? "Permintaan gagal. Coba lagi.", fields: json?.fields };
  } catch {
    return { ok: false, error: "Tidak dapat menghubungi server. Periksa koneksi Anda." };
  }
}
