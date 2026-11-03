import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditOfficialObservations} from '../lib/market-official-observations.mjs';
import {materializeCandidateCatalog} from '../lib/market-candidate-review-build.mjs';
import {buildOfficialGapQueue} from '../lib/market-official-gap-queue.mjs';
import {regionEvidenceLevel} from '../lib/market-evidence-readiness.mjs';

const load=name=>JSON.parse(readFileSync(new URL('../data/company-intake/'+name,import.meta.url),'utf8'));
const batches=['001','002','003'];
const candidates=batches.map(b=>load('batch-'+b+'.json'));
const sources=batches.map(b=>load('batch-'+b+'-official-observations.json'));
const find=id=>sources.flatMap(s=>s.products).find(p=>p.id===id);
const verifiedHost=(p,u)=>{const h=new URL(u).hostname.toLowerCase();return p.officialHosts.some(x=>h===x||h.endsWith('.'+x))};

test('Mistral Vibe export controls are NOT interpreted as a global allowed-country list',()=>{
 const p=find('mistral-le-chat'),r=p.facts.regions;
 assert.equal(r.source,'https://legal.mistral.ai/terms/row-consumer-terms/');
 assert.equal(r.checkedAt,'2026-11-03');
 assert.equal(regionEvidenceLevel(r),'restrictions_only');
 assert.match(r.text,/欧盟、美国和新加坡/);
 assert.match(r.text,/克里米亚、顿涅茨克、卢甘斯克/);
 assert.match(r.text,/并非所有允许注册、付款和模型可用国家/);
 assert.ok(verifiedHost(p,r.source));
 assert.equal(r.additionalEvidence[0].source,'https://legal.mistral.ai/terms/eu-consumers-terms-of-service/');
 assert.equal(r.additionalEvidence[0].status,'observed');
 assert.ok(verifiedHost(p,r.additionalEvidence[0].source));
});
test('Tabnine local legality is only a restriction; checkout methods stay missing',()=>{
 const p=find('tabnine'),r=p.facts.regions;
 assert.equal(r.source,'https://www.tabnine.com/terms-of-use/');
 assert.equal(r.checkedAt,'2026-11-03');
 assert.equal(regionEvidenceLevel(r),'restrictions_only');
 assert.match(r.text,/所在国家的法律/);
 assert.match(r.text,/并没有公布/);
 assert.equal(p.facts.payment.status,'missing');
 assert.ok(verifiedHost(p,r.source));
});
test('Synthesia video output provenance is C2PA product behavior, not territorial subscription availability',()=>{
 const p=find('synthesia');
 assert.equal(p.facts.regions.status,'missing');
 const a=p.facts.models.additionalEvidence.find(x=>x.source.includes('what-does-the-eu-ai-act-article-50'));
 assert.ok(a);
 assert.equal(a.checkedAt,'2026-11-03');
 assert.equal(a.status,'observed');
 assert.match(a.text,/C2PA/);
 assert.match(a.text,/防篡改/);
 assert.match(a.text,/不是视频生成地区可用性清单/);
 assert.ok(verifiedHost(p,a.source));
});
test('Scite API/MCP permits bounded research, never bulk scrape, resell or model training',()=>{
 const p=find('scite');
 assert.equal(p.facts.regions.status,'missing');
 const a=p.facts.commercial.additionalEvidence.find(x=>x.scope.includes('api_mcp_authorized_research'));
 assert.ok(a);
 assert.equal(a.source,'https://scite.ai/terms');
 assert.equal(a.checkedAt,'2026-11-03');
 for(const phrase of ['API','MCP','批量','转售','训练'])assert.ok(a.text.includes(phrase),phrase);
 assert.ok(verifiedHost(p,a.source));
});
test('source coverage is 204/210; five region fields and Tabnine payment remain unresolved; no candidate leaks',()=>{
 const report=materializeCandidateCatalog(candidates,sources);
 assert.equal(report.candidateProducts,30);
 assert.equal(report.factCells,210);
 assert.deepEqual(report.totals,{observed:204,missing:6,conflict:0});
 assert.deepEqual(report.geography,{missing:5,restrictions_only:17,provider_specific_restrictions:3,
  broad_market_statement:1,other_observation_not_country_proof:4,country_by_country_verified:0});
 assert.ok(report.products.every(p=>!p.visibleToPublic&&!p.publishApproved&&!p.seoIndex));
 const queue=buildOfficialGapQueue(sources,'2026-11-03');
 assert.equal(queue.missingFields,6);
 assert.deepEqual(queue.perField,{price:0,free:0,models:0,regions:5,commercial:0,payment:1,company:0});
 const unresolved=sources.flatMap(s=>s.products).filter(p=>p.facts.regions.status==='missing').map(p=>p.id).sort();
 assert.deepEqual(unresolved,['devin-desktop','freepik-ai','notion-ai','scite','synthesia']);
 for(let i=0;i<3;i++){
  const gate=auditOfficialObservations(sources[i],candidates[i],{today:'2026-11-03'});
  assert.deepEqual(gate.issues,[],JSON.stringify(gate.issues));
  assert.equal(gate.readyForPublication,false);
 }
});
