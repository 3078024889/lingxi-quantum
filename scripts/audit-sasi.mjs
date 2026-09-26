import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(root, rel));
const must = (ok, code) => { if (!ok) throw new Error(code); };

const requiredFiles = [
  "lib/sasi-kernel/runtime.ts",
  "lib/sasi-kernel/registry.ts",
  "lib/sasi-kernel/graph.ts",
  "lib/sasi-kernel/planner.ts",
  "lib/sasi-kernel/readiness.ts",
  "lib/sasi-kernel/policy/types.ts",
  "lib/sasi-kernel/policy/capability-graph.ts",
  "lib/sasi-kernel/policy/router.ts",
  "lib/sasi-kernel/policy/resource-governor.ts",
  "lib/sasi-kernel/policy/provenance.ts",
  "lib/sasi-kernel/policy/refresh-planner.ts",
  "lib/sasi-kernel/policy/promotion-gate.ts",
  "lib/sasi-kernel/policy/index.ts",
  "lib/sasi/ask/run-ask.ts",
  "lib/sasi/readiness.ts",
  "miniapp/utils/i18n.js",
  "miniapp/pages/create/index.js",
  "miniapp/pages/create/index.wxml",
  "miniapp/pages/tools/index.js",
  "miniapp/pages/tools/index.wxml",
  "miniapp/pages/agents/index.js",
  "miniapp/pages/agents/index.wxml",
  "miniapp/pages/profile/index.js",
  "miniapp/pages/profile/index.wxml",
  "miniapp/pages/web/index.js",
  "miniapp/app.json",
];

for (const rel of requiredFiles) {
  must(exists(rel), `SASI_REQUIRED_FILE_MISSING:${rel}`);
}

// Compatibility facades may remain temporarily, but they must not contain a second implementation.
for (const rel of [
  "lib/sasi/autonomy/router.ts",
  "lib/sasi/autonomy/capability-graph.ts",
]) {
  if (exists(rel)) {
    const text = read(rel);
    must(
      text.includes("@deprecated SASI V18 compatibility facade"),
      `SASI_COMPAT_FACADE_NOT_THIN:${rel}`,
    );
  }
}

// Retired mini-program route must stay retired.
must(!exists("miniapp/pages/field/index.js"), "RETIRED_MINI_FIELD_PAGE_RETURNED");

// SASI V18 single-kernel routing source of truth.
const router = read("lib/sasi-kernel/policy/router.ts");
must(router.includes('"knowledge-answer"'), "AUTONOMY_KNOWLEDGE_ROUTE_MISSING");
must(router.includes("externalModelRequired:false"), "AUTONOMY_LOCAL_BASELINE_MISSING");
must(router.includes('"file-convert"'), "AUTONOMY_FILE_CONVERT_ROUTE_MISSING");
must(router.includes('"video-compose"'), "AUTONOMY_VIDEO_COMPOSE_ROUTE_MISSING");

const graph = read("lib/sasi-kernel/policy/capability-graph.ts");
for (const id of [
  "document-parse",
  "file-convert",
  "knowledge-retrieve",
  "knowledge-rank",
  "knowledge-validate",
  "image-process",
  "ocr",
  "subtitle-process",
  "video-compose",
  "audio-process",
  "layout-generate",
]) {
  must(graph.includes(`"${id}"`), `CAPABILITY_MISSING:${id}`);
}

// The Ask path must use the unified kernel router after V18 import migration.
const ask = read("lib/sasi/ask/run-ask.ts");
must(
  ask.includes('routeSasiTask("knowledge-answer")'),
  "ASK_ROUTER_NOT_WIRED",
);
must(
  ask.includes("@/lib/sasi-kernel/policy/router")
    || ask.includes("@/lib/sasi/autonomy/router"),
  "ASK_KERNEL_ROUTER_IMPORT_MISSING",
);
must(ask.includes('generation:"deterministic"'), "ASK_DETERMINISTIC_BASELINE_MISSING");

