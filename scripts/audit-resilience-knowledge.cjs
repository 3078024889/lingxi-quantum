#!/usr/bin/env node

const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function resolveAlias(request, parent, isMain, options) {
  if (request.startsWith("@/")) request = path.join(root, request.slice(2));
  return originalResolve.call(this, request, parent, isMain, options);
};
require.extensions[".ts"] = function compileTypeScript(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const { buildReport, verifyDeterminism } = require("../lib/knowledge-engine.ts");
const chapters = require("../knowledge/resilience/chapters.json").chapters;
const nodes = require("../knowledge/resilience/nodes.json").nodes;
const combos = require("../knowledge/resilience/combos.json").combos;
const states = require("../knowledge/resilience/states.json").states;
const tails = require("../knowledge/resilience/tails.json").tails;
const manifest = require("../knowledge/resilience/engine.json");

const library = { chapters, nodes, combos, states, tails };
const dimensions = [
  "stressRecovery",
  "adaptability",
  "crisisRebound",
  "persistence",
  "emotionalStability",
];
const representatives = [10, 34, 54, 74, 94];
let tested = 0;
let minZh = Number.POSITIVE_INFINITY;
let minEn = Number.POSITIVE_INFINITY;
let maxZh = 0;

function reportLength(report, language) {
  return report.reduce(
    (total, chapter) => total + chapter.blocks.reduce((sum, block) => sum + String(block[language] || "").length, 0),
    0,
  );
}

for (const stressRecovery of representatives) {
  for (const adaptability of representatives) {
    for (const crisisRebound of representatives) {
      for (const persistence of representatives) {
        for (const emotionalStability of representatives) {
          const scores = { stressRecovery, adaptability, crisisRebound, persistence, emotionalStability };
          const seed = dimensions.map((key) => scores[key]).join("|");
          const first = buildReport(library, scores, seed, null);
          const second = buildReport(library, scores, seed, null);
          if (JSON.stringify(first) !== JSON.stringify(second)) throw new Error(`non-deterministic output: ${seed}`);
          if (first.length !== manifest.expectedKnowledgeChapters) {
            throw new Error(`expected ${manifest.expectedKnowledgeChapters} chapters, received ${first.length}: ${seed}`);
          }
          const gaps = first.filter((chapter) => chapter.blocks.length === 0).map((chapter) => chapter.chapter);
          if (gaps.length > 0) throw new Error(`knowledge gaps in ${gaps.join(",")}: ${seed}`);
          const zhLength = reportLength(first, "zh");
          const enLength = reportLength(first, "en");
          if (zhLength < 3000 || enLength < 3000) {
            throw new Error(`report depth below threshold zh=${zhLength} en=${enLength}: ${seed}`);
          }
          minZh = Math.min(minZh, zhLength);
          minEn = Math.min(minEn, enLength);
          maxZh = Math.max(maxZh, zhLength);
          tested += 1;
        }
      }
    }
  }
}

if (tested !== manifest.exhaustiveScoreShapes) {
  throw new Error(`expected ${manifest.exhaustiveScoreShapes} score shapes, tested ${tested}`);
}
if (!verifyDeterminism(library, Object.fromEntries(dimensions.map((key) => [key, 50])), "resilience-audit", null, 25)) {
  throw new Error("determinism verification failed");
}

console.log(`PASS resilience knowledge: ${tested} score shapes, ${chapters.length} chapters, zero gaps`);
console.log(`PASS deterministic output: 25 repeated runs`);
console.log(`PASS report depth: zh min ${minZh}, zh max ${maxZh}, en min ${minEn} characters`);