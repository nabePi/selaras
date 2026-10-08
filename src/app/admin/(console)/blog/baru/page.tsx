import type { Metadata } from "next";
import { BlogForm } from "@/components/admin/blog-form";
import { requireAdminPage } from "@/lib/server/session";
import { getAccountAuthor } from "@/server/blog";

export const metadata: Metadata = { title: "Artikel Baru" };

export default async function NewBlogPage() {
  const admin = await requireAdminPage();
  return <BlogForm account={await getAccountAuthor(admin.id)} />;
}
