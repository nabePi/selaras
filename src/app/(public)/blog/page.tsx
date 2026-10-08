import type { Metadata } from "next";
import Link from "next/link";
import { BlogCard } from "@/components/blog/blog-card";
import { Icon } from "@/components/icon";
import { normalizeTag } from "@/lib/blog-content";
import { listPopularTags, listPublishedPosts } from "@/server/blog";

// Gambar sampul memakai URL baca bertanda tangan yang kedaluwarsa, jadi halaman tidak boleh di-cache statis.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog: Artikel Pernikahan, Kehamilan, Menyusui & Keluarga Muslim",
  description:
    "Artikel dari Selaras Life tentang pernikahan, kehamilan, persalinan fitrah, menyusui, parenting, dan kesehatan mental keluarga muslim.",
  alternates: { canonical: "/blog" },
};

type SearchParams = Promise<{ tag?: string; page?: string }>;

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const tag = sp.tag ? normalizeTag(sp.tag) : undefined;
  const page = Number(sp.page) || 1;
  const [{ posts, pageCount, page: current }, tags] = await Promise.all([listPublishedPosts({ tag, page }), listPopularTags()]);
  const href = (p: number) => `/blog?${new URLSearchParams({ ...(tag ? { tag } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;

  return (
    <div className="flex w-full flex-col gap-5 pb-8">
      <header className="flex flex-col gap-2 pt-2">
        <h1 className="t-headline-lg-mobile tracking-tight text-on-surface">Blog Selaras</h1>
        <p className="t-body-md leading-relaxed text-text-muted">
          Tulisan seputar pernikahan, kehamilan, menyusui, dan keluarga yang selaras dengan wahyu.
        </p>
      </header>

      {tags.length > 0 && (
        <ul className="-mx-margin flex gap-2 overflow-x-auto px-margin pb-1" aria-label="Hashtag">
          <li>
            <Link href="/blog" className={`t-label-md block rounded-full px-3 py-1.5 whitespace-nowrap ${!tag ? "bg-primary text-on-primary" : "bg-sage-tint text-primary"}`}>
              Semua
            </Link>
          </li>
          {tags.map((t) => (
            <li key={t}>
              <Link href={`/blog?tag=${encodeURIComponent(t)}`} className={`t-label-md block rounded-full px-3 py-1.5 whitespace-nowrap ${tag === t ? "bg-primary text-on-primary" : "bg-sage-tint text-primary"}`}>
                #{t}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {posts.length === 0 ? (
        <p className="t-body-md rounded-3xl bg-surface-container-low p-6 text-center text-text-muted">
          {tag ? `Belum ada artikel dengan hashtag #${tag}.` : "Belum ada artikel. Nantikan tulisan pertama kami."}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((p) => (
            <BlogCard key={p.id} post={p} />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <nav aria-label="Halaman" className="flex items-center justify-between">
          {current > 1 ? (
            <Link href={href(current - 1)} className="t-label-md flex items-center gap-1 text-primary">
              <Icon name="arrow_back" size={16} />
              Lebih baru
            </Link>
          ) : (
            <span />
          )}
          <span className="t-label-sm text-text-muted">
            {current} / {pageCount}
          </span>
          {current < pageCount ? (
            <Link href={href(current + 1)} className="t-label-md flex items-center gap-1 text-primary">
              Lebih lama
              <Icon name="arrow_forward" size={16} />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
