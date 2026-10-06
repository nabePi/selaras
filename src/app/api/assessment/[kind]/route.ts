import { memberRoute, ok } from "@/lib/server/route";
import { parseKind } from "@/server/admin/kind";
import { submitAssessment } from "@/server/member/assessment";

export const POST = memberRoute<{ kind: string }>(async ({ request, params, user }) => {
  const body = await request.json().catch(() => null);
  await submitAssessment(user.id, parseKind(params.kind), body);
  return ok({ saved: true }, { status: 201 });
});
