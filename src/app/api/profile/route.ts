import { memberRoute, ok } from "@/lib/server/route";
import { getProfile, updateProfile } from "@/server/member/profile";

export const GET = memberRoute(async ({ user }) => ok(await getProfile(user.id)));

export const PATCH = memberRoute(async ({ request, user }) => {
  const body = await request.json().catch(() => null);
  return ok(await updateProfile(user.id, body));
});
