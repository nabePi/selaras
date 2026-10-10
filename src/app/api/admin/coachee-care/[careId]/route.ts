import { adminRoute, ok } from "@/lib/server/route";
import { deleteCoacheeCare } from "@/server/admin/coachee-care";

export const DELETE = adminRoute<{ careId: string }>(async ({ params }) => {
  await deleteCoacheeCare(params.careId);
  return ok({ deleted: true });
});
