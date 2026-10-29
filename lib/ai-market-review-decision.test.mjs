import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCandidateDecision} from './ai-market-review-decision.mjs';
const base=()=>({candidateKey:'hf:models:org/model',decision:'verified',reason:'Checked the official repository and the model card'});
test('valid verified decision',()=>assert.equal(validateCandidateDecision(base())?.decision,'verified'));
test('reject arbitrary key',()=>assert.equal(validateCandidateDecision({...base(),candidateKey:'../../admin'}),null));
test('reject publishing flag',()=>assert.equal(validateCandidateDecision({...base(),decision:'publish'}),null));
test('reject short reason',()=>assert.equal(validateCandidateDecision({...base(),reason:'ok'}),null));
test('valid rejection',()=>assert.equal(validateCandidateDecision({...base(),decision:'rejected'})?.decision,'rejected'));
