import Link from "next/link";
import { currentGift, giftSetting } from "@/server/member/gift";
import { GIFT_KINDS } from "@/data/gifts";
import { Icon } from "./icon";

export async function HomeGift({ userId }: { userId: number }) {
  const setting = await giftSetting().catch(() => null);
  if (!setting?.enabled) return null;
  const gift = await currentGift(userId).catch(() => null);
  return (
    <section aria-label="Gift untukmu">
      <Link href="/gift" prefetch={false} className="group relative flex items-center gap-4 overflow-hidden rounded-4xl border border-sage-medium/25 bg-sage-tint px-5 py-6 transition-colors hover:bg-primary-fixed/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-surface-bright/85 text-primary"><Icon name="redeem" size={30} /></span>
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="t-label-sm font-semibold tracking-[0.14em] text-primary uppercase">{gift ? GIFT_KINDS[gift.content.kind].label : "Hadiah kecil untukmu"}</span>
          <span className="t-headline-sm text-on-surface">{gift ? gift.personalTitle ?? gift.content.title : "Ada yang ingin menemani hatimu."}</span>
          <span className="t-body-sm text-on-surface-variant">{gift ? "Baca lagi, pelan-pelan. Hadiah baru setiap 3 hari." : "Sebuah doa, kisah, ayat, atau pesan penuh makna."}</span>
        </span>
        <Icon name="arrow_forward" size={20} className="shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}
