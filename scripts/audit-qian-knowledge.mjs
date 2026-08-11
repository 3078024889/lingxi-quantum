#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const enginePath = "lib/qian-knowledge.ts";
const dataPath = "lib/qian-data.ts";
const routePath = "app/api/qian/generate-full/route.ts";
const viewPath = "app/qian/full/QianReport.tsx";
const expectedChapters = [
  "01-overview", "02-origin", "03-soul", "04-walker", "05-fusion",
  "06-value", "07-relationship", "08-stage", "09-hidden", "10-practice", "11-summary",
];

let failed = false;
function check(condition, message) {
  if (condition) console.log("PASS qian: " + message);
  else {
    console.error("FAIL qian: " + message);
    failed = true;
  }
}

for (const path of [enginePath, dataPath, routePath, viewPath]) {
  check(existsSync(path), path + " exists");
}
if (failed) process.exit(1);

const engine = readFileSync(enginePath, "utf8");
const data = readFileSync(dataPath, "utf8");
const route = readFileSync(routePath, "utf8");
const view = readFileSync(viewPath, "utf8");
const chapters = [...engine.matchAll(/key:\s*"([^"]+)"/g)]
  .map((match) => match[1])
  .filter((key) => /^\d{2}-/.test(key));

check(engine.length >= 30000, "editorial knowledge depth threshold");
check(
  chapters.length === expectedChapters.length &&
    expectedChapters.every((chapter, index) => chapters[index] === chapter),
  "exact 11-chapter publication order",
);
check(data.includes("...attachIndex(originSigns") && data.includes("...attachIndex(soulSigns") && data.includes("...attachIndex(walkerSigns"), "three independent sign pools");
check(engine.includes("semanticBand(vector[dim], 13)"), "13-band dimension activation");
check(engine.includes("score: clamp(vector.creativity)"), "raw zero-to-one-hundred ability scale");
check(!engine.includes("FLOOR") && !engine.includes("softenScore"), "no artificial score floor");
check(["量子息法", "上升心经", "心场复位", "直觉丹道"].every((name) => engine.includes(name)), "four differentiated practice paths");
check(
  ["judgment:", "evidence:", "mechanism:", "scenario:", "shadow:", "counterevidence:", "action:"]
    .every((slot) => engine.includes(slot)),
  "seven-slot evidence chain",
);
check(!/\bfetch\s*\(|chat\/completions|ZHIPU_/i.test(engine + route), "no model or network generation");
check(route.includes("validSigns(submission.sign_indexes)"), "sign index and tier validation");
check(route.includes("countSections(report.fullReport) !== 11"), "runtime chapter integrity guard");
check(route.includes('.eq("user_id", submission.user_id)'), "owner-constrained cache write");
check(view.includes("Array.from({ length: 11 }"), "eleven body images plus cover");
check(!/技术细节|\(Detail:/.test(readFileSync("app/qian/QianFlow.tsx", "utf8")), "no client exception disclosure");

const prohibited = ["造翼者", "主权体积分态", "主权性积分态", "命中注定", "《法典》", "[cite:"];
check(!prohibited.some((phrase) => engine.includes(phrase)), "forbidden source language absent");

if (failed) process.exit(1);
console.log("Life Oracle deterministic knowledge audit passed.");
