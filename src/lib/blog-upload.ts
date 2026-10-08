import { BLOG_UPLOAD_RULES, type BlogUploadPurpose } from "@/lib/blog-content";
import { api } from "@/lib/api-client";
import { putFile } from "@/lib/course-upload";

export type BlogUploadResult = { ok: true; key: string; url: string } | { ok: false; error: string };

/** Unggah satu berkas blog langsung ke R2 lewat URL bertanda tangan; `url` adalah pratinjau lokal. */
export async function uploadBlogFile(file: File, purpose: BlogUploadPurpose, onProgress: (pct: number) => void = () => {}): Promise<BlogUploadResult> {
  const rule = BLOG_UPLOAD_RULES[purpose];
  if (!rule.allows(file.type)) return { ok: false, error: `${file.name}: format tidak didukung (gunakan ${rule.formats}).` };
  if (file.size > rule.maxBytes) return { ok: false, error: `${file.name}: melebihi batas ${rule.maxLabel}.` };

  const presigned = await api<{ key: string; uploadUrl: string }>("/api/admin/blog/upload", "POST", {
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
  return { ok: true, key: presigned.data.key, url: URL.createObjectURL(file) };
}
