import test from 'node:test';
import assert from 'node:assert/strict';
import {candidateNamespaces,discoverPublishers,hubJson} from '../scripts/discover-ai-publishers.mjs';
const response=(data,status=200)=>({ok:status>=200&&status<300,status,headers:{get:()=>null},json:async()=>data});
const fixtures=[
 {name:'latest_models',kind:'model',rows:[{id:'Qwen/model1'},{id:'AcmeAI/image-1'},{id:'AcmeAI/image-2'},{id:'person/model'},{id:'bad/other/extra'}]},
 {name:'popular_models',kind:'model',rows:[{id:'AcmeAI/image-3'},{id:'RealOrg/voice'}]},
 {name:'latest_spaces',kind:'space',rows:[{id:'RealOrg/demo'}]}
];
test('source dedup, existing organization exclusion and model grouping',()=>{
 const a=candidateNamespaces(fixtures,new Set(['qwen']));
 assert.deepEqual(a.map(x=>x.namespace),['AcmeAI','person','RealOrg']);
 assert.equal(a[0].models.length,3);assert.equal(a[2].spaces.length,1);
});
test('organization evidence is NOT legal company verification or permission to publish',async()=>{
 const fetchImpl=async url=>{
  const ns=new URL(url).pathname.split('/').at(-1);
  return ns==='person'?response({},404):response({name:ns});
 };
 const out=await discoverPublishers({feedOverride:fixtures,known:new Set(['qwen']),fetchImpl,date:'2026-11-02'});
 assert.deepEqual(out.candidates.map(x=>x.namespace),['AcmeAI','RealOrg']);
 assert.equal(out.stats.profileMisses,1);assert.equal(out.productionPublishAllowed,false);
 assert.equal(out.candidates[0].entityClassification,'huggingface_organization_not_verified_company');
 assert.equal(out.candidates[0].unverifiedFields.officialWebsite,null);
 assert.deepEqual(out.reviewGroups.map(x=>x.candidates.length),[2,0]);
 assert.ok(out.candidates.every(x=>!x.publishApproved&&!x.visibleToPublic));
});
test('20 maximum per run and review groups capped at ten each',async()=>{
 const many=[{name:'latest_models',kind:'model',rows:Array.from({length:36},(_,i)=>({id:'org'+i+'/demo'}))}];
 const out=await discoverPublishers({feedOverride:many,fetchImpl:async url=>response({name:new URL(url).pathname.split('/').at(-1)}),date:'2026-11-02'});
 assert.equal(out.candidates.length,20);assert.deepEqual(out.reviewGroups.map(x=>x.candidates.length),[10,10]);
 await assert.rejects(()=>discoverPublishers({feedOverride:many,max:21}),/BATCH_LIMIT/);
});
test('fixed origin, bounded 429 retry, no unapproved domains',async()=>{
 let n=0;const v=await hubJson('/api/models',{fetchImpl:async()=>++n===1?response(null,429):response([]),sleep:async()=>{}});
 assert.deepEqual(v,[]);assert.equal(n,2);
 await assert.rejects(()=>hubJson('https://evil.test/api/models'),/UNTRUSTED_DISCOVERY_API/);
 await assert.rejects(()=>hubJson('/api/models',{fetchImpl:async()=>response(null,403)}),/HUB_HTTP_403/);
});
