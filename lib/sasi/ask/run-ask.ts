import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { buildDeterministicAskAnswer } from "@/lib/sasi/ask/prompt";
import { retrieveFoundryContext } from "@/lib/sasi/ask/retrieve";
import { routeSasiTask } from "@/lib/sasi-kernel/policy/router";

export type RunSasiAskInput = {
  userId: string;
  question: string;
  admin: SupabaseClient;
};

export type AskCitation = {
  id: string;
  title: string;
  tier?: string;
};

export type RunSasiAskResult = {
  answer: string;
  citations: AskCitation[];
  retrievedCount: number;
  model?: string;
  grounded: boolean;
  generation: "llm" | "deterministic";
};

const MIN_Q = 1;
const MAX_Q = 2000;

export function validateAskQuestion(question: unknown): { ok: true; question: string } | { ok: false; error: string } {
  if (typeof question !== "string") return { ok: false, error: "QUESTION_INVALID" };
  const trimmed = question.trim();
  if (trimmed.length < MIN_Q || trimmed.length > MAX_Q) return { ok: false, error: "QUESTION_LENGTH" };
  return { ok: true, question: trimmed };
}

/**
 * Retrieve owned Foundry context and return a zero-model-cost digest.
 * Does not enable training.
 */
export async function runSasiAsk(input: RunSasiAskInput): Promise<RunSasiAskResult> {
  const validated = validateAskQuestion(input.question);
  if (!validated.ok) {
    const err = new Error(validated.error);
    err.name = "AskValidationError";
    throw err;
  }

  const autonomyRoute = routeSasiTask("knowledge-answer");
  if (autonomyRoute.externalModelRequired || autonomyRoute.executionClass !== "deterministic") {
    throw new Error("SASI_AUTONOMY_ROUTE_REGRESSION");
  }

  const retrieved = await retrieveFoundryContext(input.admin, input.userId, validated.question);
  const citations: AskCitation[] = retrieved.items.map((item) => ({
    id: item.id,
    title: item.title,
    tier: item.tier,
  }));
  const retrievedCount = retrieved.items.length + retrieved.characters.length;
  const grounded = retrieved.items.length > 0;
  // Free retrieval never spends platform model funds. Paid inference belongs in
  // the signed quote -> explicit approval -> reservation -> usage settlement path.
  return {
    answer: buildDeterministicAskAnswer({question:validated.question,items:retrieved.items,characters:retrieved.characters}),
    citations, retrievedCount, grounded, generation:"deterministic",
  };
}
