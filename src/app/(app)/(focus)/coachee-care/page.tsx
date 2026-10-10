import type { Metadata } from "next";
import Link from "next/link";
import { FocusHeader } from "@/components/focus-header";
import { Icon } from "@/components/icon";
import { requireMemberPage } from "@/lib/server/session";
import { listMyCare } from "@/server/member/coachee-care";

export const metadata: Metadata = { title: "Coachee Care" };

export default async function CoacheeCareListPage() {
  const user = await requireMemberPage();
  const items = await listMyCare(user.id);

  return (
    <>
      <FocusHeader title="Coachee Care" backHref="/home" hideLogo />
      <div className="flex w-full flex-col gap-2 pb-10 pt-2">
        {items.length === 0 ? (
          <p className="t-body-md rounded-2xl bg-surface-container-low p-4 text-center text-text-muted">Belum ada coachee care.</p>
        ) : (
          items.map((c) => (
            <Link
              key={c.id}
              href={`/coachee-care/${c.id}`}
              className="flex items-start gap-3 rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sage-tint text-primary">
                <Icon name="volunteer_activism" size={20} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="t-title-sm line-clamp-2 text-on-surface">{c.title}</span>
                <span className="t-label-sm text-text-muted">
                  {c.authorName} · {c.dateLabel}
                </span>
              </span>
              <Icon name="chevron_right" size={20} className="shrink-0 self-center text-text-muted" />
            </Link>
          ))
        )}
      </div>
    </>
  );
}
