import { notFound } from "@/lib/server/errors";
import { adminRoute, ok } from "@/lib/server/route";
import { getPrompt, getPromptResponse } from "@/server/admin/prompts";

export const GET = adminRoute<{ id: string; userId: string }>(async ({ params }) => {
  const prompt = await getPrompt(params.id);
  if (!prompt || prompt.status !== "terbit") throw notFound("Prompt terbit");
  const response = await getPromptResponse(prompt, params.userId);
  if (!response) throw notFound("Jawaban");
  return ok(response);
});
