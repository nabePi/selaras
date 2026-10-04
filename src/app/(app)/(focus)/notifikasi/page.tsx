import type { Metadata } from "next";
import { FocusHeader } from "@/components/focus-header";
import { Icon } from "@/components/icon";
import { NOTIFICATIONS, type AppNotification } from "@/data/member";

export const metadata: Metadata = { title: "Notifikasi" };

export default function NotifikasiPage() {
  return (
    <>
      <FocusHeader title="Notifikasi" backHref="/home" hideLogo />
      <div className="flex w-full flex-col gap-2 pb-10 pt-2">
        {NOTIFICATIONS.length === 0 ? (
          <p className="t-body-md rounded-2xl bg-surface-container-low p-4 text-center text-text-muted">
            Belum ada notifikasi.
          </p>
        ) : (
          NOTIFICATIONS.map((n) => <NotificationCard key={n.id} notification={n} />)
        )}
      </div>
    </>
  );
}

function NotificationCard({ notification: n }: { notification: AppNotification }) {
  return (
    <article
      className={`flex items-start gap-3 rounded-2xl p-3.5 shadow-sm ${
        n.read ? "bg-surface-container-lowest" : "bg-surface-container-low"
      }`}
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${n.iconTone}`}
      >
        <Icon name={n.icon} size={20} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5">
          <h2 className="t-title-sm truncate text-on-surface">{n.title}</h2>
          {!n.read && <span className="size-2 shrink-0 rounded-full bg-accent-coral" />}
        </div>
        <p className="t-body-sm text-text-muted">{n.body}</p>
        <span className="t-label-sm mt-1 text-text-muted">{n.time}</span>
      </div>
    </article>
  );
}
