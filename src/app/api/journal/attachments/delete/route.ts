import { memberRoute, ok } from "@/lib/server/route";
import { discardUpload } from "@/server/member/attachments";

export const POST = memberRoute(async ({ request, user }) => {
  const body = await request.json().catch(() => null);
  await discardUpload(user.id, body);
  return ok({ deleted: true });
});
