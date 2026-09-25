import { SasiTeacherAdapterRegistry } from "../../lib/sasi/teachers/adapter.ts";
import { SasiMockTeacherAdapter } from "../../lib/sasi/teachers/mock-adapter.ts";
import { runTeacherLearning } from "../../lib/sasi/teachers/runtime.ts";
import { buildKnowledgeUnitDraft } from "../../lib/sasi/knowledge/knowledge-draft.ts";
import { knowledgeToSemanticMemory } from "../../lib/sasi/memory/semantic-consolidation.ts";
import { assertKnowledgeReadScope } from "../../lib/sasi/knowledge/privacy-scope.ts";

const registry = new SasiTeacherAdapterRegistry();
registry.register(new SasiMockTeacherAdapter());

const teacher = {
  id: "mock-teacher",
  provider: "local",
  model: "mock-teacher-v1030",
  enabled: true,
  verified: true,
  byok: false,
  roles: ["extractor", "critic"],
  domains: ["physics"],
  reliability: 0.95,
  costWeight: 0,
  latencyWeight: 0,
};

const result = await runTeacherLearning({
  source: {
    kind: "reference",
    title: "V10.30 deterministic fixture",
    text:
      "水的沸点取决于外界压力。在标准大气压附近，纯水的沸点约为100摄氏度；在高海拔低压环境中沸点会降低。",
    language: "zh-CN",
  },
  extractor: teacher,
  critic: teacher,
  registry,
  budget: {
    maxCalls: 2,
    maxInputTokens: 1000,
    maxOutputTokens: 1000,
    maxCostMinor: 0,
  },
});

if (result.decision.action !== "candidate-ready") {
  throw new Error(`DRY_RUN_DECISION_${result.decision.action}`);
}

const unit = buildKnowledgeUnitDraft({
  candidate: result.candidate,
  sources: [result.source],
  decision: result.decision,
});

const semantic = knowledgeToSemanticMemory(unit);

assertKnowledgeReadScope({
  requesterUserId: "user-a",
  scope: {
    ownerUserId: "user-a",
    visibility: "private",
  },
});

let privacyDenied = false;
try {
  assertKnowledgeReadScope({
    requesterUserId: "user-b",
    scope: {
      ownerUserId: "user-a",
      visibility: "private",
    },
  });
} catch {
  privacyDenied = true;
}
if (!privacyDenied) throw new Error("CROSS_USER_SCOPE_NOT_BLOCKED");

console.log(
  JSON.stringify(
    {
      version: "v10.30",
      pass: true,
      networkCalls: 0,
      providerSpend: 0,
      teacherCalls: result.usage.calls,
      decision: result.decision.action,
      knowledgeState: unit.epistemicState,
      semanticConcept: semantic.concept,
      crossUserScopeBlocked: privacyDenied,
    },
    null,
    2,
  ),
);
