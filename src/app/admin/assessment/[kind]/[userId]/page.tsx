import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Avatar } from "@/components/admin/assessment-manager";
import { btnSoft } from "@/components/admin/page-header";
import { Icon } from "@/components/icon";
import { formatDateId } from "@/data/admin-prompts";
import {
  ASSESSMENT_KINDS,
  ASSESSMENT_PARTS,
  ASSESSMENT_SETS,
  scoreBand,
  type AssessmentKind,
  type AssessmentPart,
} from "@/data/assessment";
import { getAssessmentResponses } from "@/data/assessment-responses";

type Params = Promise<{ kind: string; userId: string }>;

export const metadata: Metadata = { title: "Jawaban Assessment" };

const PARTS: AssessmentPart[] = ["mindset", "habit"];

export default async function AssessmentResponsePage({ params }: { params: Params }) {
  const { kind, userId } = await params;
  if (!(kind in ASSESSMENT_KINDS)) notFound();
  const k = kind as AssessmentKind;
  const response = getAssessmentResponses(k).find((r) => r.userId === userId);
  if (!response) notFound();
  const listHref = `/admin/assessment/${k}`;
  if (!response.answeredAt) redirect(listHref);

  const items = ASSESSMENT_SETS[k];

  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-8 px-4 py-8 sm:px-8 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="t-label-sm inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1 tracking-wide text-primary">
          <span className="size-1.5 rounded-full bg-primary" />
          Jawaban {ASSESSMENT_KINDS[k].title}
        </span>
        <Link href={listHref} className={btnSoft}>
          <Icon name="arrow_back" size={18} />
          <span>Kembali ke {ASSESSMENT_KINDS[k].title}</span>
        </Link>
      </div>

      <header className="flex max-w-3xl items-center gap-4">
        <Avatar name={response.name} src={response.avatar} size={56} />
        <div className="space-y-1">
          <h1 className="t-headline-lg tracking-tight text-on-surface">{response.name}</h1>
          <p className="t-body-md text-text-muted">Mengisi pada {formatDateId(response.answeredAt)}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {PARTS.map((part) => {
          const list = items.filter((it) => it.part === part);
          const score = response.scores[part];
          const band = score === null ? null : scoreBand(score);
          const { scale } = ASSESSMENT_PARTS[part];
          return (
            <section key={part} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="t-title-md text-on-surface">{ASSESSMENT_PARTS[part].title}</h2>
                {band && score !== null && (
                  <span className={`t-label-md rounded-full px-3 py-1 font-semibold ${band.tone}`}>
                    Rata-rata {score.toFixed(1)} · {band.label}
                  </span>
                )}
              </div>
              <ol className="space-y-3">
                {list.map((it, i) => {
                  const value = response.answers[it.id];
                  return (
                    <li key={it.id} className="space-y-2 rounded-3xl bg-canvas-ivory p-4 shadow-sm">
                      <p className="t-label-sm text-text-muted">
                        {i + 1}. {it.dimension}
                      </p>
                      <p className="t-body-md text-on-surface">{it.text}</p>
                      <p className="t-title-sm flex items-center gap-2 text-primary">
                        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-on-primary">
                          {value ?? "-"}
                        </span>
                        {value ? scale[value - 1] : "Tidak dijawab"}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
