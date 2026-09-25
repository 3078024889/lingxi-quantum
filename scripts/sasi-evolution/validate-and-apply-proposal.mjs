import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const [sandboxRoot, proposalPath, evidencePath] = process.argv.slice(2);
if (!sandboxRoot || !proposalPath || !evidencePath) {
  throw new Error("usage: node validate-and-apply-proposal.mjs <sandboxRoot> <proposal.json> <evidence.json>");
}

const EVOLVABLE = [
  "lib/sasi/ask/",
  "lib/sasi/learning/",
  "lib/sasi/memory/",
  "lib/sasi/models/",
  "lib/sasi/self/",
  "lib/sasi/cangxuan/",
];

const IMMUTABLE = [
  "lib/sasi/core/core-zero.ts",
];

const PROTECTED = [
  ".env",
  "app/api/pay/",
  "app/api/tools/pay/",
  "lib/fulfill-order",
  "lib/sasi/payment-gate",
  "lib/sasi/readiness",
  "supabase/migrations/",
  ".github/workflows/",
];

function normalizeRepoPath(value) {
  const normalized = String(value ?? "").replaceAll("\\", "/").replace(/^\.?\//, "");
  if (!normalized || normalized.startsWith("../") || normalized.includes("/../") || path.isAbsolute(normalized)) {
    throw new Error(`INVALID_REPO_PATH:${value}`);
  }
  return normalized;
}

function zone(p) {
  if (IMMUTABLE.some((x) => p === x || p.startsWith(`${x}/`))) return "immutable";
  if (PROTECTED.some((x) => p.startsWith(x))) return "protected";
  if (EVOLVABLE.some((x) => p.startsWith(x))) return "evolvable";
  return "protected";
}

function sha256(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

const proposal = JSON.parse(fs.readFileSync(proposalPath, "utf8"));
if (!proposal || typeof proposal !== "object" || !Array.isArray(proposal.files) || proposal.files.length < 1) {
  throw new Error("INVALID_PROPOSAL");
}
if (proposal.files.length > 24) throw new Error("PROPOSAL_TOO_LARGE");

const evidence = {
  proposalId: String(proposal.id ?? ""),
  strategyId: String(proposal.strategyId ?? ""),
  startedAt: new Date().toISOString(),
  sandboxRoot,
  files: [],
  passed: false,
  errors: [],
};

for (const file of proposal.files) {
  const repoPath = normalizeRepoPath(file.path);
  const fileZone = zone(repoPath);
  if (fileZone !== "evolvable") {
    evidence.errors.push(`BLOCKED_PATH:${repoPath}:${fileZone}`);
    continue;
  }

  const absolute = path.resolve(sandboxRoot, ...repoPath.split("/"));
  const rootResolved = path.resolve(sandboxRoot) + path.sep;
  if (!absolute.startsWith(rootResolved)) {
    evidence.errors.push(`PATH_ESCAPE:${repoPath}`);
    continue;
  }

  const before = fs.existsSync(absolute) ? fs.readFileSync(absolute, "utf8") : "";
  const actualBefore = sha256(before);
  if (typeof file.beforeSha256 === "string" && file.beforeSha256 && file.beforeSha256 !== actualBefore) {
    evidence.errors.push(`BASE_SHA_MISMATCH:${repoPath}`);
    continue;
  }

  const proposedContent = String(file.proposedContent ?? "");
  if (Buffer.byteLength(proposedContent, "utf8") > 512 * 1024) {
    evidence.errors.push(`FILE_TOO_LARGE:${repoPath}`);
    continue;
  }

  const proposedSha = sha256(proposedContent);
  if (typeof file.proposedSha256 === "string" && file.proposedSha256 && file.proposedSha256 !== proposedSha) {
    evidence.errors.push(`PROPOSED_SHA_MISMATCH:${repoPath}`);
    continue;
  }

  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, proposedContent, "utf8");
  evidence.files.push({
    path: repoPath,
    zone: fileZone,
    beforeSha256: actualBefore,
    proposedSha256: proposedSha,
    bytes: Buffer.byteLength(proposedContent, "utf8"),
  });
}

if (evidence.errors.length) {
  fs.writeFileSync(evidencePath, JSON.stringify(evidence, null, 2));
  throw new Error(`PROPOSAL_REJECTED:${evidence.errors.join("|")}`);
}

evidence.passed = true;
evidence.appliedAt = new Date().toISOString();
fs.writeFileSync(evidencePath, JSON.stringify(evidence, null, 2));
console.log(`APPLIED ${evidence.files.length} evolvable file(s) in sandbox only.`);
