#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";

const files = {
  engine: "lib/life-mirror-knowledge.ts",
  cards: "lib/tarot-data.ts",
  spread: "lib/tarot-spread.ts",
  route: "app/api/tarot/reading/generate-full/route.ts",
  mirrorView: "app/mirror/reading/full/TarotReadingReport.tsx",
  tarotView: "app/tarot/reading/full/TarotReadingReport.tsx",
  manifest: "knowledge/life-mirror/engine.json",
};
let failed = false;
function pass(label, condition) {
  if (condition) console.log("PASS life-mirror: " + label);
  else { console.error("FAIL life-mirror: " + label); failed = true; }
}
for (const [name, path] of Object.entries(files)) pass(name + " exists", existsSync(path));
if (failed) process.exit(1);
const engine=readFileSync(files.engine,"utf8"), cards=readFileSync(files.cards,"utf8");
const spread=readFileSync(files.spread,"utf8"), route=readFileSync(files.route,"utf8");
const mirror=readFileSync(files.mirrorView,"utf8"), tarot=readFileSync(files.tarotView,"utf8");
const manifest=JSON.parse(readFileSync(files.manifest,"utf8"));

pass("editorial knowledge depth", engine.length >= 17000);
pass("exact 11 chapter keys", ["connection","hidden","present","future","formula","value","relationship","current","practice","letter","keywords"].every(key => engine.includes('key: "' + key + '", cards:')));
pass("78 authored cards", (cards.match(/\{ index: \d+,/g) ?? []).length === 78);
pass("deterministic unique three-card spread", !/return\s+Math\.random|=\s*Math\.random/.test(spread) && spread.includes("while (used.has(i))"));
pass("13-band activation", engine.includes("semanticBand(vector[dim], 13)"));
pass("raw zero-to-one-hundred frequency scale", engine.includes("score: clamp(v.introspection)") && !/FLOOR|softenScore/.test(engine + route));
pass("four vector-selected practices", (engine.match(/score: \(v: LifeVector\)/g) ?? []).length === 4 && engine.includes("selectPractice(input.vector)"));
pass("seven-slot evidence chain", ["judgment:", "evidence:", "mechanism:", "scenario:", "shadow:", "counterevidence:", "action:"].every(x => engine.includes(x)));
pass("counterevidence and if-then protocol", engine.includes("反证问题") && engine.includes("如果今天出现"));
pass("symbolic and prediction boundary", engine.includes("牌义不能证明人格、因果或未来事件") && engine.includes("不是事件预告或时间承诺"));
pass("paid route has no model or network generation", !/\bfetch\s*\(|chat\/completions|open\.bigmodel|ZHIPU_|maxDuration\s*=\s*300/i.test(route));
pass("card index and uniqueness validation", route.includes("new Set(indexes).size !== 3") && route.includes("Number.isInteger(index)"));
pass("owner and entitlement protected", route.includes("submission.user_id !== user!.id") && route.includes('row.product_id === "everything"'));
pass("owner-constrained cache write", route.includes('.eq("id", body.id).eq("user_id", submission.user_id)'));
pass("legacy cache upgrade marker", route.includes('cached.includes("结构证据：")') && route.includes("sectionCount(cached) === 11"));
pass("both clients require exact 11 chapters", [mirror,tarot].every(x => x.includes("parts.length !== LAYER_TITLES.length")));
pass("both clients hide server detail", [mirror,tarot].every(x => !x.includes("data.detail")));
const images=existsSync("public/images/tarot-full")?readdirSync("public/images/tarot-full").filter(x=>/^page-(?:[0-9]|1[01])\.png$/.test(x)):[];
pass("eleven body images plus cover", images.length === 12);
pass("manifest declares deterministic runtime", manifest.runtimeModelDependency === false && manifest.chapterCount === 11 && manifest.cardCount === 78);
if(failed) process.exit(1);
console.log("Life Mirror deterministic knowledge audit passed.");