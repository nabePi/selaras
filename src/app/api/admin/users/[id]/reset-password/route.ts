import { adminRoute, ok } from "@/lib/server/route";
import { requestPasswordReset } from "@/server/admin/users";

export const POST = adminRoute<{ id: string }>(async ({ request, params }) => {
  await requestPasswordReset(params.id, new URL(request.url).origin);
  return ok({ id: params.id, sent: true });
});