const kernelReadiness = read("lib/sasi-kernel/readiness.ts");
must(kernelReadiness.includes("singleRegistry:true"), "SASI_SINGLE_REGISTRY_READINESS_MISSING");
must(kernelReadiness.includes("taskStateMachine:true"), "SASI_TASK_STATE_READINESS_MISSING");
must(kernelReadiness.includes("scheduler:true"), "SASI_SCHEDULER_READINESS_MISSING");

const readiness = read("lib/sasi/readiness.ts");
must(readiness.includes("coreExecutionReady"), "AUTONOMY_READINESS_NOT_EXPOSED");

// Mini Program current information architecture
const appJson = JSON.parse(read("miniapp/app.json"));
const pages = Array.isArray(appJson.pages) ? appJson.pages : [];
for (const page of [
  "pages/create/index",
  "pages/tools/index",
  "pages/agents/index",
  "pages/profile/index",
  "pages/web/index",
]) {
  must(pages.includes(page), `MINI_CURRENT_PAGE_NOT_REGISTERED:${page}`);
}
must(!pages.includes("pages/field/index"), "MINI_RETIRED_FIELD_PAGE_STILL_REGISTERED");

// 9-language structure
const i18n = read("miniapp/utils/i18n.js");
for (const lang of ["zh-CN","en","ja","ko","fr","de","es","pt","ar"]) {
  must(
    i18n.includes(`'${lang}'`) || i18n.includes(`"${lang}"`) || i18n.includes(`${lang}:`),
    `MINI_LANGUAGE_MISSING:${lang}`,
  );
}
must(i18n.includes("SUPPORTED"), "MINI_SUPPORTED_LANGUAGE_LIST_MISSING");
must(i18n.includes("setLanguage"), "MINI_LANGUAGE_SWITCH_MISSING");

// User-facing current pages should be copy-driven, not hard-coded engineering surfaces.
for (const rel of [
  "miniapp/pages/create/index.wxml",
  "miniapp/pages/tools/index.wxml",
  "miniapp/pages/agents/index.wxml",
  "miniapp/pages/profile/index.wxml",
]) {
  const text = read(rel);
  must(text.includes("{{copy."), `MINI_I18N_BINDING_MISSING:${rel}`);
  must(
    !/\b(RPC|Pipeline|Worker|Queue|Inference|Endpoint|Webhook|Object Storage|Runtime)\b/i.test(text),
    `MINI_ENGINEERING_COPY:${rel}`,
  );
}

// V15.75 security boundary must stay present.
const quote = read("app/api/tools/quote/route.ts");
must(quote.includes("QUOTE_CREATE_FAILED"), "V1575_QUOTE_BOUNDARY_MISSING");
must(!quote.includes("{ error: message }"), "V1575_RAW_QUOTE_ERROR_RETURNED");

const provider = read("app/api/ai/provider-test/route.ts");
must(provider.includes("PROVIDER_CHECK_FAILED"), "V1575_PROVIDER_BOUNDARY_MISSING");

must(!exists("lib/lingxi/i18n.ts"), "DEAD_18_LOCALE_I18N_RETURNED");

console.log("AUDIT_SASI=PASS");
console.log("CURRENT_ARCHITECTURE=PASS");
console.log("SASI_V18_SINGLE_KERNEL=PASS");
console.log("SASI_KERNEL_POLICY_ROUTE=PASS");
console.log("SASI_KERNEL_CAPABILITY_GRAPH=PASS");
console.log("RETIRED_FIELD_PAGE=ABSENT");
console.log("DETERMINISTIC_BASELINE=PASS");
console.log("MINIAPP_CURRENT_ROUTES=PASS");
console.log("MINIAPP_9_LANGUAGE_STRUCTURE=PASS");
console.log("V15.75_SECURITY_BOUNDARIES=PASS");
