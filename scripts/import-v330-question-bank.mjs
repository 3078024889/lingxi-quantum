import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const sourcePath = process.argv[2] || "D:/灵犀场_小程序10产品_240题960选项_V330.md";
const outputPath = resolve(process.cwd(), "lib/mini/v330-question-bank.json");
const source = readFileSync(sourcePath, "utf8").replace(/\r\n/g, "\n");
const productPattern = /^## ([^\n]+)\n`([^`]+)`\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm;
const products = {};

for (const productMatch of source.matchAll(productPattern)) {
  const [, nameZh, key, body] = productMatch;
  if (!/^(?:life-map-report|relationship-resonance-(?:deep|business|other)|resilience-report|romance-report|wealth-report|daily-tide-report|tarot-reading|qian-reading)$/.test(key)) continue;
  const questions = [];
  const questionPattern = /^### (\d{2}) · ([^\n]+)\n\*\*题目：\*\* ([^\n]+)\n([\s\S]*?)(?=^### |$(?![\s\S]))/gm;
  for (const match of body.matchAll(questionPattern)) {
    const [, number, sectionZh, zh, questionBody] = match;
    const options = [...questionBody.matchAll(/^- ([A-D])｜(.+?)\s+`semantic:\s*([^`]+)`\s*$/gm)].map((option) => ({
      id: `${number}-${option[1]}`,
      zh: option[2].trim(),
      answerSemantic: option[3].trim(),
    }));
    const target = questionBody.match(/^- 读取目标：(.+)$/m)?.[1]?.trim() || sectionZh.trim();
    if (options.length !== 4) throw new Error(`${key} ${number} expected four options, got ${options.length}`);
    questions.push({ id: `q${Number(number)}`, sectionZh: sectionZh.trim(), zh: zh.trim(), evidenceDimension: target, options });
  }
  if (questions.length !== 24) throw new Error(`${key} expected 24 questions, got ${questions.length}`);
  products[key] = { nameZh: nameZh.trim(), questions };
}

if (Object.keys(products).length !== 10) throw new Error(`expected 10 V330 banks, got ${Object.keys(products).length}`);
const allQuestions = Object.values(products).flatMap((product) => product.questions);
const allOptions = allQuestions.flatMap((question) => question.options.map((option) => option.zh));
if (allQuestions.length !== 240) throw new Error(`expected 240 questions, got ${allQuestions.length}`);
if (allQuestions.some((question) => new Set(question.options.map((option) => option.zh)).size !== 4)) throw new Error("repeated options inside a question");

writeFileSync(outputPath, `${JSON.stringify({ version: "V330", source: "灵犀场_小程序10产品_240题960选项_V330.md", questionCount: allQuestions.length, optionCount: allOptions.length, products }, null, 2)}\n`, "utf8");
console.log(`Imported ${allQuestions.length} questions and ${allOptions.length} options into ${outputPath}`);
