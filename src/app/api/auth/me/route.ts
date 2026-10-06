import { ApiError } from "@/lib/server/errors";
import { ok, publicRoute } from "@/lib/server/route";
import { getSessionUser } from "@/lib/server/session";

export const GET = publicRoute(async ({ request }) => {
  const scope = new URL(request.url).searchParams.get("scope") === "admin" ? "admin" : "member";
  const user = await getSessionUser(scope);
  if (!user) throw new ApiError(401, "Belum masuk.");
  return ok(user);
});
