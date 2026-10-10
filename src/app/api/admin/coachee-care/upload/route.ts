import { adminRoute, ok } from "@/lib/server/route";
import { createCareUploadUrl } from "@/server/admin/coachee-care";

export const POST = adminRoute(async ({ request }) => ok(await createCareUploadUrl(await request.json().catch(() => null))));
