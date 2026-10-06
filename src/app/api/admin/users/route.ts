import { adminRoute, ok } from "@/lib/server/route";
import { listUsers } from "@/server/admin/users";

export const GET = adminRoute(async () => ok(await listUsers()));
