import { adminRoute, ok } from "@/lib/server/route";
import { createCoacheeCare } from "@/server/admin/coachee-care";

export const POST = adminRoute<{ id: string }>(async ({ request, params }) =>
  ok(await createCoacheeCare(params.id, await request.json().catch(() => null))),
);
