import type { Metadata } from "next";
import { PromptStudio } from "@/components/admin/prompt-studio";

export const metadata: Metadata = { title: "Kelola Prompt Jurnal" };

export default function PromptPage() {
  return <PromptStudio />;
}
