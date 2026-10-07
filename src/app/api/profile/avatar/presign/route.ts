import { memberRoute, ok } from "@/lib/server/route";
import { createAvatarUploadUrl } from "@/server/avatar";

export const POST = memberRoute(async ({ request, user }) => {
  const body = await request.json().catch(() => null);
  return ok(await createAvatarUploadUrl(user.id, body));
});
