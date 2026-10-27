import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync('lib/ai-discovery/source-registry.ts','utf8');
test('LiteLLM catalog is discovery-only with licensing gate',()=>{
 assert.match(src,/id:"litellm-model-catalog"/);
 assert.match(src,/https:\/\/models\.litellm\.ai\/model_catalog/);
 assert.match(src,/licenseReviewRequired:true/);
 assert.match(src,/normalize units and record source timestamp/);
});
test('existing OpenRouter provider remains independent',()=>{
 assert.match(src,/id:"openrouter-models"/);
 assert.match(src,/never merge models solely by display name/);
});
