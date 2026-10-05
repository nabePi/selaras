import type { Metadata } from "next";
import { PromptList } from "@/components/admin/prompt-list";

export const metadata: Metadata = { title: "Kelola Prompt Jurnal" };

export default function PromptPage() {
  return <PromptList />;
}
