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
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const { compareLifeVectors } = require("../lib/life-vector.ts");
const { generateStaticRelationshipReport } = require("../lib/knowledge-loader.ts");

const base = {
  freedomNeed: 72, stabilityNeed: 74, creativity: 64, discipline: 70, riskTolerance: 76,
  emotionalDepth: 78, introspection: 70, socialDrive: 68, ambition: 75, adaptability: 72,
};
const contrasted = {
  freedomNeed: 42, stabilityNeed: 70, creativity: 66, discipline: 42, riskTolerance: 48,
  emotionalDepth: 44, introspection: 38, socialDrive: 38, ambition: 42, adaptability: 46,
};
const expected = {
  romantic: ["Trust calibration", "Boundary map", "Four-step repair"],
  business: ["Experiment gate", "Authority matrix", "Capital protocol"],
  general: ["Relationship calibration", "Reciprocity review"],
};

for (const relationshipType of Object.keys(expected)) {
  const input = {
    nameA: "Aurora",
    nameB: "River",
    vectorA: base,
    vectorB: contrasted,
    resonance: compareLifeVectors(base, contrasted),
    relationshipType,
    lang: "en",
  };
  const first = generateStaticRelationshipReport(input);
  const second = generateStaticRelationshipReport(input);
  const sections = first.split(/===\s*(?:\d+|SECTION)\s*===/).map((part) => part.trim()).filter(Boolean);
  if (first !== second) throw new Error(`${relationshipType}: output is not deterministic`);
  if (sections.length !== 11) throw new Error(`${relationshipType}: expected 11 chapters, received ${sections.length}`);
  for (const phrase of expected[relationshipType]) {
    if (!first.includes(phrase)) throw new Error(`${relationshipType}: missing protocol phrase ${phrase}`);
  }
  if (first.length < 9000) throw new Error(`${relationshipType}: report depth below threshold (${first.length})`);
  console.log(`PASS relationship sample: ${relationshipType}, 11 chapters, ${first.length} characters`);
}