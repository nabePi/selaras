import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FocusHeader } from "@/components/focus-header";
import { Icon } from "@/components/icon";
import { NOTIFICATION_STYLE } from "@/components/notification-style";
import { requireMemberPage } from "@/lib/server/session";
import { timeAgoId } from "@/lib/server/time";
import { openNotification } from "@/server/member/notifications";

export const metadata: Metadata = { title: "Detail Notifikasi" };

export default async function NotifikasiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireMemberPage();
  // Membuka detail otomatis menandai notifikasi sudah dibaca.
  const n = await openNotification(user.id, id);
  if (!n) notFound();
  const style = NOTIFICATION_STYLE[n.kind];

  return (
    <>
      <FocusHeader title="Notifikasi" backHref="/notifikasi" hideLogo />
      <article className="mt-3 flex w-full flex-col gap-4 pb-10">
        <div className="flex items-center gap-3">
          <span className={`flex size-12 shrink-0 items-center justify-center rounded-full ${style.tone}`}>
            <Icon name={style.icon} size={24} />
          </span>
          <div className="flex flex-col">
            <span className="t-label-sm font-semibold tracking-wider text-primary uppercase">{style.label}</span>
            <span className="t-body-sm text-text-muted">{timeAgoId(n.createdAt)}</span>
          </div>
        </div>

        <h1 className="t-headline-sm leading-snug text-on-surface">{n.title}</h1>
        <p className="t-body-md leading-relaxed whitespace-pre-line text-on-surface-variant">{n.detail}</p>

        {n.href && (
          <Link
            href={n.href}
            className="t-title-sm flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.99]"
          >
            <span>{n.actionLabel ?? "Buka"}</span>
            <Icon name="arrow_forward" size={18} />
          </Link>
        )}
      </article>
    </>
  );
}
