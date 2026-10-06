import { adminRoute, ok } from "@/lib/server/route";
import { getDashboard } from "@/server/admin/dashboard";

export const GET = adminRoute(async () => ok(await getDashboard()));
