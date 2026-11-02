import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditOfficialObservations} from '../lib/market-official-observations.mjs';
const read=(file)=>JSON.parse(readFileSync(new URL('../data/company-intake/'+file,import.meta.url),'utf8'));
const a=read('batch-001-official-observations.json');
const b=read('batch-002-official-observations.json');
const ca=read('batch-001.json'), cb=read('batch-002.json');
const find=(pack,id)=>pack.products.find(x=>x.id===id);
test('Notion credits per member distinguish Standard from Select and exhausted Free/Plus trial',()=>{
 const n=find(a,'notion-ai');
 assert.equal(n.facts.free.status,'observed');
 assert.equal(n.facts.free.source,'https://www.notion.com/help/manage-your-ai-credits');
 assert.match(n.facts.free.text,/1,500/);
 assert.match(n.facts.free.text,/500/);
 assert.match(n.facts.free.text,/Free 和 Plus/);
 assert.match(n.facts.models.text,/自动选择模型/);
 assert.match(n.facts.models.text,/用户主动选择模型/);
 assert.equal(n.facts.free.additionalEvidence[0].source,'https://www.notion.com/help/complimentary-ai-responses');
});
test('Figma Make seat entitlement is documented without claiming Figma Make global geography',()=>{
 const f=find(a,'figma-make');
 const e=f.facts.free.additionalEvidence[0];
 assert.equal(e.source,'https://help.figma.com/hc/en-us/articles/31722591905559-Figma-Make-FAQs');
 assert.match(e.text,/Full/);
 assert.match(e.text,/Dev/);
 assert.match(e.text,/K-12/);
 assert.equal(f.reviewStatus,'unapproved');
});
test('Recraft source terms separate free personal-only rights from paid outputs and prohibit AI training',()=>{
 const n=find(b,'recraft');
 assert.equal(n.facts.free.source,'https://www.recraft.ai/legal/terms');
 assert.equal(n.facts.commercial.source,'https://www.recraft.ai/legal/terms');
 assert.match(n.facts.free.text,/属于 Recraft/);
 assert.match(n.facts.free.text,/不等于免费商用/);
 assert.match(n.facts.commercial.text,/付费订阅/);
 assert.match(n.facts.commercial.text,/版权转让/);
 assert.match(n.facts.commercial.text,/禁止将作品用于训练 AI 模型/);
});
test('primary-site official observations still pass host, date, scope and no-publish gates',()=>{
 for(const [p,c] of [[a,ca],[b,cb]]){
  const report=auditOfficialObservations(p,c,{today:'2026-11-03'});
  assert.equal(report.readyForEditorialReview,true,JSON.stringify(report.issues));
  assert.equal(report.readyForPublication,false);
 }
 assert.equal([...a.products,...b.products].filter(x=>x.reviewStatus!=='unapproved').length,0);
});
