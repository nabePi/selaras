import { z } from "zod";
import { adminRoute, ok, readJson } from "@/lib/server/route";
import { setAssessmentVisible } from "@/server/admin/assessment";
import { parseKind } from "@/server/admin/kind";

const schema = z.object({ visible: z.boolean() });

export const PATCH = adminRoute<{ kind: string }>(async ({ request, params }) => {
  const { visible } = await readJson(request, schema);
  await setAssessmentVisible(parseKind(params.kind), visible);
  return ok({ visible });
});
