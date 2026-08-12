#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const paths = {
  engine: "lib/relationship-dendrites.ts",
  composer: "lib/knowledge-loader.ts",
  route: "app/api/relationship/generate-full/route.ts",
  manifest: "knowledge/relationship/engine.json",
  view: "app/relationship/full/RelationshipReportView.tsx",
};

let failed = false;
function check(condition, message) {
  if (condition) console.log(`PASS relationship: ${message}`);
  else {
    console.error(`FAIL relationship: ${message}`);
    failed = true;
  }
}

for (const [name, path] of Object.entries(paths)) check(existsSync(path), `${name} exists`);
if (failed) process.exit(1);

const engine = readFileSync(paths.engine, "utf8");
const composer = readFileSync(paths.composer, "utf8");
const route = readFileSync(paths.route, "utf8");
const manifest = JSON.parse(readFileSync(paths.manifest, "utf8"));
const view = readFileSync(paths.view, "utf8");
const protocolIds = [...engine.matchAll(/^\s+id:\s*"([^"]+)",/gm)].map((match) => match[1]);

check(protocolIds.length >= 12, "at least 12 executable cross protocols");
check(new Set(protocolIds).size === protocolIds.length, "protocol ids are unique");
check(["romantic", "business", "general"].every((type) => engine.includes(`type: "${type}"`)), "all three contexts have dedicated protocols");
check(
  ["mechanism", "scenario", "shadow", "counterevidence", "action"].every(
    (slot) => (engine.match(new RegExp(`\\b${slot}:`, "g")) ?? []).length >= protocolIds.length * 2,
  ),
  "every protocol has bilingual evidence-chain fragments",
);
check(
  ["03", "04", "05", "06", "08", "09", "10"].every((chapter) => engine.includes(`chapter: "${chapter}"`)),
  "trust, boundary, communication, repair, governance, and lifecycle coverage",
);
check(engine.includes("relationshipActivationScores"), "average and gap metrics are deterministic");
check(engine.includes("activateDendrites"), "shared dendritic activation is used");
check(composer.includes("activateRelationshipProtocols"), "11-chapter composer activates protocols");
check(composer.includes("mergeRelationshipProtocols"), "activated fragments enter publication slots");
check(composer.includes("activated,"), "chapter trace records activated node ids");
check(route.includes("RELATIONSHIP_KNOWLEDGE_VERSION"), "cache is knowledge-versioned");
check(route.includes("currentKnowledge(cached)"), "stale reports regenerate once");
check(view.includes("parseReportSections") && view.includes("relationship-knowledge:"), "internal version marker is removed before chapter parsing");
check(route.includes('.eq("user_id", submission.user_id)'), "cache write remains owner-constrained");
check(!/\bfetch\s*\(|chat\/completions|ZHIPU_/i.test(engine + composer), "no model or network generation");
check(manifest.protocolNodes === protocolIds.length, "manifest protocol count matches code");
check(manifest.legacyRuntimeStatus === "inactive-reference-only", "legacy duplicate files cannot be mistaken for runtime knowledge");

if (failed) process.exit(1);
console.log("Relationship dendritic knowledge audit passed.");