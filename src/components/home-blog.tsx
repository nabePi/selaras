import Link from "next/link";
import type { BlogPostSummary } from "@/lib/blog-content";
import { BlogCard } from "./blog/blog-card";
import { Icon } from "./icon";

/** Satu artikel blog terbaru di beranda peserta, dengan tautan ke semua artikel. */
export function HomeBlog({ post }: { post: BlogPostSummary }) {
  return (
    <section aria-label="Artikel Selaras" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Icon name="edit_note" size={18} className="text-primary" />
          <h2 className="t-title-md text-on-surface">Artikel Selaras</h2>
        </div>
        <Link href="/blog" className="t-label-md text-primary">
          Lihat semua
        </Link>
      </div>
      <BlogCard post={post} />
    </section>
  );
}
