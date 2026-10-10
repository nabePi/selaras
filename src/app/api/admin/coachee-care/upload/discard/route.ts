import { adminRoute, ok } from "@/lib/server/route";
import { discardCareUpload } from "@/server/admin/coachee-care";

export const POST = adminRoute(async ({ request }) => {
  await discardCareUpload(await request.json().catch(() => null));
  return ok({ discarded: true });
});
