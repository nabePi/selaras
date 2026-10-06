import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PromptStats } from "@/components/admin/prompt-stats";
import { btnSoft } from "@/components/admin/page-header";
import { Icon } from "@/components/icon";
import { formatDateId } from "@/data/admin-prompts";
import { requireAdminPage } from "@/lib/server/session";
import { getPrompt, getPromptResponses } from "@/server/admin/prompts";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = { title: "Statistik Prompt" };

export default async function PromptStatsPage({ params }: { params: Params }) {
  const { id } = await params;
  await requireAdminPage();
  const prompt = await getPrompt(id);
  if (!prompt) notFound();
  // Prompt yang belum terbit belum punya jawaban.
  if (prompt.status !== "terbit") redirect(`/admin/prompt/${prompt.id}`);

  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1 tracking-wide text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            Statistik Prompt
          </span>
          <span className="t-body-sm text-text-muted" aria-hidden="true">
            •
          </span>
          <span className="t-body-sm text-text-muted">{prompt.id}</span>
        </div>
        <Link href="/admin/prompt" className={btnSoft}>
          <Icon name="arrow_back" size={18} />
          <span>Kembali ke Daftar</span>
        </Link>
      </div>

      <header className="max-w-3xl space-y-2">
        <h1 className="t-headline-lg tracking-tight text-on-surface">{prompt.title}</h1>
        <p className="t-body-md leading-relaxed text-text-muted">
          Tayang {formatDateId(prompt.date)}. Pantau siapa yang sudah dan belum mengisi, serta isi jawabannya.
        </p>
      </header>

      <PromptStats promptId={prompt.id} responses={await getPromptResponses(prompt)} />
    </div>
  );
}
