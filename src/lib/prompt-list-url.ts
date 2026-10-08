export type PromptSort = "asc" | "desc";

/** Tautan daftar prompt dengan urutan, ukuran, dan halaman tertentu (nilai bawaan tidak dimasukkan ke URL). */
export function promptListHref(sort: PromptSort, per: number, page: number, defaultPer: number) {
  const q = new URLSearchParams();
  if (sort === "asc") q.set("urut", "asc");
  if (per !== defaultPer) q.set("per", String(per));
  if (page > 1) q.set("hal", String(page));
  const s = q.toString();
  return `/admin/prompt${s ? `?${s}` : ""}`;
}
