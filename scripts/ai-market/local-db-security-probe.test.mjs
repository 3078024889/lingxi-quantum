import test from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';
test('local DB probe must assert RLS and no public grants on every AI market table',async()=>{
const s=await readFile(new URL('./local-db-security-probe.sql',import.meta.url),'utf8');
assert.match(s,/ai_market_payment_refunds/);assert.match(s,/relrowsecurity/);assert.match(s,/has_table_privilege/);assert.match(s,/raise exception 'RLS_OFF/);
});
