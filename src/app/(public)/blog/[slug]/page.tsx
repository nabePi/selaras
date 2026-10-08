import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCard } from "@/components/blog/blog-card";
import { AuthorAvatar, AuthorBox } from "@/components/blog/author-box";
import { BlogContent, TagList } from "@/components/blog/blog-content";
import { CommentSection } from "@/components/blog/comment-section";
import { ProgramCta } from "@/components/blog/program-cta";
import { LikeButton } from "@/components/blog/like-button";
import { ShareActions } from "@/components/blog/share-actions";
import { Icon } from "@/components/icon";
import { JsonLd } from "@/components/json-ld";
import { formatDateId } from "@/data/admin-prompts";
import { plainText } from "@/lib/blog-content";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { getPublishedPost, likeStateFor, listComments, listRelatedPosts } from "@/server/blog";
import { getBlogUser, resolveActor } from "@/server/blog-actor";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Artikel tidak ditemukan", robots: { index: false } };
  const description = post.excerpt || plainText(post.content).replace(/\s+/g, " ").trim().slice(0, 160);
  return {
    title: post.title,
    description,
    keywords: post.tags,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description, publishedTime: post.publishedAt ?? undefined, authors: [post.author.name], tags: post.tags },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();
  const postId = Number(post.id);
  const [actor, user, comments, related] = await Promise.all([resolveActor({ create: false }), getBlogUser(), listComments(postId), listRelatedPosts(postId, post.tags)]);
  const likes = await likeStateFor(postId, actor);

  return (
    <article className="flex w-full flex-col gap-5 pb-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          keywords: post.tags.join(", "),
          author: { "@type": "Person", name: post.author.name },
          publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
        }}
      />
      <Link href="/blog" className="t-label-md mt-3 flex w-fit items-center gap-1 text-primary">
        <Icon name="arrow_back" size={16} />
        Semua artikel
      </Link>

      {post.cover?.url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover.url} alt="" className="aspect-[16/9] w-full rounded-3xl object-cover" />
      )}

      <header className="flex flex-col gap-3">
        <h1 className="t-headline-lg-mobile tracking-tight text-on-surface">{post.title}</h1>
        <div className="flex items-center gap-2.5">
          <AuthorAvatar author={post.author} size={36} />
          <p className="t-label-md text-on-surface-variant">
            <span className="font-semibold text-on-surface">{post.author.name}</span>
            {post.publishedAt && <span className="block text-text-muted">{formatDateId(post.publishedAt.slice(0, 10))}</span>}
          </p>
        </div>
      </header>

      <BlogContent doc={post.content} />
      <TagList tags={post.tags} />

      <div className="flex flex-wrap items-center gap-2">
        <LikeButton slug={post.slug} initialCount={likes.count} initialLiked={likes.liked} />
        <ShareActions title={post.title} path={`/blog/${post.slug}`} />
      </div>

      <AuthorBox author={post.author} />
      <ProgramCta />
      <CommentSection slug={post.slug} initial={comments} userName={user?.name ?? null} />

      {related.length > 0 && (
        <section aria-label="Artikel lainnya" className="flex flex-col gap-3">
          <h2 className="t-title-lg text-on-surface">Artikel lainnya</h2>
          {related.map((p) => (
            <BlogCard key={p.id} post={p} />
          ))}
          <Link href="/blog" className="t-title-sm flex w-fit items-center gap-1 self-center rounded-full bg-sage-tint px-5 py-2.5 text-primary transition-colors hover:bg-primary-fixed">
            Lihat semua artikel
            <Icon name="arrow_forward" size={16} />
          </Link>
        </section>
      )}
    </article>
  );
}
