import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/** Hanya halaman publik; area member/admin sengaja tidak dimasukkan. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/program`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/cerita`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
