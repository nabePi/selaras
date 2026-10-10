import { memberRoute, ok } from "@/lib/server/route";
import { reactToCare } from "@/server/member/coachee-care";

export const POST = memberRoute<{ id: string }>(async ({ request, params, user }) =>
  ok(await reactToCare(user.id, params.id, await request.json().catch(() => null))),
);
