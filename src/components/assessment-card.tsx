import Link from "next/link";
import { ASSESSMENT_KINDS, type AssessmentKind } from "@/data/assessment";
import { Icon } from "./icon";

/** Kartu ajakan mengisi Pre/Post Assessment di Home. */
export function AssessmentCard({
  kind,
  minutes,
  heading,
  body,
}: {
  kind: AssessmentKind;
  minutes: number;
  heading: string;
  body: string;
}) {
  const title = ASSESSMENT_KINDS[kind].title;
  return (
    <section aria-label={title} className="flex flex-col gap-4 rounded-4xl bg-sage-tint p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="t-label-sm inline-flex items-center gap-1.5 font-semibold tracking-wider text-primary uppercase">
          <Icon name="quiz" size={16} filled />
          {title}
        </span>
        <span className="t-label-sm rounded-full bg-surface-container-lowest px-2.5 py-0.5 font-medium text-tertiary">
          ~{minutes} Menit
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="t-headline-sm leading-snug text-on-surface">{heading}</h2>
        <p className="t-body-sm text-text-muted">{body}</p>
      </div>
      <Link
        href={`/${kind}-assessment`}
        className="t-title-sm flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 tracking-wide text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.99]"
      >
        <span>Isi {title}</span>
        <Icon name="arrow_forward" size={18} />
      </Link>
    </section>
  );
}
