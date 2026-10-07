import { adminRoute, ok } from "@/lib/server/route";
import { enrollParticipant, getEnrollments } from "@/server/admin/courses";

type P = { id: string };

export const GET = adminRoute<P>(async ({ params }) => ok(await getEnrollments(params.id)));

export const POST = adminRoute<P>(async ({ request, params }) => {
  const body = await request.json().catch(() => null);
  return ok(await enrollParticipant(params.id, body), { status: 201 });
});
