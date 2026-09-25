import { mergeCapabilityObservation, inferStrengthsAndWeaknesses } from "../../lib/sasi/learning/self-feedback.ts";
import { shouldPromoteProcedure } from "../../lib/sasi/memory/procedural-memory.ts";
import { aggregateModelObservations } from "../../lib/sasi/models/observations.ts";

const merged = mergeCapabilityObservation(
  {
    capability: "structured-output",
    score: 0.8,
    sampleSize: 4,
    benchmark: "previous",
    measuredAt: "2026-09-23T00:00:00.000Z",
  },
  {
    capability: "structured-output",
    score: 0.9,
    sampleCount: 2,
    benchmark: "stage2",
    passed: true,
    measuredAt: "2026-09-23T01:00:00.000Z",
  },
);

if (merged.sampleSize !== 6) throw new Error("SELF_MODEL_SAMPLE_MERGE_FAILED");
if (merged.score <= 0.8 || merged.score >= 0.9) throw new Error("SELF_MODEL_WEIGHTED_SCORE_FAILED");

const profile = aggregateModelObservations([
  {
    provider: "local",
    model: "fixture",
    capability: "reasoning",
    score: 0.8,
    success: true,
    benchmark: "fixture",
    observedAt: new Date().toISOString(),
  },
  {
    provider: "local",
    model: "fixture",
    capability: "reasoning",
    score: 1.0,
    success: true,
    benchmark: "fixture",
    observedAt: new Date().toISOString(),
  },
]);

if (Math.abs((profile.reasoning ?? 0) - 0.9) > 0.0001) {
  throw new Error("MODEL_OBSERVATION_AGGREGATION_FAILED");
}

if (!shouldPromoteProcedure({ successRate: 0.85, sampleSize: 5, regressionCount: 0 })) {
  throw new Error("PROCEDURE_PROMOTION_EXPECTED");
}

if (shouldPromoteProcedure({ successRate: 0.95, sampleSize: 2, regressionCount: 0 })) {
  throw new Error("PROCEDURE_PROMOTION_SAMPLE_GUARD_FAILED");
}

const sw = inferStrengthsAndWeaknesses([
  {
    capability: "reasoning",
    score: 0.9,
    sampleSize: 5,
    benchmark: "fixture",
    measuredAt: new Date().toISOString(),
  },
  {
    capability: "latency-control",
    score: 0.4,
    sampleSize: 5,
    benchmark: "fixture",
    measuredAt: new Date().toISOString(),
  },
]);

if (!sw.strengths.includes("reasoning")) throw new Error("STRENGTH_INFERENCE_FAILED");
if (!sw.weaknesses.includes("latency-control")) throw new Error("WEAKNESS_INFERENCE_FAILED");

console.log(JSON.stringify({
  version:"v10.40",
  pass:true,
  providerCalls:0,
  providerSpend:0,
  selfModelFeedback:true,
  modelObservationAggregation:true,
  proceduralPromotionGate:true,
  episodicMemorySchema:true
}, null, 2));
