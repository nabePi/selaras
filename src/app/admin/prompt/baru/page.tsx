import type { Metadata } from "next";
import { PromptForm } from "@/components/admin/prompt-form";

export const metadata: Metadata = { title: "Tambah Prompt" };

export default function TambahPromptPage() {
  return <PromptForm />;
}
