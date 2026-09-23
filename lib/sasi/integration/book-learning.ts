import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type BookLearningEvidence = {
  index: number;
  title: string;
  locator?: string;
  text: string;
};

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function normalizeEvidence(evidence: BookLearningEvidence[]) {
  return evidence.slice(0, 12).map((item) => ({
    index: item.index,
    title: item.title.slice(0, 240),
    locator: (item.locator ?? "").slice(0, 240),
    textHash: sha256(item.text),
    preview: item.text.slice(0, 600),
  }));
}

export async function recordBookAnswerEvent(input: {
  userId: string;
  question: string;
  mode: "book" | "learning" | "research";
  intelligence: "light" | "standard" | "high";
  evidence: BookLearningEvidence[];
  answer: string;
  provider: string;
  model: string;
  chargeFen: number;
  usage: unknown;
}) {
  const admin = createAdminClient();
  const eventId = randomUUID();

  const payload = {
    questionHash: sha256(input.question),
    questionPreview: input.question.slice(0, 500),
    evidence: normalizeEvidence(input.evidence),
    answerHash: sha256(input.answer),
    answerPreview: input.answer.slice(0, 1200),
    provider: input.provider,
    model: input.model,
    chargeFen: input.chargeFen,
    usage: input.usage ?? null,
    epistemicState: "model-derived-hypothesis",
    promotionState: "not-auto-promotable",
  };

  const { error } = await admin.from("sasi_runtime_learning_events").insert({
    id: eventId,
    user_id: input.userId,
    event_kind: "book-answer",
    scope: "user-private",
    mode: input.mode,
    intelligence: input.intelligence,
    payload,
  });

  if (error) throw new Error(`SASI_BOOK_EVENT_INSERT_FAILED:${error.code ?? "unknown"}`);
  return eventId;
}
