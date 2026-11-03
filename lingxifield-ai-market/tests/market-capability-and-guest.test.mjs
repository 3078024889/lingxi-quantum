import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateVendorSubmission} from '../lib/vendor-submission.mjs';
import {createSearchIndex} from '../lib/search-index.mjs';
const source=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('13 real capability profiles are differentiated with source, task and boundary',async()=>{
 const src=await source('lib/capability-profiles.ts');
 for(const id of ['chatgpt','claude','runway','comfyui','dify','n8n','suno','elevenlabs','midjourney','perplexity','ollama','deepseek','lovable']){
  assert.match(src,new RegExp('\\b'+id+':profile\\('),id);
 }
 assert.ok((src.match(/\bcap\('/g)||[]).length>=45,'must include concrete independently linked functions');
 for(const field of ['outcome','example','boundary','source','firstSteps'])assert.ok(src.includes(field),field);
 assert.match(src,/not a ranking nor an independent test/);
});

test('detail page renders concrete capability cards instead of generic 13-field panel alone',async()=>{
 const ui=await source('app/capability-showcase.tsx');
 const home=await source('app/market-workbench.tsx');
 assert.match(home,/<CapabilityShowcase platform=\{target\} language=\{language\}\/>/);
 for(const text of ['capabilityGrid','capabilityOutcome','capabilitySource','profile.firstSteps','/vendor/claim'])assert.ok(ui.includes(text),text);
 assert.match(ui,/item\.source/);
 assert.doesNotMatch(ui,/真实用途示例|使用边界/);
});

test('visitors browse freely, guest corrections stay open, ownership requires the existing LINGXIFIELD account',async()=>{
 const home=await source('app/market-workbench.tsx');
 const form=await source('app/(default)/vendor/claim/page.tsx');
 const route=await source('app/api/vendor/submit/route.ts');
 assert.doesNotMatch(home,/https:\/\/lingxifield\.com\/account/);
 assert.match(form,/资料纠错与新产品线索仍可匿名提交/);
 assert.match(form,/lingxifield\.com\/account\/ai-market/);
 assert.match(form,/使用灵犀场账号认领/);
 assert.match(route,/LOGIN_REQUIRED_MAIN_ACCOUNT/);
 assert.match(route,/parsed\.request_type==='claim'/);
});

test('vendor feature suggestions require a complete sourced proposal and are never auto-approved',()=>{
 const base={requestType:'claim',productName:'NewTool',officialSite:'https://example.com',
  workEmail:'person@example.com',submitterName:'Officer',evidenceUrl:'https://example.com/features'};
 const proposal={capabilityName:'Photo to video',capabilityOutcome:'Generates clip from a reference image',
  capabilityExample:'Create a five-second demo clip',capabilitySource:'https://example.com/features/video'};
 const out=validateVendorSubmission({...base,...proposal});
 assert.equal(out.status,'pending_identity_check');
 assert.equal(out.proposed_data.capability_proposals[0].reviewStatus,'pending');
 assert.equal(out.proposed_data.capability_proposals[0].name,proposal.capabilityName);
 assert.equal(validateVendorSubmission({...base,capabilityName:proposal.capabilityName}),null);
 assert.equal(validateVendorSubmission({...base,...proposal,capabilitySource:'javascript:alert(1)'}),null);
});

test('capability index can match task keywords without exposing billing/identity labels as features',async()=>{
 const repo=await source('lib/platform-repository.ts');
 const index=await source('lib/search-index.mjs');
 assert.match(repo,/searchTerms:\[\.\.\.new Set\(terms\)\]/);
 assert.doesNotMatch(repo,/capabilities:\[\.\.\.new Set\(\[\.\.\.entry.capabilities/);
 assert.match(index,/\.\.\.\(r\.searchTerms\|\|\[\]\)/);
 const s=createSearchIndex([{id:'a',name:'X',company:'Co',category:'工具',description:'Image app',capabilities:['文生图'],searchTerms:['视频人物一致性']}]);
 assert.equal(s.search({q:'人物一致性'}).total,1);
 assert.deepEqual(s.get('a').capabilities,['文生图']);
});
