import { memberRoute, ok } from "@/lib/server/route";
import { createUploadUrl } from "@/server/member/attachments";

export const POST = memberRoute(async ({ request, user }) => {
  const body = await request.json().catch(() => null);
  return ok(await createUploadUrl(user.id, body));
});
