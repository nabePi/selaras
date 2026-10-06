import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { btnPrimary, btnSoft } from "@/components/admin/page-header";
import { Icon } from "@/components/icon";
import { PromptQuestions } from "@/components/prompt-questions";
import { formatDateId } from "@/data/admin-prompts";
import {
  PROMPT_STATUS,
  QUESTION_TYPES,
  isEditable,
} from "@/data/journal-prompts";
import { requireAdminPage } from "@/lib/server/session";
import { getPrompt } from "@/server/admin/prompts";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  await requireAdminPage();
  const prompt = await getPrompt(id);
  return { title: prompt ? `${prompt.title} · Prompt` : "Prompt" };
}

export default async function PromptDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  await requireAdminPage();
  const prompt = await getPrompt(id);
  if (!prompt) notFound();

  const status = PROMPT_STATUS[prompt.status];
  const typeCount = QUESTION_TYPES.map((t) => ({
    ...t,
    count: prompt.questions.filter((q) => q.type === t.value).length,
  })).filter((t) => t.count > 0);

  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1 tracking-wide text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            Detail Prompt
          </span>
          <span className="t-body-sm text-text-muted" aria-hidden="true">
            •
          </span>
          <span className="t-body-sm text-text-muted">{prompt.id}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/prompt" className={btnSoft}>
            <Icon name="arrow_back" size={18} />
            <span>Kembali ke Daftar</span>
          </Link>
          {isEditable(prompt) && (
            <Link
              href={`/admin/prompt/${prompt.id}/edit`}
              className={btnPrimary}
            >
              <Icon name="edit" size={18} />
              <span>Edit Prompt</span>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-5">
          <header className="max-w-3xl space-y-2">
            <h1 className="t-headline-lg tracking-tight text-on-surface">
              {prompt.title}
            </h1>
            <p className="t-body-md leading-relaxed text-text-muted">
              {prompt.subtitle || "Tanpa subjudul."}
            </p>
          </header>

          <section
            aria-label="Informasi prompt"
            className="space-y-5 rounded-3xl bg-canvas-ivory p-6 shadow-sm"
          >
            <dl className="space-y-4">
              <div>
                <dt className="t-label-sm text-text-muted">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`t-label-sm rounded-full px-3 py-1 font-semibold ${status.tone}`}
                  >
                    {status.label}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="t-label-sm text-text-muted">Tanggal tayang</dt>
                <dd className="t-title-sm mt-1 text-on-surface">
                  {formatDateId(prompt.date)}
                </dd>
              </div>
              <div>
                <dt className="t-label-sm text-text-muted">
                  Jumlah pertanyaan
                </dt>
                <dd className="t-title-sm mt-1 text-on-surface">
                  {prompt.questions.length} pertanyaan
                </dd>
              </div>
              <div>
                <dt className="t-label-sm text-text-muted">Tipe pertanyaan</dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {typeCount.map((t) => (
                    <span
                      key={t.value}
                      className="t-label-sm inline-flex items-center gap-1 rounded-full bg-sage-tint px-2.5 py-1 text-primary"
                    >
                      <Icon name={t.icon} size={14} />
                      {t.label} × {t.count}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
            {!isEditable(prompt) && (
              <p className="t-body-sm rounded-2xl bg-canvas-cream p-3 text-text-muted">
                Prompt yang sudah terbit tidak dapat diedit.
              </p>
            )}
          </section>
        </div>

        <aside
          aria-label="Tampilan peserta"
          className="space-y-3 xl:col-span-7"
        >
          <div className="flex items-center gap-2 px-1">
            <Icon name="smartphone" size={20} className="text-primary" />
            <span className="t-title-sm font-semibold text-on-surface">
              Tampilan di Jurnal Peserta
            </span>
          </div>
          <div className="mx-auto w-full max-w-[420px] space-y-4 rounded-4xl bg-surface p-4 shadow-md">
            <div className="space-y-1 px-1">
              <h2 className="t-headline-md leading-snug text-on-surface">
                {prompt.title}
              </h2>
              {prompt.subtitle && (
                <p className="t-body-sm text-text-muted">{prompt.subtitle}</p>
              )}
            </div>
            <PromptQuestions questions={prompt.questions} />
          </div>
        </aside>
      </div>
    </div>
  );
}
