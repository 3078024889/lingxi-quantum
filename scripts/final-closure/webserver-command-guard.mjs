import fs from "node:fs";
const s=fs.readFileSync("playwright.food.config.ts","utf8");
const broken=/pnpm\s+start\s+--\s+(?:-p|--port)\b/.test(s)||/next\s+start\s+--\s+(?:-p|--port)\b/.test(s);
const correct=s.includes('command:"pnpm exec next start -p 3217"');
console.log(`FOOD_WEBSERVER_DIRECT_NEXT=${correct?"PASS":"FAIL"}`);
console.log(`FOOD_WEBSERVER_BROKEN_SEPARATOR_ABSENT=${!broken?"PASS":"FAIL"}`);
process.exit(correct&&!broken?0:1);
