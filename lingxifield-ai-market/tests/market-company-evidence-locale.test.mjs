import test from 'node:test';
import assert from 'node:assert/strict';
import {COMPANY_EVIDENCE,COMPANY_EVIDENCE_IDS} from '../lib/market-company-evidence.ts';
import {localizeCompanyEvidence} from '../lib/market-company-evidence-locale.ts';
const locales=['zh','en','ja','ko','fr','de','es','pt','ar'];
test('all nine languages keep the same official citations and never invent corporate facts',()=>{
 for(const id of COMPANY_EVIDENCE_IDS){
  for(const language of locales){
   const original=COMPANY_EVIDENCE[id],view=localizeCompanyEvidence(id,language,original);
   assert.ok(view,id+' '+language);
   assert.equal(view.publisherSource,original.publisherSource);
   for(const key of ['founded','headquarters','funding','listing','projectStarted','scale']){
    if(view[key]){assert.ok(original[key],id+' fabricated '+key);assert.equal(view[key].source,original[key].source);}
   }
  }
 }
});
test('English, French and Arabic corporate fields do not leak Chinese-only financial prose',()=>{
 for(const id of COMPANY_EVIDENCE_IDS){
  for(const language of ['en','fr','ar']){
   const v=localizeCompanyEvidence(id,language,COMPANY_EVIDENCE[id]);
   for(const key of ['headquarters','funding','listing','projectStarted','scale']){
    if(v[key])assert.doesNotMatch(v[key].text,/[\u4e00-\u9fff]/,id+' '+language+' '+key);
   }
  }
 }
});
test('project birth never becomes the independent AI model company founding year',()=>{
 assert.match(localizeCompanyEvidence('kling','en',COMPANY_EVIDENCE.kling).projectStarted.text,/not the Kling launch date/);
 assert.match(localizeCompanyEvidence('comfyui','en',COMPANY_EVIDENCE.comfyui).projectStarted.text,/2023/);
 assert.equal(localizeCompanyEvidence('whisper','en',COMPANY_EVIDENCE.whisper).founded.text,'2015');
});
