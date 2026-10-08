import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { listPublishedSlugs } from "@/server/blog";

/** Hanya halaman publik; area member/admin sengaja tidak dimasukkan. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = await listPublishedSlugs().catch(() => []);
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/program`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    { url: `${SITE_URL}/cerita`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
