import { ADMIN_USERS } from "@/data/admin-users";
import {
  ASSESSMENT_SETS,
  type AssessmentKind,
  type AssessmentPart,
} from "@/data/assessment";
import {
  getAssessmentResponses,
  type AssessmentResponse,
} from "@/data/assessment-responses";
import { JOURNAL_PROMPTS } from "@/data/journal-prompts";
import { JOURNAL_FEELINGS } from "@/data/member";
import { getPromptResponses } from "@/data/prompt-responses";

/**
 * Insight agregat admin. Seluruhnya dihitung dari tiga sumber: Pre Assessment,
 * jawaban prompt jurnal, dan Post Assessment.
 */

const mean = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;

function userDimensionScores(kind: AssessmentKind, r: AssessmentResponse) {
  const out: Record<string, number> = {};
  const byDim = new Map<string, number[]>();
  for (const it of ASSESSMENT_SETS[kind]) {
    const v = r.answers[it.id];
    if (v) byDim.set(it.dimension, [...(byDim.get(it.dimension) ?? []), v]);
  }
  for (const [dim, values] of byDim) out[dim] = mean(values)!;
  return out;
}

export function getInsight() {
  const pre = getAssessmentResponses("pre");
  const post = getAssessmentResponses("post");
  const total = pre.length;
  const preDone = pre.filter((r) => r.answeredAt);
  const postDone = post.filter((r) => r.answeredAt);
  const paired = pre.filter((r, i) => r.answeredAt && post[i].answeredAt);

  // --- Pre vs Post ---
  const dimensions: { dimension: string; part: AssessmentPart }[] = [];
  for (const it of ASSESSMENT_SETS.pre) {
    if (!dimensions.some((d) => d.dimension === it.dimension)) {
      dimensions.push({ dimension: it.dimension, part: it.part });
    }
  }
  const preDims = pre.map((r) =>
    r.answeredAt ? userDimensionScores("pre", r) : null,
  );
  const postDims = post.map((r) =>
    r.answeredAt ? userDimensionScores("post", r) : null,
  );

  const dimensionRows = dimensions.map(({ dimension, part }) => {
    const preAvg = mean(
      preDims.flatMap((d) => (d?.[dimension] ? [d[dimension]] : [])),
    );
    const postAvg = mean(
      postDims.flatMap((d) => (d?.[dimension] ? [d[dimension]] : [])),
    );
    const deltas = pre.flatMap((r, i) => {
      const a = preDims[i]?.[dimension];
      const b = postDims[i]?.[dimension];
      return r.answeredAt && post[i].answeredAt && a && b ? [b - a] : [];
    });
    return { dimension, part, pre: preAvg, post: postAvg, delta: mean(deltas) };
  });

  const partRows = (["mindset", "habit"] as const).map((part) => {
    const rows = dimensionRows.filter((d) => d.part === part);
    const avg = (key: "pre" | "post" | "delta") =>
      mean(rows.flatMap((r) => (r[key] === null ? [] : [r[key] as number])));
    return { part, pre: avg("pre"), post: avg("post"), delta: avg("delta") };
  });

  // --- Jurnal ---
  const published = JOURNAL_PROMPTS.filter((p) => p.status === "terbit");
  const promptStats = published
    .map((p) => {
      const responses = getPromptResponses(p);
      return {
        id: p.id,
        title: p.title,
        date: p.date,
        done: responses.filter((r) => r.answeredAt).length,
        total: responses.length,
        responses,
        prompt: p,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const moodCounts = JOURNAL_FEELINGS.map((f) => ({ ...f, count: 0 }));
  const scaleRows: {
    promptTitle: string;
    label: string;
    avg: number;
    n: number;
  }[] = [];
  for (const ps of promptStats) {
    ps.prompt.questions.forEach((q, qi) => {
      const answers = ps.responses.flatMap((r) =>
        r.answers[qi] ? [r.answers[qi]] : [],
      );
      if (q.type === "mood") {
        for (const a of answers) {
          const m = moodCounts.find((f) => a.value.endsWith(f.label));
          if (m) m.count += 1;
        }
      }
      if (q.type === "scale" && answers.length) {
        scaleRows.push({
          promptTitle: ps.title,
          label: q.label,
          avg: mean(answers.map((a) => Number.parseInt(a.value, 10)))!,
          n: answers.length,
        });
      }
    });
  }

  // --- Ringkasan per peserta ---
  const participants = ADMIN_USERS.filter((u) => u.status === "active");
  const people = participants.map((u, i) => {
    const journalDone = promptStats.filter(
      (ps) => ps.responses[i].answeredAt,
    ).length;
    const lastMood = [...promptStats].reverse().flatMap((ps) => {
      const r = ps.responses[i];
      const qi = ps.prompt.questions.findIndex((q) => q.type === "mood");
      return r.answeredAt && qi >= 0 ? [r.answers[qi].value] : [];
    })[0];
    const preScore = mean(
      (["mindset", "habit"] as const).flatMap((p) =>
        pre[i].scores[p] === null ? [] : [pre[i].scores[p]!],
      ),
    );
    const postScore = mean(
      (["mindset", "habit"] as const).flatMap((p) =>
        post[i].scores[p] === null ? [] : [post[i].scores[p]!],
      ),
    );
    const journalRate = promptStats.length
      ? journalDone / promptStats.length
      : 0;
    const flags: string[] = [];
    // Penanda hanya relevan setelah assessment itu mulai diisi siapa pun.
    if (preDone.length > 0 && !pre[i].answeredAt) flags.push("Belum Pre");
    if (postDone.length > 0 && !post[i].answeredAt) flags.push("Belum Post");
    if (promptStats.length && journalRate < 0.6) flags.push("Jurnal rendah");
    return {
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      preScore,
      postScore,
      delta:
        preScore !== null && postScore !== null ? postScore - preScore : null,
      journalDone,
      journalTotal: promptStats.length,
      lastMood: lastMood ?? null,
      flags,
    };
  });

  const journalRate: number | null = promptStats.length
    ? Math.round(
        (promptStats.reduce((a, p) => a + p.done, 0) /
          promptStats.reduce((a, p) => a + p.total, 0)) *
          100,
      )
    : null;
  const topMood = [...moodCounts].sort((a, b) => b.count - a.count)[0];

  return {
    total,
    preDone: preDone.length,
    postDone: postDone.length,
    pairedN: paired.length,
    partRows,
    dimensionRows,
    promptStats,
    moodCounts,
    topMood: topMood.count ? topMood : null,
    scaleRows,
    journalRate,
    people,
  };
}
