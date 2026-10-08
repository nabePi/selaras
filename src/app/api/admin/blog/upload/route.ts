import { adminRoute, ok } from "@/lib/server/route";
import { createBlogUploadUrl } from "@/server/blog";

export const POST = adminRoute(async ({ request }) => {
  const body = await request.json().catch(() => null);
  return ok(await createBlogUploadUrl(body));
});
