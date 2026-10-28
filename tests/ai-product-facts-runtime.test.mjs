import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {stripTypeScriptTypes} from "node:module";
const load=async p=>import("data:text/javascript;base64,"+Buffer.from(stripTypeScriptTypes(readFileSync(p,"utf8"))).toString("base64"));
const {factSnapshots,latestFacts,productHistory,questionFields,isStale}=await load("lib/ai-discovery/product-facts.ts");
const {aiTools}=await load("lib/ai-discovery/catalog.ts");
const {selectTerminalRows}=await load("lib/ai-discovery/terminal-selection.ts");
test("every displayed fact has a known product, HTTPS source, scope and observation date",()=>{
 const seen=new Set();
 for(const s of factSnapshots){assert.ok(aiTools.some(t=>t.slug===s.product));assert.ok(!seen.has(s.product+s.observedAt));seen.add(s.product+s.observedAt);
 for(const fact of Object.values(s.facts)){assert.equal(new URL(fact.source).protocol,"https:");assert.ok(fact.text&&fact.scope);assert.equal(fact.checkedAt,s.observedAt);assert.equal(fact.kind,"official");}}
});
test("unknown is not zero or unsupported, and future observations do not leak into a past view",()=>{
 assert.equal(latestFacts("pika").facts.phone,undefined);
 assert.equal(latestFacts("pika","2026-10-28"),undefined);
 assert.equal(latestFacts("unknown"),undefined);
 assert.equal(productHistory("pika").length,1);
});
test("free credits and billing periods preserve the important differences",()=>{
 assert.match(latestFacts("pika").facts.free.text,/0 积分/);
 assert.match(latestFacts("runway").facts.free.text,/一次性 125/);
 assert.match(latestFacts("runway").facts.price.scope,/按年付款/);
 assert.match(latestFacts("claude").facts.free.text,/5 小时/);
 assert.match(latestFacts("pika").facts.failure.text,/未承诺/);
});
test("question matching retains product identity and all requested conditions",()=>{
 assert.deepEqual(selectTerminalRows(aiTools,"Pika 免费视频每天几次","","name").map(t=>t.slug),["pika"]);
 assert.deepEqual(questionFields("免费无水印可商用的视频失败扣费吗"),["free","watermark","commercial","failure"]);
 assert.deepEqual(questionFields("不用手机号也不用信用卡"),["phone","card"]);
 const result=selectTerminalRows(aiTools,"免费生成视频每天几次","","name");assert.ok(result.length>0);assert.ok(result.every(t=>t.category==="Video"));
 assert.equal(selectTerminalRows(aiTools,"Pika 免费额度","Audio","name").length,0);
});
test("specialist categories keep one shared product identity",()=>{
 assert.deepEqual(selectTerminalRows(aiTools,"","Agents","name").map(t=>t.slug),["n8n"]);
 assert.ok(selectTerminalRows(aiTools,"","SEO","name").some(t=>t.slug==="ahrefs-brand-radar"));
 assert.ok(selectTerminalRows(aiTools,"","Science","name").every(t=>["elicit","consensus"].includes(t.slug)));
});
test("old evidence can be flagged for refreshing without silently changing its facts",()=>{
 const f=latestFacts("pika").facts.free;const text=f.text;
 assert.equal(isStale(f,"2026-10-29"),false);assert.equal(isStale(f,"2026-12-01"),true);assert.equal(f.text,text);
});
