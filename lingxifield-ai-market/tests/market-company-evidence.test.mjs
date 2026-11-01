import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {COMPANY_EVIDENCE,COMPANY_EVIDENCE_IDS} from '../lib/market-company-evidence.ts';
import {PRODUCT_STRENGTHS} from '../lib/market-missing-strengths.ts';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('all 32 products map to sourced corporate, software or open-source entities',()=>{
 assert.equal(COMPANY_EVIDENCE_IDS.length,32);
 assert.equal(new Set(COMPANY_EVIDENCE_IDS).size,32);
 for(const id of COMPANY_EVIDENCE_IDS){
  const e=COMPANY_EVIDENCE[id];
  assert.ok(e,id);
  assert.ok(['company','open_source_project','software_library'].includes(e.kind),id);
  assert.match(e.publisherSource,/^https:\/\//,id);
  for(const key of ['founded','headquarters','projectStarted','funding','listing']){
   const v=e[key];
   if(v){assert.ok(v.text.trim(),id+' '+key);assert.match(v.source,/^https:\/\//,id+' '+key);}
  }
 }
});
test('13 specialized AI/developer products have evidence-backed advantages',()=>{
 assert.equal(Object.keys(PRODUCT_STRENGTHS).length,13);
 for(const value of Object.values(PRODUCT_STRENGTHS)){
  assert.ok(value.text.length>=18);assert.match(value.source,/^https:\/\//);
 }
});
test('search API never invents missing company or SEO/GEO figures',()=>{
 const s=read('lib/platform-repository.ts');
 assert.ok(s.includes('companyEvidenceFor(e.id)'));
 for(const marker of ["year:'待核验'","location:'待核验'","funding:'待核验'","seo:'待核验'","geo:'待核验'"])assert.ok(!s.includes(marker),marker);
});
test('company facts in both consumer views cite their individual official publisher sources',()=>{
 assert.ok(read('app/market-company-snapshot.tsx').includes('companyEvidenceFor'));
 assert.ok(read('app/[lang]/platform/[id]/page.tsx').includes('companyEvidenceFor'));
});
