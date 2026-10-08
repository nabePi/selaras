import { adminRoute, ok } from "@/lib/server/route";
import { deleteComment } from "@/server/blog";

export const DELETE = adminRoute<{ id: string }>(async ({ params }) => {
  await deleteComment(params.id);
  return ok({ deleted: true });
});
