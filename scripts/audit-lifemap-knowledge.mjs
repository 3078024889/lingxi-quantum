#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const enginePath = "lib/lifemap-knowledge.ts";
const routePath = "app/api/lifemap/generate-full/route.ts";
const viewPath = "app/life-map/full/FullReportView.tsx";
const pdfPath = "lib/pdf-export.ts";
const chapters = [
  "01-planets", "02-bazi", "03-ziwei", "04-origin-palaces", "05-maya",
  "06-cycles", "07-self-assessment", "08-wealth-career", "09-relationship",
  "10-navigation", "11-practice", "12-imprint", "13-number-energy",
  "14-resilience", "15-romance",
];
const dims = [
  "freedomNeed", "stabilityNeed", "creativity", "discipline", "riskTolerance",
  "emotionalDepth", "introspection", "socialDrive", "ambition", "adaptability",
];

let failed = false;
function check(condition, message) {
  if (condition) console.log("PASS life-map: " + message);
  else {
    console.error("FAIL life-map: " + message);
    failed = true;
  }
}

check(existsSync(enginePath), "knowledge engine exists");
check(existsSync(routePath), "generation route exists");
if (!existsSync(enginePath) || !existsSync(routePath)) process.exit(1);

const engine = readFileSync(enginePath, "utf8");
const route = readFileSync(routePath, "utf8");
const view = readFileSync(viewPath, "utf8");
const pdf = readFileSync(pdfPath, "utf8");
const foundChapters = [...engine.matchAll(/key:\s*"([^"]+)"/g)].map((match) => match[1]);

check(engine.length >= 30000, "editorial knowledge depth threshold");
check(
  foundChapters.length === chapters.length &&
    chapters.every((chapter, index) => foundChapters[index] === chapter),
  "exact 15-chapter publication order",
);
check(dims.every((dim) => engine.includes(dim + ":")), "all ten life-vector dimensions");
check(engine.includes("semanticBand(vector[dim], 13)"), "13-band activation");
check(engine.includes('kind: index === 0 ? "basic" : "cross"'), "basic and cross dendrites");
check(
  ["judgment:", "evidence:", "mechanism:", "scenario:", "shadow:", "counterevidence:", "action:"]
    .every((slot) => engine.includes(slot)),
  "seven-slot evidence chain",
);
check(
  ["agency", "cultural-lens", "non-diagnostic", "non-predictive"].every((tag) => engine.includes(tag)),
  "cultural and safety boundaries",
);
check(!/\bfetch\s*\(|chat\/completions|ZHIPU_/i.test(engine + route), "no model or network generation");
check(route.includes('from "@/lib/lifemap-knowledge"'), "route uses static knowledge engine");
check(route.includes("countSections(report.fullReport) !== 15"), "runtime 15-chapter guard");
check(route.includes('.eq("user_id", submission.user_id)'), "owner-constrained cache write");
check(view.includes("Array.from({ length: 11 }"), "eleven body images plus one cover");
check(pdf.includes("bodyImages[chapterIndex % bodyImages.length]"), "chapter backgrounds cycle safely");

const prohibited = ["造翼者", "主权体积分态", "主权性积分态", "命中注定", "《法典》", "[cite:"];
check(!prohibited.some((phrase) => engine.includes(phrase)), "forbidden source language absent");

if (failed) process.exit(1);
console.log("Life Map deterministic knowledge audit passed.");
