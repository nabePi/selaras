import { adminRoute, ok } from "@/lib/server/route";
import { activateUser } from "@/server/admin/users";

export const POST = adminRoute<{ id: string }>(async ({ params }) => {
  await activateUser(params.id);
  return ok({ id: params.id, status: "active" });
});
