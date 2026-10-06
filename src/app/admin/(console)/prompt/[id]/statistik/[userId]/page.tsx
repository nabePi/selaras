import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { btnSoft } from "@/components/admin/page-header";
import { EntryAudio } from "@/components/entry-audio";
import { EntryVideo } from "@/components/entry-video";
import { Icon } from "@/components/icon";
import { formatDateId } from "@/data/admin-prompts";
import { requireAdminPage } from "@/lib/server/session";
import { getPrompt, getPromptResponse } from "@/server/admin/prompts";

type Params = Promise<{ id: string; userId: string }>;

export const metadata: Metadata = { title: "Jawaban Peserta" };

export default async function ResponseDetailPage({ params }: { params: Params }) {
  const { id, userId } = await params;
  await requireAdminPage();
  const prompt = await getPrompt(id);
  if (!prompt || prompt.status !== "terbit") notFound();
  const response = await getPromptResponse(prompt, userId);
  if (!response) notFound();
  const statsHref = `/admin/prompt/${prompt.id}/statistik`;
  if (!response.answeredAt) redirect(statsHref);

  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1 tracking-wide text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            Jawaban Peserta
          </span>
          <span className="t-body-sm text-text-muted" aria-hidden="true">
            •
          </span>
          <span className="t-body-sm text-text-muted">{prompt.id}</span>
        </div>
        <Link href={statsHref} className={btnSoft}>
          <Icon name="arrow_back" size={18} />
          <span>Kembali ke Statistik</span>
        </Link>
      </div>

      <header className="flex max-w-3xl items-center gap-4">
        {response.avatar ? (
          <Image
            src={response.avatar}
            alt=""
            width={56}
            height={56}
            className="size-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="t-title-md flex size-14 shrink-0 items-center justify-center rounded-full bg-sage-tint text-primary">
            {response.name
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase()}
          </span>
        )}
        <div className="space-y-1">
          <h1 className="t-headline-lg tracking-tight text-on-surface">{response.name}</h1>
          <p className="t-body-md text-text-muted">
            {prompt.title} · {formatDateId(prompt.date)}, mengisi pukul {response.answeredAt}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-12">
        <section aria-label="Jawaban" className="space-y-4 xl:col-span-7">
          <h2 className="t-title-md text-on-surface">Jawaban ({response.answers.length})</h2>
          <ol className="space-y-4">
            {response.answers.map((a, i) => (
              <li key={a.label} className="space-y-2 rounded-3xl bg-canvas-ivory p-5 shadow-sm">
                <p className="t-label-md text-text-muted">
                  {i + 1}. {a.label}
                </p>
                <p className={`t-body-md text-on-surface ${a.type === "text" ? "leading-relaxed" : "font-semibold"}`}>
                  {a.value}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-label="Lampiran" className="space-y-4 xl:col-span-5">
          <h2 className="t-title-md text-on-surface">Lampiran ({response.attachments.length})</h2>
          {response.attachments.length === 0 ? (
            <p className="t-body-md rounded-3xl bg-canvas-ivory p-5 text-text-muted shadow-sm">
              Peserta tidak melampirkan foto, audio, maupun video.
            </p>
          ) : (
            <ul className="space-y-4">
              {response.attachments.map((a) => (
                <li key={a.id ?? a.title} className="space-y-2 rounded-3xl bg-canvas-ivory p-4 shadow-sm">
                  <p className="t-label-md flex items-center gap-1.5 text-text-muted">
                    <Icon
                      name={a.kind === "image" ? "image" : a.kind === "audio" ? "graphic_eq" : "videocam"}
                      size={16}
                    />
                    {a.kind === "image" ? "Foto" : a.kind === "audio" ? "Audio" : "Video"}
                  </p>
                  {a.kind === "image" && (
                    <Image
                      unoptimized={!a.src.startsWith("/")}
                      src={a.src}
                      alt={a.title}
                      width={720}
                      height={480}
                      className="h-auto w-full rounded-xl object-cover"
                    />
                  )}
                  {a.kind === "audio" && <EntryAudio title={a.title} meta={a.meta} src={a.src} />}
                  {a.kind === "video" && <EntryVideo src={a.src} poster={a.poster} title={a.title} />}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
