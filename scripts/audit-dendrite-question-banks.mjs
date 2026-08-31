import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const bank = JSON.parse(readFileSync(resolve(process.cwd(), "lib/mini/v330-question-bank.json"), "utf8"));
const engine = readFileSync(resolve(process.cwd(), "lib/mini/dendrite-engine.ts"), "utf8");
const config = readFileSync(resolve(process.cwd(), "app/api/wechat/mini/dendrite/config/route.ts"), "utf8");
const expected = [
  "life-map-report", "relationship-resonance-deep", "relationship-resonance-business", "relationship-resonance-other",
  "resilience-report", "romance-report", "wealth-report", "daily-tide-report", "tarot-reading", "qian-reading",
];
const failures = [];
const questions = [];
const options = [];
if (bank.version !== "V330" || bank.questionCount !== 240 || bank.optionCount !== 960) failures.push("V330 metadata must declare 240 questions and 960 options");
for (const key of expected) {
  const product = bank.products[key];
  if (!product) { failures.push(`${key}: missing`); continue; }
  if (product.questions.length !== 24) failures.push(`${key}: expected 24 questions, got ${product.questions.length}`);
  const productQuestions = product.questions.map((question) => question.zh);
  if (new Set(productQuestions).size !== 24) failures.push(`${key}: repeated question`);
  for (const question of product.questions) {
    questions.push(question.zh);
    if (question.options.length !== 4 || new Set(question.options.map((option) => option.zh)).size !== 4) failures.push(`${key}/${question.id}: options are not four distinct paths`);
    options.push(...question.options.map((option) => option.zh));
  }
}
if (questions.length !== 240 || new Set(questions).size !== 240) failures.push(`expected 240 globally unique questions, got ${new Set(questions).size}`);
if (options.length !== 960 || new Set(options).size !== 960) failures.push(`expected 960 globally unique options, got ${new Set(options).size}`);
for (const marker of ["V330QuestionBank", "source.options[optionIndex]", "sourceOption.answerSemantic", "evidenceLeaves.push", "counterNodeIds"]) if (!engine.includes(marker)) failures.push(`engine is not wired to V330 marker: ${marker}`);
if (!config.includes('questionBankVersion: "V330-OFFICIAL-960"')) failures.push("config does not expose the official V330 version");

if (failures.length) { console.error(failures.map((item) => `FAIL ${item}`).join("\n")); process.exit(1); }
console.log("PASS V330 official mini-program bank: 10 paths, 240 unique questions, 960 unique answer paths.");
