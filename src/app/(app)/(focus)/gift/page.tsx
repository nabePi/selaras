import type { Metadata } from "next";
import { Noto_Naskh_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import { FocusHeader } from "@/components/focus-header";
import { GiftReader } from "@/components/gift-reader";
import { requireMemberPage } from "@/lib/server/session";
import { currentGift, giftSetting } from "@/server/member/gift";

const arabic = Noto_Naskh_Arabic({ subsets: ["arabic"], weight: ["400"], variable: "--font-gift-arabic", display: "swap" });
export const metadata: Metadata = { title: "Hadiah untukmu", robots: { index: false, follow: false } };

export default async function GiftPage() {
  const user = await requireMemberPage();
  const setting = await giftSetting();
  if (!setting?.enabled) notFound();
  const gift = await currentGift(user.id);
  return <div className={arabic.variable}><FocusHeader title="Hadiah untukmu" backHref="/home" /><GiftReader key={gift?.id ?? "new"} initial={gift} /></div>;
}
