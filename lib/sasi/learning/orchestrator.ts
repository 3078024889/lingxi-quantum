import { randomUUID } from "node:crypto";
import type { SasiTeacherLearningRunInput } from "@/lib/sasi/teachers/runtime";
import { runTeacherLearning } from "@/lib/sasi/teachers/runtime";
import { buildKnowledgeUnitDraft } from "@/lib/sasi/knowledge/knowledge-draft";
import type { SasiLearningRunTrace } from "@/lib/sasi/learning/learning-run";
import type { SasiModelObservation } from "@/lib/sasi/models/observations";
import type { SasiEpisodicMemoryRecord } from "@/lib/sasi/memory/episodic-memory";

export async function runSasiLearningCycle(
  input: SasiTeacherLearningRunInput,
) {
  const startedAt = new Date().toISOString();
  const result = await runTeacherLearning(input);

  const state: SasiLearningRunTrace["state"] =
    result.decision.action === "candidate-ready"
      ? "ready-for-promotion"
      : result.decision.action === "needs-evidence"
        ? "needs-evidence"
        : "rejected";

  const knowledgeUnit =
    result.decision.action === "candidate-ready"
      ? buildKnowledgeUnitDraft({
          candidate: result.candidate,
          sources: [result.source],
          decision: result.decision,
        })
      : null;

  const run: SasiLearningRunTrace = {
    id: randomUUID(),
    userId: input.source.ownerUserId ?? null,
    projectId: input.source.projectId ?? null,
    sourceId: result.source.id,
    candidateId: result.candidate.id,
    state,
    extractorTeacherId: input.extractor.id,
    criticTeacherIds: input.critic ? [input.critic.id] : [],
    providerTrace: result.modelTrace.map((item) => ({
      role: item.role === "critic" ? "critic" : "extractor",
      provider: item.provider,
      model: item.model,
    })),
    reviews: result.reviews,
    knowledgeUnit,
    usage: {
      ...result.usage,
      currency: null,
    },
    failureCode: null,
    createdAt: startedAt,
    updatedAt: new Date().toISOString(),
  };

  const modelObservations: SasiModelObservation[] = result.modelTrace.map(
    (trace) => ({
      provider: trace.provider,
      model: trace.model,
      capability:
        trace.role === "critic" ? "reasoning" : "structured-output",
      score:
        result.decision.action === "candidate-ready"
          ? 0.85
          : result.decision.action === "needs-evidence"
            ? 0.65
            : 0.35,
      success: result.decision.action !== "reject",
      benchmark: "sasi-learning-cycle-v1",
      observedAt: new Date().toISOString(),
    }),
  );

  const episode: SasiEpisodicMemoryRecord = {
    id: randomUUID(),
    userId: input.source.ownerUserId ?? null,
    projectId: input.source.projectId ?? null,
    taskFamily: "knowledge-ingestion",
    taskSummary: `Learn from source: ${input.source.title}`,
    outcome:
      result.decision.action === "candidate-ready"
        ? "success"
        : result.decision.action === "needs-evidence"
          ? "partial"
          : "failure",
    failureCodes:
      result.decision.action === "candidate-ready"
        ? []
        : result.decision.reasons,
    observations: [
      `teacherCalls=${result.usage.calls}`,
      `decision=${result.decision.action}`,
    ],
    lessons:
      result.decision.action === "needs-evidence"
        ? ["Additional non-model evidence is required before promotion."]
        : [],
    evidenceRefs: [result.source.id],
    createdAt: new Date().toISOString(),
  };

  return {
    ...result,
    learningRun: run,
    knowledgeUnit,
    modelObservations,
    episode,
  };
}
