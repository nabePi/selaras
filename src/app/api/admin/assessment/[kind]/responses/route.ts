import { adminRoute, ok } from "@/lib/server/route";
import { getAssessmentResponses } from "@/server/admin/assessment";
import { parseKind } from "@/server/admin/kind";

export const GET = adminRoute<{ kind: string }>(async ({ params }) =>
  ok(await getAssessmentResponses(parseKind(params.kind))),
);
