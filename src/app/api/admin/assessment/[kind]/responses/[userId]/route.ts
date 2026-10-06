import { notFound } from "@/lib/server/errors";
import { adminRoute, ok } from "@/lib/server/route";
import { getAssessmentResponse } from "@/server/admin/assessment";
import { parseKind } from "@/server/admin/kind";

export const GET = adminRoute<{ kind: string; userId: string }>(async ({ params }) => {
  const response = await getAssessmentResponse(parseKind(params.kind), params.userId);
  if (!response) throw notFound("Jawaban");
  return ok(response);
});
