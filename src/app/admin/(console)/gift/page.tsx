import type { Metadata } from "next";
import { GiftManager } from "@/components/admin/gift-manager";
import { requireAdminPage } from "@/lib/server/session";
import { giftAdminOverview } from "@/server/admin/gift";

export const metadata: Metadata = { title: "Gift" };
export default async function AdminGiftPage() {
  await requireAdminPage();
  return <GiftManager initial={await giftAdminOverview()} />;
}
