import fs from "node:fs";
import path from "node:path";

const [repoRoot, sandboxRoot, proposalPath] = process.argv.slice(2);
if (!repoRoot || !sandboxRoot || !proposalPath) {
  throw new Error("usage: node overlay-proposal-targets.mjs <repoRoot> <sandboxRoot> <proposal.json>");
}

const proposal = JSON.parse(fs.readFileSync(proposalPath, "utf8"));
if (!proposal || !Array.isArray(proposal.files)) {
  throw new Error("INVALID_PROPOSAL");
}

const EVOLVABLE = [
  "lib/sasi/ask/",
  "lib/sasi/learning/",
  "lib/sasi/memory/",
  "lib/sasi/models/",
  "lib/sasi/self/",
  "lib/sasi/cangxuan/",
];

function normalizeRepoPath(value) {
  const normalized = String(value ?? "").replaceAll("\\", "/").replace(/^\.?\//, "");
  if (!normalized || normalized.startsWith("../") || normalized.includes("/../") || path.isAbsolute(normalized)) {
    throw new Error(`INVALID_REPO_PATH:${value}`);
  }
  return normalized;
}

function evolvable(p) {
  return EVOLVABLE.some((prefix) => p.startsWith(prefix));
}

const copied = [];

for (const file of proposal.files) {
  const repoPath = normalizeRepoPath(file.path);
  if (!evolvable(repoPath)) {
    throw new Error(`PROPOSAL_TARGET_NOT_EVOLVABLE:${repoPath}`);
  }

  const src = path.resolve(repoRoot, ...repoPath.split("/"));
  const dst = path.resolve(sandboxRoot, ...repoPath.split("/"));

  if (fs.existsSync(src)) {
    if (!fs.statSync(src).isFile()) throw new Error(`TARGET_NOT_FILE:${repoPath}`);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    copied.push(repoPath);
  }
}

console.log(JSON.stringify({ copiedCount: copied.length, copied }, null, 2));
