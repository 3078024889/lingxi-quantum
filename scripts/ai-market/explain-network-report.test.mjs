import test from'node:test';import assert from'node:assert/strict';import{diagnose}from'./explain-network-report.mjs';
import {spawnSync} from 'node:child_process';
test('missing report gives an actionable message without an ENOENT stack',()=>{
 const r=spawnSync(process.execPath,['scripts/ai-market/explain-network-report.mjs','reports/no-such-network-report.json'],{encoding:'utf8'});
 assert.equal(r.status,1);assert.match(r.stderr,/NETWORK_REPORT_MISSING/);assert.doesNotMatch(r.stderr,/Error: ENOENT/);
});
test('DNS failure classification',()=>assert.equal(diagnose({Checks:[{Host:'huggingface.co',DNS:false}]}),'HUGGINGFACE_DNS_UNAVAILABLE'));
test('compare GitHub and Hugging Face TCP',()=>assert.equal(diagnose({Checks:[{Host:'huggingface.co',DNS:true,TCP443:false},{Host:'github.com',TCP443:true}]}),'HUGGINGFACE_SPECIFIC_TCP_BLOCK_OR_RESET'));
test('TCP alone does not claim TLS success',()=>assert.equal(diagnose({Checks:[{Host:'huggingface.co',DNS:true,TCP443:true}]}),'TCP_REACHABLE_CHECK_TLS_PROXY_AND_CERTIFICATES'));
