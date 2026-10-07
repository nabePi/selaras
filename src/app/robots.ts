import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Area pribadi (member, admin, auth) dan API tidak perlu diindeks.
        disallow: ["/admin", "/api/", "/home", "/journal", "/kelas", "/profil", "/notifikasi", "/pre-assessment", "/post-assessment", "/masuk", "/daftar"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
