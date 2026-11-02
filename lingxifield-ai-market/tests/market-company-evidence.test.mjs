import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {COMPANY_EVIDENCE,COMPANY_EVIDENCE_IDS,companyPresentationFor} from '../lib/market-company-evidence.ts';
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
  for(const key of ['founded','headquarters','projectStarted','funding','listing','scale']){
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

test('official company scale, funding and product-launch facts are current and individually sourced',()=>{
 const e=COMPANY_EVIDENCE;
 assert.match(e.grok.funding.text,/200/);
 assert.match(e.grok.founded.text,/2023/);
 assert.match(e.grok.headquarters.text,/Austin/);
 assert.match(e.langchain.funding.text,/1\.25/);
 assert.match(e.llamaindex.funding.text,/1900/);
 assert.match(e.lovable.funding.text,/4 亿/);
 assert.match(e.lovable.projectStarted.text,/2024/);
 assert.match(e.midjourney.funding.text,/community-funded/);
 assert.match(e.ollama.scale.text,/900/);
 assert.match(e.transformers.scale.text,/2M/);
});

test('company identity, project dates and exchange status never confuse product with publisher',()=>{
 assert.equal(companyPresentationFor('dify','Dify').name,'LangGenius, Inc.');
 assert.equal(companyPresentationFor('dify','Dify').year,'2023');
 assert.equal(companyPresentationFor('kling','快手').year,'2011');
 assert.equal(companyPresentationFor('kling','快手').listingState,'listed_parent');
 assert.equal(companyPresentationFor('qwen','阿里巴巴').listingState,'listed_parent');
 assert.equal(companyPresentationFor('chatgpt','OpenAI').name,'OpenAI Group PBC');
 assert.equal(companyPresentationFor('comfyui','ComfyUI').kind,'open_source_project');
 assert.equal(companyPresentationFor('comfyui','ComfyUI').year,'2023');
 assert.equal(companyPresentationFor('dify','Dify').listingState,'unconfirmed');
 const src=read('lib/market-company-evidence.ts');
 assert.match(src,/dify\.ai\/legal\/terms-of-service/);
});
