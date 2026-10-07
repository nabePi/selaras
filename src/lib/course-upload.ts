import { UPLOAD_RULES, type CourseFile, type UploadPurpose } from "@/data/courses";
import { api } from "@/lib/api-client";

export type UploadResult = { ok: true; file: CourseFile } | { ok: false; error: string };

function putFile(url: string, file: File, onProgress: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Unggahan ditolak server.")));
    xhr.onerror = () => reject(new Error("Gagal mengunggah. Periksa koneksi internet."));
    xhr.send(file);
  });
}

/** Unggah satu berkas kelas langsung ke R2 (lewat URL bertanda tangan) dengan laporan progres. */
export async function uploadCourseFile(
  file: File,
  purpose: UploadPurpose,
  onProgress: (pct: number) => void,
): Promise<UploadResult> {
  const rule = UPLOAD_RULES[purpose];
  if (!rule.allows(file.type)) return { ok: false, error: `${file.name}: format tidak didukung (gunakan ${rule.formats}).` };
  if (file.size > rule.maxBytes) return { ok: false, error: `${file.name}: melebihi batas ${rule.maxLabel}.` };

  const presigned = await api<{ key: string; uploadUrl: string }>("/api/admin/courses/upload", "POST", {
    purpose,
    name: file.name,
    type: file.type,
    size: file.size,
  });
  if (!presigned.ok) return { ok: false, error: presigned.error };
  try {
    await putFile(presigned.data.uploadUrl, file, onProgress);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal mengunggah." };
  }
  return {
    ok: true,
    file: { key: presigned.data.key, name: file.name, size: file.size, url: URL.createObjectURL(file) },
  };
}

/** Membuang unggahan yang belum tersimpan di kelas mana pun (abaikan kegagalan). */
export const discardCourseFile = (key: string) => void api("/api/admin/courses/upload/discard", "POST", { key });
