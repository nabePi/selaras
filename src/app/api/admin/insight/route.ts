import { adminRoute, ok } from "@/lib/server/route";
import { getInsight } from "@/server/admin/insight";

export const GET = adminRoute(async () => ok(await getInsight()));
