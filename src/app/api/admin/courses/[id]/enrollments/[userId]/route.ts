import { adminRoute, ok } from "@/lib/server/route";
import { unenrollParticipant } from "@/server/admin/courses";

export const DELETE = adminRoute<{ id: string; userId: string }>(async ({ params }) =>
  ok(await unenrollParticipant(params.id, params.userId)),
);
