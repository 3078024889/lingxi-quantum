import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { SasiLearningRunTrace } from "@/lib/sasi/learning/learning-run";
import type { SasiKnowledgeUnit } from "@/lib/sasi/knowledge/knowledge-unit";
import type { SasiModelObservation } from "@/lib/sasi/models/observations";
import type { SasiEpisodicMemoryRecord } from "@/lib/sasi/memory/episodic-memory";
import type { SasiProceduralMemoryRecord } from "@/lib/sasi/memory/procedural-memory";

export class SasiLearningRepository {
  constructor(private readonly admin: SupabaseClient) {}

  async writeLearningRun(run: SasiLearningRunTrace) {
    const { error } = await this.admin.from("sasi_learning_runs").upsert({
      id: run.id,
      user_id: run.userId ?? null,
      project_id: run.projectId ?? null,
      source_id: run.sourceId,
      candidate_id: run.candidateId,
      state: run.state,
      extractor_teacher_id: run.extractorTeacherId,
      critic_teacher_ids: run.criticTeacherIds,
      provider_trace: run.providerTrace,
      usage: run.usage,
      failure_code: run.failureCode ?? null,
      created_at: run.createdAt,
      updated_at: run.updatedAt,
    });
    if (error) throw new Error(`SASI_LEARNING_RUN_WRITE_FAILED:${error.code ?? "UNKNOWN"}`);
  }

  async writeKnowledgeUnit(unit: SasiKnowledgeUnit) {
    const { error } = await this.admin.from("sasi_knowledge_units").upsert({
      id: unit.id,
      concept: unit.concept,
      domain: unit.domain,
      definition: unit.definition,
      epistemic_state: unit.epistemicState,
      confidence: unit.confidence,
      prerequisites: unit.prerequisites,
      relations: unit.relations,
      conditions: unit.conditions,
      counterexamples: unit.counterexamples,
      common_misconceptions: unit.commonMisconceptions,
      evidence: unit.evidence,
      valid_from: unit.validFrom ?? null,
      valid_until: unit.validUntil ?? null,
      last_verified_at: unit.lastVerifiedAt ?? null,
      supersedes: unit.supersedes ?? null,
      tags: unit.tags,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(`SASI_KNOWLEDGE_WRITE_FAILED:${error.code ?? "UNKNOWN"}`);
  }

  async writeModelObservation(observation: SasiModelObservation) {
    const { error } = await this.admin.from("sasi_model_observations").insert({
      provider: observation.provider,
      model: observation.model,
      capability: observation.capability,
      score: observation.score,
      latency_ms: observation.latencyMs ?? null,
      input_tokens: observation.inputTokens ?? null,
      output_tokens: observation.outputTokens ?? null,
      cost_minor: observation.costMinor ?? null,
      currency: observation.currency ?? null,
      success: observation.success,
      benchmark: observation.benchmark,
      observed_at: observation.observedAt,
    });
    if (error) throw new Error(`SASI_MODEL_OBSERVATION_WRITE_FAILED:${error.code ?? "UNKNOWN"}`);
  }

  async writeEpisode(record: SasiEpisodicMemoryRecord) {
    const { error } = await this.admin.from("sasi_episodic_memory").insert({
      id: record.id,
      user_id: record.userId ?? null,
      project_id: record.projectId ?? null,
      task_family: record.taskFamily,
      task_summary: record.taskSummary,
      outcome: record.outcome,
      strategy_id: record.strategyId ?? null,
      failure_codes: record.failureCodes,
      observations: record.observations,
      lessons: record.lessons,
      evidence_refs: record.evidenceRefs,
      created_at: record.createdAt,
    });
    if (error) throw new Error(`SASI_EPISODE_WRITE_FAILED:${error.code ?? "UNKNOWN"}`);
  }

  async writeProcedure(record: SasiProceduralMemoryRecord) {
    const { error } = await this.admin.from("sasi_procedural_memory").upsert({
      id: record.id,
      task_family: record.taskFamily,
      strategy_id: record.strategyId ?? null,
      title: record.title,
      steps: record.steps,
      success_rate: record.successRate,
      sample_size: record.sampleSize,
      last_used_at: record.lastUsedAt ?? null,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    });
    if (error) throw new Error(`SASI_PROCEDURE_WRITE_FAILED:${error.code ?? "UNKNOWN"}`);
  }
}
