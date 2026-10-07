import { adminRoute, ok } from "@/lib/server/route";
import { createCourseUploadUrl } from "@/server/admin/courses";

export const POST = adminRoute(async ({ request }) => {
  const body = await request.json().catch(() => null);
  return ok(await createCourseUploadUrl(body));
});
