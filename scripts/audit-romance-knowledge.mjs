#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const enginePath = "lib/romance-knowledge.ts";
const routePath = "app/api/romance/generate-full/route.ts";
const expectedChapters = [
  "01-origin", "02-type", "03-expression", "04-needs", "05-hidden",
  "06-interaction", "07-growth", "08-obstacle", "09-ideal", "10-practice", "11-summary",
];
const expectedDimensions = ["socialDrive", "creativity", "adaptability", "ambition", "emotionalDepth"];

let failed = false;
function check(condition, message) {
  if (condition) console.log("PASS romance: " + message);
  else {
    console.error("FAIL romance: " + message);
    failed = true;
  }
}

check(existsSync(enginePath), "knowledge engine exists");
check(existsSync(routePath), "generation route exists");
if (!existsSync(enginePath) || !existsSync(routePath)) process.exit(1);

const engine = readFileSync(enginePath, "utf8");
const route = readFileSync(routePath, "utf8");
const chapterKeys = [...engine.matchAll(/key:\s*"([^"]+)"/g)].map((match) => match[1]);

check(engine.length >= 20000, "editorial knowledge depth threshold");
check(
  chapterKeys.length === expectedChapters.length &&
    expectedChapters.every((key, index) => chapterKeys[index] === key),
  "exact 11-chapter publication order",
);
check(expectedDimensions.every((dimension) => engine.includes(dimension + ": {")), "all five atomic dimensions");
check(engine.includes("semanticBand(scores[dim], 13)"), "13-band semantic activation");
check(engine.includes('kind: index === 0 ? "basic" : "cross"'), "basic and cross dendrites");
check(
  ["judgment:", "evidence:", "mechanism:", "scenario:", "shadow:", "counterevidence:", "action:"]
    .every((slot) => engine.includes(slot)),
  "seven-slot evidence chain",
);
check(
  ["agency", "consent", "non-diagnostic", "non-predictive"].every((tag) => engine.includes(tag)),
  "agency and safety tags",
);
check(!/\bfetch\s*\(|chat\/completions|ZHIPU_/i.test(engine + route), "no model or network generation");
check(route.includes('from "@/lib/romance-knowledge"'), "route uses static knowledge engine");
check(route.includes("countSections(report.fullReport) !== 11"), "runtime chapter integrity guard");
check(route.includes('.eq("user_id", submission.user_id)'), "owner-constrained cache write");

const prohibited = ["造翼者", "主权体积分态", "主权性积分态", "命中注定", "必须每天购买"];
check(!prohibited.some((phrase) => engine.includes(phrase)), "forbidden language absent");

if (failed) process.exit(1);
console.log("Romance deterministic knowledge audit passed.");
