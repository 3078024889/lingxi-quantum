import test from 'node:test';import assert from 'node:assert/strict';import{assessGate}from'./production-gate-h.mjs';
test('empty evidence cannot release',()=>assert.equal(assessGate({checks:{},releaseApproved:true}).ready,false));
test('approval alone never bypasses failed checks',()=>assert.equal(assessGate({releaseApproved:true}).allowedActions[0],'development_only'));
test('claims of PASS without evidence cannot release',()=>assert.equal(assessGate({checks:{source_intake:{status:'pass'}}}).failed.includes('source_intake'),true));
test('unknown gates rejected',()=>assert.deepEqual(assessGate({checks:{unrecognized:{status:'pass'}}}).unknown,['unrecognized']));
