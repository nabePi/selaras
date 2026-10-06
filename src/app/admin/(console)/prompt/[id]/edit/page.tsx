import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PromptForm } from "@/components/admin/prompt-form";
import { isEditable } from "@/data/journal-prompts";
import { requireAdminPage } from "@/lib/server/session";
import { getPrompt } from "@/server/admin/prompts";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = { title: "Edit Prompt" };

export default async function EditPromptPage({ params }: { params: Params }) {
  const { id } = await params;
  await requireAdminPage();
  const prompt = await getPrompt(id);
  if (!prompt) notFound();
  // Prompt yang sudah terbit hanya bisa dilihat.
  if (!isEditable(prompt)) redirect(`/admin/prompt/${prompt.id}`);

  return <PromptForm key={prompt.id} initial={prompt} />;
}
