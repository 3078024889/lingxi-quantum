import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(p)=>readFileSync(p,"utf8");
test("evidence schema prevents publishing incomplete records",()=>{const s=read("supabase/migrations/20261026170000_ai_evidence_quality.sql");assert.match(s,/approved_requires_measurement/);assert.match(s,/reviewed_at is not null/);assert.doesNotMatch(s,/create policy .* insert/i);});
test("local comparison uses two independent platform selectors",()=>{const s=read("app/[locale]/ai/compare/page.tsx");assert.match(s,/name="a"/);assert.match(s,/name="b"/);assert.match(s,/a.slug===b.slug/);});
test("evidence comparison checks units, geography and time windows",()=>{const s=read("lib/ai-discovery/evidence.ts");for(const field of ["metricKey","unit","geography","periodStart","periodEnd"])assert.match(s,new RegExp("a\\."+field+"===b\\."+field));});
