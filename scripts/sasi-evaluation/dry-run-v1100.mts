import { detectPromotionDegradation } from "../../lib/sasi/evaluation/post-promotion-health.ts";
import { decidePostPromotionAction } from "../../lib/sasi/learning/post-promotion-decision.ts";
import { buildRollbackPlan } from "../../lib/sasi/learning/rollback-plan.ts";
import { validatePromotionLineage } from "../../lib/sasi/learning/promotion-lineage.ts";

const stable = {
  id:"stable-1",
  strategyId:"strategy-1",
  repositoryHeadSha:"head-1",
  benchmarkEvidenceId:"evidence-1",
  promotedAt:new Date().toISOString(),
  promotedBy:"human",
  previousStableSnapshotId:null,
  state:"stable" as const,
  metadata:{},
};

const canary = {
  id:"canary-2",
  strategyId:"strategy-2",
  repositoryHeadSha:"head-2",
  benchmarkEvidenceId:"evidence-2",
  promotedAt:new Date().toISOString(),
  promotedBy:"human",
  previousStableSnapshotId:"stable-1",
  state:"canary" as const,
  metadata:{},
};

const lineage = validatePromotionLineage([stable,canary]);
if(!lineage.ok) throw new Error("LINEAGE_VALIDATION_FAILED");

const policy = {
  minSamples:10,
  minCorrectness:0.85,
  minQuality:0.80,
  minStability:0.85,
  maxLatencyMs:1000,
  maxCostMinor:100,
  maxErrorRate:0.10,
};

const insufficient = decidePostPromotionAction({
  observation:{
    snapshotId:"canary-2",
    correctness:0.5,
    quality:0.5,
    stability:0.5,
    latencyMs:2000,
    costMinor:200,
    errorRate:0.5,
    sampleCount:3,
    observedAt:new Date().toISOString(),
  },
  policy,
});
if(insufficient.action!=="observe") throw new Error("SAMPLE_GUARD_FAILED");

const degradedObservation = {
  snapshotId:"canary-2",
  correctness:0.70,
  quality:0.75,
  stability:0.70,
  latencyMs:1200,
  costMinor:120,
  errorRate:0.20,
  sampleCount:20,
  observedAt:new Date().toISOString(),
};
const degraded = detectPromotionDegradation(degradedObservation,policy);
if(!degraded.degraded || !degraded.decisive) throw new Error("DEGRADATION_NOT_DETECTED");

const decision = decidePostPromotionAction({
  observation:degradedObservation,
  policy,
});
if(decision.action!=="prepare-rollback") throw new Error("ROLLBACK_PREP_NOT_REQUESTED");

const plan = buildRollbackPlan({
  id:"rollback-1",
  current:canary,
  previousStable:stable,
  reasonCodes:decision.reasons,
});
if(!plan.requiresHumanApproval) throw new Error("HUMAN_APPROVAL_NOT_REQUIRED");
if(plan.toHeadSha!=="head-1") throw new Error("ROLLBACK_TARGET_WRONG");

console.log(JSON.stringify({
  version:"v11.00",
  pass:true,
  lineageValidation:true,
  insufficientSampleGuard:true,
  degradationDetection:true,
  rollbackPreparation:true,
  humanApprovalRequired:true,
  autonomousRollbackExecution:false,
  providerCalls:0,
  providerSpend:0
},null,2));
