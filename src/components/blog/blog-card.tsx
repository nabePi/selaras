import Link from "next/link";
import { formatDateId } from "@/data/admin-prompts";
import type { BlogPostSummary } from "@/lib/blog-content";
import { Icon } from "../icon";
import { AuthorAvatar } from "./author-box";

export function BlogCard({ post }: { post: BlogPostSummary }) {
  return (
    <article className="overflow-hidden rounded-3xl bg-surface-container-low shadow-sm">
      <Link href={`/blog/${post.slug}`} className="flex flex-col">
        {post.cover?.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover.url} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />
        )}
        <div className="flex flex-col gap-2 p-4">
          <h2 className="t-title-lg text-on-surface">{post.title}</h2>
          {post.excerpt && <p className="t-body-md line-clamp-3 text-text-muted">{post.excerpt}</p>}
          <div className="flex items-center gap-2 pt-1">
            <AuthorAvatar author={post.author} size={28} />
            <p className="t-label-md min-w-0 flex-1 truncate text-on-surface-variant">
              {post.author.name}
              {post.publishedAt && ` · ${formatDateId(post.publishedAt.slice(0, 10))}`}
            </p>
            <span className="t-label-md flex items-center gap-3 text-text-muted">
              <span className="inline-flex items-center gap-1">
                <Icon name="favorite" size={14} />
                {post.likeCount}
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="chat_bubble" size={14} />
                {post.commentCount}
              </span>
            </span>
          </div>
          {post.tags.length > 0 && <p className="t-label-sm text-primary">{post.tags.map((t) => `#${t}`).join(" ")}</p>}
        </div>
      </Link>
    </article>
  );
}
