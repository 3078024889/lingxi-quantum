import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {join} from "node:path";
const root=process.cwd();
const read=(p)=>readFileSync(join(root,p),"utf8");
test("AI discovery routes and evidence migrations exist",()=>{
for(const p of ["app/ai/page.tsx","app/ai/compare/page.tsx","app/ai/rankings/page.tsx","app/ai/[slug]/page.tsx","app/[locale]/ai/page.tsx","supabase/migrations/20261026090000_ai_discovery_v1.sql","supabase/migrations/20261026150000_ai_discovery_evidence.sql"])assert.ok(existsSync(join(root,p)),p);
});
test("all nine locales have complete AI discovery UI labels",()=>{
const source=read("lib/ai-discovery/i18n.ts");
const match=source.match(/export const aiMessages=(\{[\s\S]*?\}) as const;/);assert.ok(match,"locale data");
const messages=JSON.parse(match[1]);assert.deepEqual(Object.keys(messages).sort(),["zh","en","ja","ko","fr","de","es","pt","ar"].sort());
for(const [locale,labels] of Object.entries(messages)){assert.equal(Object.keys(labels).length,15,locale);for(const [key,value] of Object.entries(labels))assert.ok(value.trim(),locale+"."+key);}
});
test("no fabricated popularity numbers or unreviewed public writes",()=>{
const sql=read("supabase/migrations/20261026150000_ai_discovery_evidence.sql");
assert.match(sql,/enable row level security/);assert.doesNotMatch(sql,/for insert to anon|for all to anon/i);
const page=read("app/ai/rankings/page.tsx");assert.match(page,/not verified/);assert.match(page,/not rankings/);
});
