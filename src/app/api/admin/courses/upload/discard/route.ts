import { adminRoute, ok } from "@/lib/server/route";
import { discardCourseUpload } from "@/server/admin/courses";

export const POST = adminRoute(async ({ request }) => {
  const body = await request.json().catch(() => null);
  await discardCourseUpload(body);
  return ok({ discarded: true });
});
