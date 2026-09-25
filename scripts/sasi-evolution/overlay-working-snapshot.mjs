import fs from "node:fs";
import path from "node:path";
import childProcess from "node:child_process";

const [repoRoot, sandboxRoot] = process.argv.slice(2);
if (!repoRoot || !sandboxRoot) {
  throw new Error("usage: node overlay-working-snapshot.mjs <repoRoot> <sandboxRoot>");
}

function git(args) {
  return childProcess.execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" });
}

const raw = git(["status", "--porcelain=v1", "-z", "--untracked-files=all"]);
const items = raw.split("\0").filter(Boolean);
const copied = [];
const skipped = [];

function blocked(p) {
  const n = p.replaceAll("\\", "/");
  return (
    n === ".env" ||
    n.startsWith(".env.") ||
    n.startsWith(".git/") ||
    n.startsWith(".next/") ||
    n.startsWith("node_modules/") ||
    n.startsWith(".lingxi-backup-") ||
    n.includes("/.lingxi-backup-") ||
    n.startsWith("coverage/") ||
    n.startsWith("dist/")
  );
}

function copyOne(p) {
  const n = p.replaceAll("\\", "/");
  if (blocked(n)) {
    skipped.push(n);
    return;
  }
  const src = path.join(repoRoot, ...n.split("/"));
  const dst = path.join(sandboxRoot, ...n.split("/"));
  if (!fs.existsSync(src)) return;
  const st = fs.statSync(src);
  if (!st.isFile()) return;
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  copied.push(n);
}

for (const item of items) {
  const status = item.slice(0, 2);
  const payload = item.slice(3);
  if (status.includes("R") || status.includes("C")) {
    const parts = payload.split(" -> ");
    copyOne(parts.at(-1));
  } else {
    copyOne(payload);
  }
}

console.log(JSON.stringify({ copiedCount: copied.length, skippedCount: skipped.length, copied, skipped }, null, 2));
