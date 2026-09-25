import fs from "node:fs";
import path from "node:path";

const [repoRoot, sandboxRoot, manifestPath] = process.argv.slice(2);
if (!repoRoot || !sandboxRoot || !manifestPath) {
  throw new Error("usage: node overlay-foundation-manifest.mjs <repoRoot> <sandboxRoot> <manifest.json>");
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (!manifest || !Array.isArray(manifest.paths)) {
  throw new Error("INVALID_FOUNDATION_MANIFEST");
}

const copied = [];
const missing = [];
const blocked = [];

function normalizeRepoPath(value) {
  const normalized = String(value ?? "").replaceAll("\\", "/").replace(/^\.?\//, "");
  if (
    !normalized ||
    normalized.startsWith("../") ||
    normalized.includes("/../") ||
    path.isAbsolute(normalized)
  ) {
    throw new Error(`INVALID_MANIFEST_PATH:${value}`);
  }
  return normalized;
}

function isBlocked(repoPath) {
  return (
    repoPath === ".env" ||
    repoPath.startsWith(".env.") ||
    repoPath.startsWith(".git/") ||
    repoPath.startsWith(".next/") ||
    repoPath.startsWith("node_modules/") ||
    repoPath.startsWith(".lingxi-backup-") ||
    repoPath.includes("/.lingxi-backup-") ||
    repoPath.startsWith("supabase/migrations/")
  );
}

for (const raw of manifest.paths) {
  const repoPath = normalizeRepoPath(raw);

  if (isBlocked(repoPath)) {
    blocked.push(repoPath);
    continue;
  }

  const src = path.resolve(repoRoot, ...repoPath.split("/"));
  const dst = path.resolve(sandboxRoot, ...repoPath.split("/"));
  const rootResolved = path.resolve(repoRoot) + path.sep;
  const sandboxResolved = path.resolve(sandboxRoot) + path.sep;

  if (!src.startsWith(rootResolved) || !dst.startsWith(sandboxResolved)) {
    throw new Error(`MANIFEST_PATH_ESCAPE:${repoPath}`);
  }

  if (!fs.existsSync(src) || !fs.statSync(src).isFile()) {
    missing.push(repoPath);
    continue;
  }

  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  copied.push(repoPath);
}

if (blocked.length) {
  throw new Error(`BLOCKED_MANIFEST_PATHS:${blocked.join(",")}`);
}
if (missing.length) {
  throw new Error(`MISSING_MANIFEST_PATHS:${missing.join(",")}`);
}

console.log(JSON.stringify({
  version: manifest.version ?? null,
  copiedCount: copied.length,
  copied,
}, null, 2));
