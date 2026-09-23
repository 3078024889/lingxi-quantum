import fs from "node:fs";
import path from "node:path";

const repoRoot = process.argv[2] || process.cwd();

const required = [
  "lib/sasi/core/core-zero.ts",
  "lib/sasi/core/identity.ts",
  "lib/sasi/knowledge/ontology.ts",
  "lib/sasi/knowledge/runtime.ts",
  "lib/sasi/memory/semantic-consolidation.ts",
  "lib/sasi/memory/episodic-memory.ts",
  "lib/sasi/memory/procedural-memory.ts",
  "lib/sasi/models/observations.ts",
  "lib/sasi/learning/failure-attribution.ts",
  "lib/sasi/learning/hypothesis-engine.ts",
  "lib/sasi/learning/strategy-mutation.ts",
  "lib/sasi/learning/code-evolution-policy.ts",
  "lib/sasi/learning/code-authoring-contract.ts",
  "lib/sasi/learning/real-code-author.ts",
  "lib/sasi/execution/trigger.ts",
  "lib/sasi/execution/billing-bridge.ts",
  "lib/sasi/evaluation/benchmark-runtime.ts",
  "lib/sasi/evaluation/candidate-competition.ts",
  "lib/sasi/evaluation/sealed-guard.ts",
  "lib/sasi/learning/promotion-snapshot.ts",
  "lib/sasi/learning/rollback-plan.ts",
  "lib/sasi/integration/book-learning.ts",
  "app/api/sasi/learning/feedback/route.ts",
  "app/sasi/operator/page.tsx",
];

const status = required.map((file) => ({
  file,
  exists: fs.existsSync(path.join(repoRoot, ...file.split("/"))),
}));

const missing = status.filter((item) => !item.exists).map((item) => item.file);

const protectedFiles = [
  "lib/sasi/core/core-zero.ts",
  ".env",
  ".env.local",
];

const report = {
  version: "v11.10",
  architecture: {
    identity: status.some((x) => x.file.includes("core-zero") && x.exists),
    knowledge: status.some((x) => x.file.includes("knowledge/runtime") && x.exists),
    memory: status.filter((x) => x.file.includes("/memory/") && x.exists).length >= 3,
    selfEvolution: status.some((x) => x.file.includes("strategy-mutation") && x.exists),
    codeSandbox: status.some((x) => x.file.includes("code-evolution-policy") && x.exists),
    measuredEvaluation: status.some((x) => x.file.includes("candidate-competition") && x.exists),
    rollback: status.some((x) => x.file.includes("rollback-plan") && x.exists),
    productionIntegration: status.some((x) => x.file.includes("book-learning") && x.exists),
  },
  missing,
  protectedFiles,
  productionClaims: {
    migrationsApplied: false,
    deployed: false,
    liveAccepted: false,
  },
};

console.log(JSON.stringify(report, null, 2));

if (missing.length) process.exitCode = 2;
