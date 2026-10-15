import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { blogStoryImage } from "@/components/blog/story-image";
import { getPublishedPost } from "@/server/blog";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return new Response("Artikel tidak ditemukan.", { status: 404 });

  // Only fetch the published article's own cover, never an arbitrary caller-supplied URL.
  // A missing/unavailable cover must not prevent sharing the article.
  let cover: string | undefined;
  if (post.cover?.url) {
    try {
      const response = await fetch(post.cover.url, { signal: AbortSignal.timeout(8000) });
      const type = response.headers.get("content-type")?.split(";")[0];
      if (response.ok && type && ["image/png", "image/jpeg", "image/webp"].includes(type)) {
        const bytes = await response.arrayBuffer();
        if (bytes.byteLength <= 8 * 1024 * 1024) cover = `data:${type};base64,${Buffer.from(bytes).toString("base64")}`;
      }
    } catch {
      // Render the branded text cover instead.
    }
  }
  // Reuse the exact header asset; embed it so rendering does not depend on a public URL.
  const logoBytes = await readFile(join(process.cwd(), "public/images/logo-header.png"));
  const logo = `data:image/png;base64,${logoBytes.toString("base64")}`;
  return blogStoryImage({ title: post.title, author: post.author.name, cover, logo });
}
