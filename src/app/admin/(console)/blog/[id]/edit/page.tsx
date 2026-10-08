import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogForm } from "@/components/admin/blog-form";
import { requireAdminPage } from "@/lib/server/session";
import { getAccountAuthor, getAdminPost, listAdminComments } from "@/server/blog";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = { title: "Edit Artikel" };

export default async function EditBlogPage({ params }: { params: Params }) {
  const { id } = await params;
  const admin = await requireAdminPage();
  const post = await getAdminPost(id);
  if (!post) notFound();
  const [account, comments] = await Promise.all([getAccountAuthor(admin.id), listAdminComments(id)]);
  return <BlogForm key={post.id} initial={post} account={account} comments={comments} />;
}
