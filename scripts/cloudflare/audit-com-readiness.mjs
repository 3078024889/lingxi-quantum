#!/usr/bin/env node
/**
 * Read-only inventory for .com Cloudflare migration.
 * No secrets, account access, network calls, deployments or DNS mutations.
 * Node 20+. Run from repository root:
 *   node scripts/cloudflare/audit-com-readiness.mjs
 *   node scripts/cloudflare/audit-com-readiness.mjs --json /tmp/com-audit.json
 *   node scripts/cloudflare/audit-com-readiness.mjs --strict
 *
 * Source-pattern inventory only. Full import-graph and runtime testing required.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const args = process.argv.slice(2);
const rootOption = args.indexOf("--root");
const root = resolve(rootOption === -1 ? "." : (args[rootOption + 1] || "."));
const outputOption = args.indexOf("--json");
const strict = args.includes("--strict");
const MAX_ASSET_BYTES = 25 * 1024 * 1024;
const MAX_ASSET_FILES = 20000;

function walk(base) {
  if (!existsSync(base)) return [];
  const results = [];
  for (const item of readdirSync(base, { withFileTypes: true })) {
    if (item.isSymbolicLink()) continue;
    const path = join(base, item.name);
    if (item.isDirectory()) results.push(...walk(path));
    else if (item.isFile()) results.push(path);
  }
  return results;
}
function rel(path) { return relative(root, path).replaceAll("\\", "/"); }
function fileContents(path) { return readFileSync(path, "utf8"); }

const patterns = [
  ["native_node_runtime", /\b(?:node:(?:fs|child_process|net|tls|worker_threads)|from\s*["'](?:fs|child_process)["']|execFileSync|spawnSync|createReadStream|process\.binding)\b/i],
  ["cpu_or_wasm", /\b(?:@ffmpeg|ffmpeg|tesseract|onnxruntime|sharp|qpdf-run|convertDocumentToPdf|libreoffice|soffice|pdf-parse)\b/i],
  ["full_body_buffer", /\b(?:arrayBuffer|Buffer\.concat|readFileSync)\s*\(/i],
  ["auth_or_secret_boundary", /\b(?:service_role|SUPABASE_SERVICE_ROLE|createServerClient|auth\.getUser|R2_SECRET_ACCESS_KEY|PAYPAL_CLIENT_SECRET)\b/i],
];

const source = ["app", "pages"].flatMap(dir => walk(join(root, dir)))
  .filter(path => /(?:^|\/)(?:route|page|layout)\.[cm]?[jt]sx?$/.test(rel(path)));
for (const file of ["middleware.ts", "next.config.js", "next.config.mjs", "vercel.json"]) {
  const path = join(root, file);
  if (existsSync(path)) source.push(path);
}
const findings = [];
for (const path of source.sort()) {
  const name = rel(path);
  const body = fileContents(path);
  const signals = patterns.filter(([, pattern]) => pattern.test(body)).map(([key]) => key);
  if (/^app\/api\/(?:pay|money|tools\/(?:pay|quote|pricing|free-entitlement|local-paid)|sasi\/wallet)\//.test(name))
    signals.push("financial_transaction");
  if (name.startsWith("app/api/cron/")) signals.push("scheduled_task");
  if (name === "middleware.ts") signals.push("host_and_session_boundary");
  if (signals.length) findings.push({ path: name, signals: [...new Set(signals)].sort() });
}
const assetFiles = walk(join(root, "public"));
const oversized = assetFiles.filter(path => statSync(path).size > MAX_ASSET_BYTES)
  .map(path => ({ path: rel(path), bytes: statSync(path).size }));
let legacyCrons = [];
const vercelPath = join(root, "vercel.json");
let invalidVercelJson = false;
if (existsSync(vercelPath)) {
  try {
    legacyCrons = (JSON.parse(fileContents(vercelPath)).crons || [])
      .map(cron => ({ path: cron.path, schedule: cron.schedule }));
  } catch {
    invalidVercelJson = true;
  }
}
const groupCounts = Object.fromEntries(
  [...patterns.map(([key]) => key), "financial_transaction", "scheduled_task", "host_and_session_boundary"]
    .map(key => [key, findings.filter(item => item.signals.includes(key)).length]),
);
const report = {
  schemaVersion: 1,
  environment: "source-only",
  compatible: "unknown",
  releaseReady: false,
  reason: "Static signatures are NOT proof of Worker compatibility or endpoint completeness",
  examinedEntryFiles: source.length,
  examinedApiEntryFiles: source.filter(path => rel(path).startsWith("app/api/")).length,
  groupCounts,
  findings,
  legacyCrons,
  invalidVercelJson,
  staticAssets: { count: assetFiles.length, maxFilesFree: MAX_ASSET_FILES,
    maxSingleAssetBytes: MAX_ASSET_BYTES, oversized },
  releaseGates: [
    "Keep existing Vercel production project, environment and verified .com domain as fallback",
    "Separate .com and .cn hosts; never change .cn DNS, Aliyun origin or payment configurations",
    "Run vinext check, then build alongside unchanged Next.js; inspect transitive imports and unsupported modules",
    "Measure CPU p95/p99 below free plan 10ms, 128MB memory and 100k daily dynamic request budget",
    "Verify 124 tools with actual file output/reopening; no simulated or disabled controls counted",
    "Complete live desktop/mobile, nine-language SEO, auth, historical entitlements and purchases",
    "Verify Supabase transaction idempotency and callback signature checks; no Worker-side secret leaks",
    "Verify SASI external provider job completion, R2 streaming upload/download and lifecycle cleanup",
    "Recreate each Vercel cron under an independently verified scheduler with idempotent endpoints",
    "Validate rollback via .com routing without changing DNS authority or touching .cn",
    "Switch .com to Worker only after sign-off against exact git SHA; observe errors and rollback",
  ],
};
if (outputOption !== -1) {
  const path = args[outputOption + 1];
  if (!path || path.startsWith("--")) { console.error("--json needs a file path"); process.exit(2); }
  writeFileSync(resolve(path), JSON.stringify(report, null, 2) + "\n");
}
console.log(JSON.stringify({
  entryFiles: report.examinedEntryFiles,
  apiEntryFiles: report.examinedApiEntryFiles,
  groupCounts, crons: legacyCrons.length,
  staticAssets: assetFiles.length, oversizedAssets: oversized.length,
  releaseReady: report.releaseReady,
}, null, 2));
if (strict && (invalidVercelJson || oversized.length > 0 || assetFiles.length > MAX_ASSET_FILES)) process.exitCode = 1;
