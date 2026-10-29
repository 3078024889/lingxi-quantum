import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const market=readFileSync("app/ai/rankings/market-terminal.tsx","utf8");
test("market filters accept only known categories and sorting values",()=>{
 assert.match(market,/categories\.includes\(categoryRaw\)/);
 assert.match(market,/\["name","vendor","category"\]\.includes\(sortRaw\)/);
});
test("market UI links to documented source and license caveats",()=>{
 assert.match(market,/href="\/ai\/sources"/);
 assert.match(market,/Unknown/);
});
