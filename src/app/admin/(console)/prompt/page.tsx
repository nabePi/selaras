import type { Metadata } from "next";
import { PromptList } from "@/components/admin/prompt-list";
import { requireAdminPage } from "@/lib/server/session";
import { listPrompts } from "@/server/admin/prompts";

export const metadata: Metadata = { title: "Kelola Prompt Jurnal" };

export default async function PromptPage() {
  await requireAdminPage();
  return <PromptList prompts={await listPrompts()} />;
}
