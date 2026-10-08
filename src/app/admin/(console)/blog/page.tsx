import type { Metadata } from "next";
import { BlogList } from "@/components/admin/blog-list";
import { requireAdminPage } from "@/lib/server/session";
import { listAdminPosts } from "@/server/blog";

export const metadata: Metadata = { title: "Kelola Blog" };

export default async function AdminBlogPage() {
  await requireAdminPage();
  return <BlogList posts={await listAdminPosts()} />;
}
