import Image from "next/image";
import Link from "next/link";
import { requireMemberPage } from "@/lib/server/session";
import { countUnread } from "@/server/member/notifications";
import { Icon } from "./icon";

export async function AppHeader() {
  const user = await requireMemberPage();
  const hasUnread = (await countUnread(user.id)) > 0;

  return (
    <header className="pt-safe fixed top-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 bg-surface/85 shadow-[0_1px_12px_rgba(92,75,62,0.04)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-margin">
        <Link href="/home" aria-label="Selaras Life" className="flex items-center">
          <Image
            src="/images/logo-header.png"
            alt="Selaras Life"
            width={720}
            height={323}
            sizes="100px"
            className="h-11 w-auto"
            priority
          />
        </Link>

        <Link
          href="/notifikasi"
          aria-label="Notifikasi"
          className="relative flex size-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low"
        >
          <Icon name="notifications" size={22} />
          {hasUnread && (
            <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-accent-coral ring-2 ring-surface" />
          )}
        </Link>
      </div>
    </header>
  );
}
