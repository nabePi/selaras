import { adminRoute, ok, readJson } from "@/lib/server/route";
import { createItem, listItems } from "@/server/admin/assessment";
import { parseKind } from "@/server/admin/kind";
import { assessmentItemSchema } from "@/server/admin/schemas";

type P = { kind: string };

export const GET = adminRoute<P>(async ({ params }) => ok(await listItems(parseKind(params.kind))));

export const POST = adminRoute<P>(async ({ request, params }) => {
  const item = await createItem(parseKind(params.kind), await readJson(request, assessmentItemSchema));
  return ok(item, { status: 201 });
});
