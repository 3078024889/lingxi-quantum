#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";

const files = {
  engine: "lib/daily-tide-knowledge.ts",
  transit: "lib/daily-transit.ts",
  route: "app/api/daily-tide/generate-full/route.ts",
  preview: "lib/daily-fortune-ai.ts",
  view: "app/daily/full/DailyTideReportView.tsx",
  manifest: "knowledge/daily-tide/engine.json",
};
let failed = false;
function pass(label, condition) {
  if (condition) console.log("PASS daily-tide: " + label);
  else { console.error("FAIL daily-tide: " + label); failed = true; }
}
for (const [name, path] of Object.entries(files)) pass(name + " exists", existsSync(path));
if (failed) process.exit(1);

const engine = readFileSync(files.engine, "utf8");
const transit = readFileSync(files.transit, "utf8");
const route = readFileSync(files.route, "utf8");
const preview = readFileSync(files.preview, "utf8");
const view = readFileSync(files.view, "utf8");
const manifest = JSON.parse(readFileSync(files.manifest, "utf8"));

pass("editorial knowledge depth", engine.length >= 16000);
pass("exact 11 chapter keys", (engine.match(/key:"(?:overview|action|creation|relationship|value|inner|day7|day30|day90|practice|summary)"/g) ?? []).length === 11);
pass("13-band activation", engine.includes("semanticBand(scores[key], 13)"));
pass("seven-slot evidence chain", ["judgment:", "evidence:", "mechanism:", "scenario:", "shadow:", "counterevidence:", "action:"].every(x => engine.includes(x)));
pass("counterevidence and if-then protocol", engine.includes("反证问题") && engine.includes("如果我在关键事项前"));
pass("astronomy and interpretation boundary", engine.includes("不是对事件、健康或收益的预测") && engine.includes("所在地真实潮位"));
pass("full 7/30/90 trajectories", ["tideTrajectory(7", "tideTrajectory(30", "tideTrajectory(90"].every(x => route.includes(x)));
pass("spring and neap turning points", transit.includes('{ angle: 90, kind: "neap" }') && transit.includes('{ angle: 270, kind: "neap" }'));
pass("paid route has no model or network generation", !/\bfetch\s*\(|chat\/completions|open\.bigmodel|ZHIPU_|maxDuration\s*=\s*300/i.test(route));
pass("free preview has no model, network, or database call", !/\bfetch\s*\(|chat\/completions|open\.bigmodel|ZHIPU_|createAdminClient|daily_fortune_cache/i.test(preview));
pass("owner and entitlement protected", route.includes("submission.user_id !== user!.id") && route.includes('row.product_id === "everything"'));
pass("owner-constrained cache write", route.includes('.eq("id", body.id).eq("user_id", submission.user_id)'));
pass("legacy cache upgrade marker", route.includes('cached.includes("结构证据：")') && route.includes("sectionCount(cached) === 11"));
pass("client rejects incomplete reports", view.includes("nextSections.length !== SECTION_TITLES.length"));
const images = existsSync("public/images/daily-tide-full")
  ? readdirSync("public/images/daily-tide-full").filter(name => /^page-(?:[0-9]|1[01])\.png$/.test(name))
  : [];
pass("eleven body images plus cover", images.length === 12);
pass("manifest declares local deterministic runtime", manifest.runtimeModelDependency === false && manifest.chapterCount === 11 && manifest.semanticBands === 13);

if (failed) process.exit(1);
console.log("Daily Tide deterministic knowledge audit passed.");