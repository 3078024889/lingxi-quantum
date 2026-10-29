import test from'node:test';import assert from'node:assert/strict';import{auditOpenSourceCandidates,readRegistry}from'./open-source-audit.mjs';
test('external references stay license-safe and noncopying',async()=>{const r=auditOpenSourceCandidates(await readRegistry());assert.deepEqual(r.violations,[])});
test('source copying without license verification blocks integration',()=>{const r=auditOpenSourceCandidates([{id:'x',source:'https://github.com/example/repo',role:'payment',license:'unknown',adoption:'copy-source',constraints:'none'}]);assert.equal(r.pass,false)});
