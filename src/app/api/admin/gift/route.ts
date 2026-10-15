import { z } from "zod";
import { adminRoute, ok, readJson } from "@/lib/server/route";
import { giftAdminOverview, setGiftEnabled } from "@/server/admin/gift";

export const GET = adminRoute(async () => ok(await giftAdminOverview(), { headers: { "Cache-Control": "no-store" } }));
export const PATCH = adminRoute(async ({ request }) => {
  const { enabled } = await readJson(request, z.object({ enabled: z.boolean() }));
  return ok(await setGiftEnabled(enabled));
});
