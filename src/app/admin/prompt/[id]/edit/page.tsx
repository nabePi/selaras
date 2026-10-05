import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PromptForm } from "@/components/admin/prompt-form";
import { JOURNAL_PROMPTS, isEditable } from "@/data/journal-prompts";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = { title: "Edit Prompt" };

export default async function EditPromptPage({ params }: { params: Params }) {
  const { id } = await params;
  const prompt = JOURNAL_PROMPTS.find((p) => p.id === id);
  if (!prompt) notFound();
  // Prompt yang sudah terbit hanya bisa dilihat.
  if (!isEditable(prompt)) redirect(`/admin/prompt/${prompt.id}`);

  return <PromptForm key={prompt.id} initial={prompt} />;
}
