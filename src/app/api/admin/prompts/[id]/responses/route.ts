import { notFound } from "@/lib/server/errors";
import { adminRoute, ok } from "@/lib/server/route";
import { getPrompt, getPromptResponses } from "@/server/admin/prompts";

export const GET = adminRoute<{ id: string }>(async ({ params }) => {
  const prompt = await getPrompt(params.id);
  if (!prompt || prompt.status !== "terbit") throw notFound("Prompt terbit");
  return ok(await getPromptResponses(prompt));
});
