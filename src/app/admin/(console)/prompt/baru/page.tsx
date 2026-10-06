import type { Metadata } from "next";
import { PromptForm } from "@/components/admin/prompt-form";
import { requireAdminPage } from "@/lib/server/session";

export const metadata: Metadata = { title: "Tambah Prompt" };

export default async function TambahPromptPage() {
  await requireAdminPage();
  return <PromptForm />;
}
