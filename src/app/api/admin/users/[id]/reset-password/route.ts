import { adminRoute, ok } from "@/lib/server/route";
import { resetToDefaultPassword } from "@/server/admin/users";

export const POST = adminRoute<{ id: string }>(async ({ params }) => ok(await resetToDefaultPassword(params.id)));
