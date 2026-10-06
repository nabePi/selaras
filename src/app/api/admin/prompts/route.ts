import { adminRoute, ok, readJson } from "@/lib/server/route";
import { createPrompt, listPrompts } from "@/server/admin/prompts";
import { promptSchema } from "@/server/admin/schemas";

export const GET = adminRoute(async () => ok(await listPrompts()));

export const POST = adminRoute(async ({ request }) => {
  const prompt = await createPrompt(await readJson(request, promptSchema));
  return ok(prompt, { status: 201 });
});
