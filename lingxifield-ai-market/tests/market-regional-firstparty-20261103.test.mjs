import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {materializeCandidateCatalog} from '../lib/market-candidate-review-build.mjs';
import {regionEvidenceLevel} from '../lib/market-evidence-readiness.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../data/company-intake/'+p,import.meta.url),'utf8'));
const cohorts=[read('batch-001.json'),read('batch-002.json'),read('batch-003.json')];
const obs=[read('batch-001-official-observations.json'),read('batch-002-official-observations.json'),read('batch-003-official-observations.json')];
const byId=id=>obs.flatMap(p=>p.products).find(p=>p.id===id);
const sourceCheck=(p,source)=>{const url=new URL(source);assert.equal(url.protocol,'https:');assert.ok(p.officialHosts.some(h=>url.hostname===h||url.hostname.endsWith('.'+h)),p.id);};

test('Cursor page proves model-provider geographic restrictions, not all-country availability',()=>{
 const p=byId('cursor'),region=p.facts.regions;
 assert.equal(region.status,'observed');
 assert.equal(region.source,'https://cursor.com/docs/account/regions');
 assert.match(region.text,/Auto/);
 assert.match(region.text,/供应商/);
 assert.match(region.text,/不构成逐国官方可用白名单/);
 assert.equal(regionEvidenceLevel(region),'provider_specific_restrictions');
 sourceCheck(p,region.source);
});

test('Canva statement documents blocking Russia and separately labels regional payment rails',()=>{
 const p=byId('canva-magic-studio'),r=p.facts.regions;
 assert.equal(r.source,'https://www.canva.com/newsroom/news/exiting-russia/');
 assert.equal(regionEvidenceLevel(r),'restrictions_only');
 assert.match(r.text,/俄罗斯/);
 assert.match(r.text,/其他国家/);
 const payment=r.additionalEvidence[0];
 assert.equal(payment.source,'https://www.canva.com/help/payment-options/');
 assert.match(payment.text,/新加坡 GrabPay/);
 assert.match(payment.scope,/not_ai_availability/);
 sourceCheck(p,r.source);sourceCheck(p,payment.source);
});

test('Ideogram export control terms are not mislabeled as a geographic whitelist',()=>{
 const p=byId('ideogram'),r=p.facts.regions;
 assert.equal(r.source,'https://ideogram.ai/legal/tos');
 assert.equal(regionEvidenceLevel(r),'restrictions_only');
 assert.match(r.text,/2024-08-14/);
 assert.match(r.text,/不公布逐国注册/);
 sourceCheck(p,r.source);
});

test('Figma AI referral 25 eligible countries relate to a campaign only; Figma Make stays untested',()=>{
 const p=byId('figma-make'),r=p.facts.regions;
 assert.equal(regionEvidenceLevel(r),'other_observation_not_country_proof');
 assert.match(r.text,/25 个/);
 assert.match(r.text,/不是 Figma Make/);
 assert.match(r.scope,/promotion/);
 sourceCheck(p,r.source);
});

test('candidate source material cannot automatically publish the 4 extra records',()=>{
 const data=materializeCandidateCatalog(cohorts,obs);
 assert.equal(data.products.length,30);
 assert.deepEqual(data.totals,{observed:194,missing:16,conflict:0});
 for(const id of ['cursor','canva-magic-studio','ideogram','figma-make']){
  const p=data.products.find(p=>p.id===id);
  assert.equal(p.visibleToPublic,false);
  assert.equal(p.publishApproved,false);
  assert.equal(p.searchablePublicly,false);
  assert.notEqual(p.regionEvidenceQuality,'country_by_country_verified');
 }
});

test('Pika terms state provider-model geography and sanctioned-user restrictions without claiming country coverage',()=>{
 const p=byId('pika'),r=p.facts.regions;
 assert.equal(r.status,'observed');
 assert.equal(r.source,'https://pika.art/terms-of-service');
 assert.equal(regionEvidenceLevel(r),'provider_specific_restrictions');
 assert.match(r.text,/美国制裁/);
 assert.match(r.text,/VPN/);
 assert.match(r.text,/不是 Pika 所有国家的正面可用清单/);
 sourceCheck(p,r.source);
});
test('Leonardo official terms distinguish embargo subject exclusions from verified supported countries',()=>{
 const p=byId('leonardo'),r=p.facts.regions;
 assert.equal(r.status,'observed');
 assert.equal(r.source,'https://leonardo.ai/terms-of-service');
 assert.equal(regionEvidenceLevel(r),'restrictions_only');
 assert.match(r.text,/第13.8节/);
 assert.match(r.text,/禁运/);
 assert.match(r.text,/不能据此推断其他国家/);
 sourceCheck(p,r.source);
});

test('negative country coverage wording cannot be upgraded into broad positive market evidence',()=>{
 const observed=scope=>({status:'observed',scope});
 assert.equal(regionEvidenceLevel(observed('provider_model_specific_not_full_country_coverage')),'provider_specific_restrictions');
 assert.equal(regionEvidenceLevel(observed('official_embargo_restriction_country_coverage_unknown')),'restrictions_only');
 assert.equal(regionEvidenceLevel(observed('not_full_country_coverage')),'other_observation_not_country_proof');
 assert.equal(regionEvidenceLevel(observed('170plus_markets_publisher_public_statement')),'broad_market_statement');
 assert.equal(regionEvidenceLevel(observed('specific_promotion_eligible_countries_not_full_platform_access')),'other_observation_not_country_proof');
 assert.equal(regionEvidenceLevel({status:'missing'}),'missing');
});
