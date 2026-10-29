import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const terminal=readFileSync("app/ai/rankings/market-terminal.tsx","utf8");
const page=readFileSync("app/ai/rankings/page.tsx","utf8");
test("market terminal is mounted on rankings route",()=>{
 assert.match(page,/import MarketTerminal from "\.\/market-terminal"/);
 assert.match(page,/<MarketTerminal searchParams=\{searchParams\}\/>/);
});
test("watchlist provides discoverability without invented numeric rankings",()=>{
 for(const text of ["Monthly visits","Downloads","Active users","Rating","Cost per task","Unknown","Unverified","not a popularity ranking"])
  assert.ok(terminal.includes(text),text);
 assert.match(terminal,/action="\/ai\/rankings"/);
 assert.match(terminal,/name="category"/);
 assert.match(terminal,/name="sort"/);
 assert.match(terminal,/name="q"/);
});
