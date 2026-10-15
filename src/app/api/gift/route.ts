import { memberRoute, ok } from "@/lib/server/route";
import { currentGift, openGift } from "@/server/member/gift";

export const GET = memberRoute(async ({ user }) => ok(await currentGift(user.id), { headers: { "Cache-Control": "no-store" } }));
export const POST = memberRoute(async ({ user }) => ok(await openGift(user.id), { headers: { "Cache-Control": "no-store" } }));
