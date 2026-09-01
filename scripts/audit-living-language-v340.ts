import fs from "node:fs";

const forbidden = [
  "这说明","这意味着","可能表明","综合来看","总体而言",
  "从某个角度","你需要意识到","在一定程度上",
];

const forbiddenStructure = [
  "结构：","机制：","现实：","行动："
];

function scan(text:string) {
  return {
    banned: forbidden.filter(x=>text.includes(x)),
    mechanical: forbiddenStructure.filter(x=>text.includes(x)),
    aiContrast: /不是.{0,30}而是/u.test(text),
  };
}

const files = process.argv.slice(2);
let failed = false;
for (const file of files) {
  const text = fs.readFileSync(file,"utf8");
  const result = scan(text);
  if (result.banned.length || result.mechanical.length || result.aiContrast) {
    failed = true;
    console.error(file, result);
  }
}
if (failed) process.exit(1);
console.log("V340 living-language audit passed");
