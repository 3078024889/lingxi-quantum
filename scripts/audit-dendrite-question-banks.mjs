import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "lib/mini/dendrite-engine.ts"), "utf8");
const banks = [
  ["life-map", "lifePrompts"],
  ["relationship-deep", "deepRelationshipPrompts"],
  ["relationship-business", "businessRelationshipPrompts"],
  ["relationship-other", "otherRelationshipPrompts"],
  ["resilience", "resiliencePrompts"],
  ["romance", "romancePrompts"],
  ["wealth", "wealthPrompts"],
  ["daily-tide", "tidePrompts"],
  ["life-mirror", "mirrorPrompts"],
  ["life-oracle", "qianPrompts"],
];

const failures = [];
const globalZh = new Map();
for (const [label, symbol] of banks) {
  const start = source.indexOf(`const ${symbol}: Prompt[] = [`);
  const end = source.indexOf("\nconst ", start + 10);
  if (start < 0 || end < 0) {
    failures.push(`${label}: bank source not found`);
    continue;
  }
  const block = source.slice(start, end);
  const groupedRows = [...block.matchAll(/\[\["([^"]+)","([^"]+)"\]|,\["([^"]+)","([^"]+)"\]/g)]
    .map((match) => [match[1] ?? match[3], match[2] ?? match[4]]);
  const directRows = [...block.matchAll(/^\s{2}\["[^"]+","[^"]+","([^"]+)","([^"]+)",/gm)]
    .map((match) => [match[1], match[2]]);
  const rows = [...directRows, ...groupedRows];
  const zh = rows.map((row) => row[0]);
  const en = rows.map((row) => row[1]);
  if (rows.length !== 24) failures.push(`${label}: expected 24 questions, found ${rows.length}`);
  if (new Set(zh).size !== zh.length) failures.push(`${label}: repeated Chinese question`);
  if (new Set(en).size !== en.length) failures.push(`${label}: repeated English question`);
  for (const question of zh) {
    const prior = globalZh.get(question);
    if (prior) failures.push(`${label}: duplicates question from ${prior}: ${question}`);
    else globalZh.set(question, label);
  }
}

if (!readFileSync(resolve(process.cwd(), "app/api/wechat/mini/dendrite/config/route.ts"), "utf8").includes('questionBankVersion: "V331"')) {
  failures.push("question bank version was not advanced to V331");
}
if (!source.includes("const permutations = seed.nodes.flatMap") || !source.includes("evidenceDimension") || !source.includes("answerSemantic") || !source.includes("counterNodeIds")) {
  failures.push("questions do not own independent semantic dimensions and ordered node mappings");
}
if (!source.includes("evidenceLeaves.push") || !source.includes("promptZh:question.zh") || !source.includes("answerZh:option.zh") || !source.includes("evidenceDimension:question.evidenceDimension")) {
  failures.push("24 responses are not persisted as independent Evidence Leaves");
}
if (!source.includes('polarity:"support"') || !source.includes("question.options.filter")) failures.push("selected support and unselected counter-evidence are not persisted");
if (!source.includes('const optionZh=`${current.zh} · ${optionIndex%2===0?current.meaningZh:current.actionZh}`')) failures.push("answer copy does not render the selected semantic node concisely");
if (source.includes('在「${zh.replace(/[？。]/g,"")}」这一情境里')) failures.push("answer copy redundantly repeats the full question");

if (failures.length) {
  console.error(failures.map((item) => `FAIL ${item}`).join("\n"));
  process.exit(1);
}
console.log(`PASS ${banks.length} product paths each expose 24 distinct questions (${globalZh.size} unique Chinese prompts)`);
