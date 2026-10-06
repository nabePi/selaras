import { ASSESSMENT_KINDS, type AssessmentKind } from "@/data/assessment";
import { notFound } from "@/lib/server/errors";

export const isKind = (v: string): v is AssessmentKind => Object.hasOwn(ASSESSMENT_KINDS, v);

export function parseKind(v: string): AssessmentKind {
  if (!isKind(v)) throw notFound("Jenis assessment");
  return v;
}
