import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CareFiles } from "@/components/admin/care-files";
import { BlogContent } from "@/components/blog/blog-content";
import { FocusHeader } from "@/components/focus-header";
import { Icon } from "@/components/icon";
import { PrintButton } from "@/components/print-button";
import { PrintPage } from "@/components/print-footer";
import { requireMemberPage } from "@/lib/server/session";
import { getMyCare } from "@/server/member/coachee-care";

type Params = Promise<{ id: string }>;

/** Judul halaman = judul care, jadi nama berkas PDF hasil simpan ikut bermakna. */
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const user = await requireMemberPage();
  const care = await getMyCare(user.id, id);
  return { title: care ? `Coachee Care - ${care.title}` : "Detail Coachee Care" };
}

export default async function CoacheeCareDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const user = await requireMemberPage();
  const care = await getMyCare(user.id, id);
  if (!care) notFound();

  return (
    <>
      <FocusHeader title="Coachee Care" backHref="/coachee-care" hideLogo />
      <PrintPage>
      <article className="mt-3 flex w-full flex-col gap-5 pb-10">
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sage-tint text-primary">
            <Icon name="volunteer_activism" size={24} />
          </span>
          <div className="flex flex-col">
            <span className="t-label-sm font-semibold tracking-wider text-primary uppercase">dari {care.authorName}</span>
            <span className="t-body-sm text-text-muted">
              {care.dateLabel} · {care.timeLabel}
            </span>
          </div>
          <PrintButton />
        </div>

        <h1 className="t-headline-sm leading-snug text-on-surface">{care.title}</h1>
        <BlogContent doc={care.message} />
        <CareFiles files={care.files} />
      </article>
      </PrintPage>
    </>
  );
}
