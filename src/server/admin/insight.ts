import "server-only";
import { cache } from "react";
import { computeInsight } from "@/lib/insight";
import { listItems, getAssessmentResponses } from "./assessment";
import { getPromptResponses, listPrompts } from "./prompts";
import { listUsers } from "./users";

export const getInsight = cache(async () => {
  const [users, items, pre, post, prompts] = await Promise.all([
    listUsers(),
    Promise.all([listItems("pre"), listItems("post")]),
    getAssessmentResponses("pre"),
    getAssessmentResponses("post"),
    listPrompts(),
  ]);
  const published = prompts.filter((p) => p.status === "terbit");
  const responses = await Promise.all(published.map((p) => getPromptResponses(p)));

  return computeInsight({
    participants: users.filter((u) => u.status === "active"),
    items: { pre: items[0], post: items[1] },
    pre,
    post,
    prompts: published.map((prompt, i) => ({ prompt, responses: responses[i] })),
  });
});
