import Link from "next/link";
import { formatDateId } from "@/data/admin-prompts";
import type { BlogPostSummary } from "@/lib/blog-content";
import { Icon } from "../icon";
import { DeleteBlogButton } from "./delete-blog-button";
import { PageHeader, btnPrimary, btnSoft } from "./page-header";

export function BlogList({ posts }: { posts: BlogPostSummary[] }) {
  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <PageHeader
        pill="Blog"
        pulse={false}
        meta={`${posts.length} artikel`}
        title="Kelola Blog"
        description="Tulis artikel dengan editor WYSIWYG, sisipkan gambar, video, atau audio, lalu terbitkan di halaman Blog."
        actions={
          <Link href="/admin/blog/baru" className={btnPrimary}>
            <Icon name="add" size={18} />
            <span>Tulis Artikel</span>
          </Link>
        }
      />

      {posts.length === 0 ? (
        <div className="rounded-3xl bg-canvas-ivory p-10 text-center shadow-sm">
          <Icon name="edit_note" size={36} className="mx-auto text-text-muted" />
          <p className="t-title-md mt-3 text-on-surface">Belum ada artikel</p>
          <p className="t-body-md text-text-muted">Klik “Tulis Artikel” untuk membuat tulisan pertama.</p>
        </div>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((p) => (
            <li key={p.id} className="flex flex-col gap-4 rounded-3xl bg-canvas-ivory p-5 shadow-sm">
              {p.cover?.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.cover.url} alt="" className="aspect-[16/9] w-full rounded-2xl object-cover" />
              )}
              <div className="min-w-0 space-y-1.5">
                <p className={`t-label-sm w-fit rounded-full px-2.5 py-0.5 ${p.status === "PUBLISHED" ? "bg-sage-tint text-primary" : "bg-surface-container-high text-text-muted"}`}>
                  {p.status === "PUBLISHED" ? "Terbit" : "Draf"}
                </p>
                <h2 className="t-title-md text-on-surface">{p.title}</h2>
                <p className="t-label-sm text-text-muted">
                  {p.author.name} · {formatDateId((p.publishedAt ?? p.updatedAt).slice(0, 10))}
                </p>
                {p.tags.length > 0 && <p className="t-label-sm text-primary">{p.tags.map((t) => `#${t}`).join(" ")}</p>}
                <p className="t-label-sm flex gap-3 text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Icon name="favorite" size={14} />
                    {p.likeCount}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="chat_bubble" size={14} />
                    {p.commentCount}
                  </span>
                </p>
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-2">
                <Link href={`/admin/blog/${p.id}/edit`} className={btnSoft}>
                  <Icon name="edit" size={16} />
                  <span>Edit</span>
                </Link>
                {p.status === "PUBLISHED" && (
                  <Link href={`/blog/${p.slug}`} target="_blank" className="t-label-md flex items-center gap-1 rounded-full px-3 py-2 text-primary hover:bg-sage-tint">
                    <Icon name="open_in_new" size={16} />
                    Lihat
                  </Link>
                )}
                <div className="ml-auto">
                  <DeleteBlogButton post={p} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
