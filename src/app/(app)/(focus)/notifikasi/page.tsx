import type { Metadata } from "next";
import Link from "next/link";
import { FocusHeader } from "@/components/focus-header";
import { Icon } from "@/components/icon";
import { NOTIFICATION_STYLE } from "@/components/notification-style";
import { requireMemberPage } from "@/lib/server/session";
import { timeAgoId } from "@/lib/server/time";
import { listNotifications, type NotificationDto } from "@/server/member/notifications";

export const metadata: Metadata = { title: "Notifikasi" };

export default async function NotifikasiPage() {
  const user = await requireMemberPage();
  const notifications = await listNotifications(user.id);

  return (
    <>
      <FocusHeader title="Notifikasi" backHref="/home" hideLogo />
      <div className="flex w-full flex-col gap-2 pb-10 pt-2">
        {notifications.length === 0 ? (
          <p className="t-body-md rounded-2xl bg-surface-container-low p-4 text-center text-text-muted">
            Belum ada notifikasi.
          </p>
        ) : (
          notifications.map((n) => <NotificationCard key={n.id} notification={n} />)
        )}
      </div>
    </>
  );
}

function NotificationCard({ notification: n }: { notification: NotificationDto }) {
  const style = NOTIFICATION_STYLE[n.kind];
  return (
    <Link
      href={`/notifikasi/${n.id}`}
      aria-label={`${n.title}${n.read ? "" : " (belum dibaca)"}. Buka detail`}
      className={`flex items-start gap-3 rounded-2xl p-3.5 shadow-sm transition-all hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.99] ${
        n.read ? "bg-surface-container-lowest" : "bg-surface-container-low"
      }`}
    >
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${style.tone}`}>
        <Icon name={style.icon} size={20} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5">
          <h2 className={`t-title-sm truncate text-on-surface ${n.read ? "" : "font-semibold"}`}>{n.title}</h2>
          {!n.read && <span className="size-2 shrink-0 rounded-full bg-accent-coral" />}
        </div>
        <p className="t-body-sm line-clamp-2 text-text-muted">{n.body}</p>
        <span className="t-label-sm mt-1 text-text-muted">{timeAgoId(n.createdAt)}</span>
      </div>
      <Icon name="chevron_right" size={20} className="mt-2 shrink-0 text-text-muted" />
    </Link>
  );
}
