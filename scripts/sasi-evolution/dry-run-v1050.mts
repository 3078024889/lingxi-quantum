import { buildEvolutionCycle } from "../../lib/sasi/learning/evolution-cycle.ts";
import { decideEvolutionPromotion } from "../../lib/sasi/learning/promotion-record.ts";
import { evaluateBenchmark } from "../../lib/sasi/learning/benchmark-registry.ts";

const episode = {
  id: "episode-fixture",
  taskFamily: "knowledge-ingestion",
  taskSummary: "fixture",
  outcome: "failure",
  strategyId: "strategy-parent",
  failureCodes: ["INSUFFICIENT_EVIDENCE"],
  observations: ["fixture"],
  lessons: [],
  evidenceRefs: ["source-fixture"],
  createdAt: new Date().toISOString(),
};

const parent = {
  id: "strategy-parent",
  taskFamily: "knowledge-ingestion",
  version: 1,
  perception: {},
  retrieval: {
    semanticWeight: 0.25,
    episodicWeight: 0.25,
    proceduralWeight: 0.25,
    selfWeight: 0.25,
  },
  reasoningStages: ["retrieve", "reason"],
  modelRoles: {},
  toolPolicy: {},
  reflectionDepth: 1,
  parentIds: [],
};

const cycle = buildEvolutionCycle({
  episode,
  parentStrategy: parent,
  failureCategory: "knowledge-gap",
  failureObservation: "Candidate lacked enough evidence.",
  likelyCause: "Retrieval stopped too early.",
  affectedCapabilities: ["search-grounding"],
  hypothesisStatement: "Add targeted self-critique before evidence promotion.",
  expectedEffect: "Reduce insufficient-evidence failures.",
  interventionTarget: "reasoning-stages",
});

if (cycle.state !== "awaiting-sandbox") throw new Error("CYCLE_STATE_FAILED");
if (cycle.strategyMutation.child.reflectionDepth !== 2) throw new Error("MUTATION_DEPTH_FAILED");
if (!cycle.strategyMutation.child.reasoningStages.includes("targeted-self-critique")) {
  throw new Error("MUTATION_STAGE_FAILED");
}

const definition = {
  id: "sealed-fixture",
  taskFamily: "knowledge-ingestion",
  kind: "sealed",
  version: 1,
  fixtureHash: "abc123",
  minPassRate: 0.8,
  minSamples: 5,
  maxRegressionCount: 0,
};

const pass = {
  benchmarkId: "sealed-fixture",
  strategyId: cycle.strategyMutation.child.id,
  passRate: 0.9,
  sampleCount: 10,
  regressionCount: 0,
  fixtureHash: "abc123",
  passed: true,
  measuredAt: new Date().toISOString(),
};

if (!evaluateBenchmark(definition, pass).ok) throw new Error("BENCHMARK_GATE_FAILED");

const promotion = decideEvolutionPromotion({
  id: "promotion-fixture",
  strategyId: cycle.strategyMutation.child.id,
  hypothesisId: cycle.hypothesis.id,
  development: pass,
  sealed: pass,
  regression: pass,
  sandboxPassed: true,
  humanApproved: false,
  testedHeadSha: "same",
  currentHeadSha: "same",
});

if (promotion.decision !== "reject") throw new Error("HUMAN_APPROVAL_GATE_FAILED");
if (!promotion.reasons.includes("HUMAN_APPROVAL_REQUIRED")) {
  throw new Error("HUMAN_APPROVAL_REASON_MISSING");
}

const approved = decideEvolutionPromotion({
  id: "promotion-fixture-2",
  strategyId: cycle.strategyMutation.child.id,
  hypothesisId: cycle.hypothesis.id,
  development: pass,
  sealed: pass,
  regression: pass,
  sandboxPassed: true,
  humanApproved: true,
  testedHeadSha: "same",
  currentHeadSha: "same",
});

if (approved.decision !== "promote") throw new Error("PROMOTION_EXPECTED");

console.log(JSON.stringify({
  version:"v10.50",
  pass:true,
  failureAttribution:true,
  hypothesis:true,
  strategyMutation:true,
  benchmarkGate:true,
  humanApprovalGate:true,
  promotionDecision:true,
  providerCalls:0,
  providerSpend:0
}, null, 2));
