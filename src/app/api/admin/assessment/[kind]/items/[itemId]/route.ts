import { adminRoute, ok, readJson } from "@/lib/server/route";
import { deleteItem, updateItem } from "@/server/admin/assessment";
import { parseKind } from "@/server/admin/kind";
import { assessmentItemSchema } from "@/server/admin/schemas";

type P = { kind: string; itemId: string };

export const PATCH = adminRoute<P>(async ({ request, params }) =>
  ok(await updateItem(parseKind(params.kind), params.itemId, await readJson(request, assessmentItemSchema))),
);

export const DELETE = adminRoute<P>(async ({ params }) => {
  await deleteItem(parseKind(params.kind), params.itemId);
  return ok({ id: params.itemId, deleted: true });
});
