import fs from "node:fs";
import path from "node:path";

const repo = process.cwd();

function assert(value, message) {
  if (!value) throw new Error(message);
}

function read(rel) {
  return fs.readFileSync(path.join(repo, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(repo, rel));
}

function directToolRoutes() {
  const source = read("components/tools/ToolsHubV11.tsx");
  return [...source.matchAll(/href:\s*"\/tools\/([^"]+)"/g)].map((m) => m[1]);
}

function registrySlugs() {
  const source = read("lib/tools/registry.ts");
  return [...source.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
}

const direct = [...new Set(directToolRoutes())];
const registry = new Set(registrySlugs());
const dynamic = exists("app/tools/[slug]/page.tsx");

const retired = new Set([
  "number-energy",
]);

const unresolved = [];
const retiredAdvertised = [];

for (const slug of direct) {
  if (retired.has(slug)) retiredAdvertised.push(slug);
  const dedicated = exists(`app/tools/${slug}/page.tsx`);
  const viaRegistry = dynamic && registry.has(slug);
  if (!dedicated && !viaRegistry) unresolved.push(slug);
}

assert(retiredAdvertised.length === 0, `RETIRED_TOOLS_ADVERTISED ${retiredAdvertised.join(",")}`);
assert(unresolved.length === 0, `UNRESOLVED_TOOL_ROUTES ${unresolved.join(",")}`);

const paidSource = read("lib/tools/service-readiness.ts");
const paidIds = [...paidSource.matchAll(/"([a-z0-9-]+)"/g)]
  .map((m) => m[1])
  .filter((value) =>
    [
      "audio-transcription",
      "batch-image-watermark-remover",
      "burn-after-read-file",
      "cross-page-stamp",
      "e-sign-pdf",
      "food-calorie",
      "id-photo-ai",
      "image-watermark-remover",
      "pdf-editor",
      "subtitle-translate",
      "temp-mail-batch",
      "video-dubbing",
      "video-transcription",
      "video-watermark-remover",
    ].includes(value)
  );

assert(new Set(paidIds).size >= 14, "PAID_TOOL_RUNTIME_SET_INCOMPLETE");

const miniWeb = read("miniapp/pages/web/index.js");
assert(miniWeb.includes("'/tools/'"), "MINIAPP_TOOLS_PREFIX_ALLOWLIST_MISSING");

const miniTools = read("miniapp/pages/tools/index.js");
for (const slug of [
  "pdf-editor",
  "pdf-merge-split",
  "image-watermark-remover",
  "ocr",
  "food-calorie",
  "video-transcription",
  "subtitle-translate",
  "temp-mail",
  "burn-after-read",
]) {
  assert(miniTools.includes(`/tools/${slug}`), `MINIAPP_DIRECT_TOOL_MISSING ${slug}`);
}

const foodRoute = read("app/api/ai/food-analyze/route.ts");
const qwen = read("lib/tools/qwen-vision.ts");
assert(foodRoute.includes("FOOD_ANALYSIS_FAILED"), "FOOD_ERROR_MAPPING_MISSING");
assert(foodRoute.includes("completePaidToolJob"), "FOOD_PAID_JOB_COMPLETION_MISSING");
assert(foodRoute.includes("failPaidToolJob"), "FOOD_PAID_JOB_FAILURE_MISSING");
assert(qwen.includes("dashscope-intl.aliyuncs.com"), "QWEN_INTL_ENDPOINT_FALLBACK_MISSING");
assert(qwen.includes("qwen3-vl-plus"), "QWEN_MODEL_FALLBACK_MISSING");

console.log(`ADVERTISED_TOOL_ROUTES=${direct.length}`);
console.log(`REGISTRY_TOOL_SLUGS=${registry.size}`);
console.log(`PAID_RUNTIME_TOOL_IDS=${new Set(paidIds).size}`);
console.log("ALL_ADVERTISED_TOOL_ROUTES_RESOLVED=PASS");
console.log("RETIRED_TOOL_EXPOSURE_AUDIT=PASS");
console.log("PAID_TOOL_RUNTIME_CLASSIFICATION=PASS");
console.log("FOOD_CALORIE_CHAIN_AUDIT=PASS");
console.log("MINIAPP_TOOL_ENTRY_AUDIT=PASS");
console.log("TOOLS_FULL_STATIC_AUDIT=PASS");
