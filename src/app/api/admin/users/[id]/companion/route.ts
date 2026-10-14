import { adminRoute, ok, readJson } from "@/lib/server/route";
import { companionSchema, setUserCompanion } from "@/server/admin/users";

export const PATCH = adminRoute<{ id: string }>(async ({ request, params }) => {
  const input = await readJson(request, companionSchema);
  return ok(await setUserCompanion(params.id, input.companion));
});
