import test from 'node:test';import assert from 'node:assert/strict';
import {hfToIdentity,openAlexInstitution,fetchOpenAlexInstitutions} from './data-center-source-adapters.mjs';
const t='2026-10-29T00:00:00Z';
test('Hugging Face model identity',()=>assert.equal(hfToIdentity({id:'org/model'},'model',t).type,'model'));
test('Spaces treated as product candidate',()=>assert.equal(hfToIdentity({id:'org/demo'},'product',t).type,'product'));
test('private repos excluded',()=>assert.equal(hfToIdentity({id:'org/private',private:true},'model',t),null));
test('institution not classified as verified company',()=>assert.equal(openAlexInstitution({id:'https://openalex.org/I123',display_name:'Research University'},t).status,'candidate'));
test('OpenAlex 429 surfaces error',async()=>assert.rejects(fetchOpenAlexInstitutions({fetcher:async()=>({ok:false,status:429})}),/429/));
test('OpenAlex returns bounded candidates',async()=>{const r=await fetchOpenAlexInstitutions({fetcher:async()=>({ok:true,json:async()=>({results:[{id:'https://openalex.org/I12',display_name:'University'}]})})});assert.equal(r.candidates.length,1);assert.equal(r.publicationApproved,false);});
