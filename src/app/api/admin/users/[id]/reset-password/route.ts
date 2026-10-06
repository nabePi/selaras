import { adminRoute, ok, requestOrigin } from "@/lib/server/route";
import { requestPasswordReset } from "@/server/admin/users";

export const POST = adminRoute<{ id: string }>(async ({ request, params }) => {
  await requestPasswordReset(params.id, requestOrigin(request));
  return ok({ id: params.id, sent: true });
});
