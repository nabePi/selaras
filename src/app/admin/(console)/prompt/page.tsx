import type { Metadata } from "next";
import { PromptList } from "@/components/admin/prompt-list";
import { requireAdminPage } from "@/lib/server/session";
import { getResponseCounts, listPrompts } from "@/server/admin/prompts";

export const metadata: Metadata = { title: "Kelola Prompt Jurnal" };

export default async function PromptPage() {
  await requireAdminPage();
  const [prompts, responseCounts] = await Promise.all([listPrompts(), getResponseCounts()]);
  return <PromptList prompts={prompts} responseCounts={responseCounts} />;
}
