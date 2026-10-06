import { memberRoute, ok } from "@/lib/server/route";
import { submitEntry } from "@/server/member/journal";

export const POST = memberRoute(async ({ request, user }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  return ok(await submitEntry(user.id, body), { status: 201 });
});
