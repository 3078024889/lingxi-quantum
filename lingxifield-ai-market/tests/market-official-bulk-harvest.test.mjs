import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditOfficialObservations} from '../lib/market-official-observations.mjs';
import {buildEvidenceReadiness} from '../lib/market-evidence-readiness.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const batches=['001','002','003'].map(n=>{
 const batch=JSON.parse(read('data/company-intake/batch-'+n+'.json'));
 const pack=JSON.parse(read('data/company-intake/batch-'+n+'-official-observations.json'));
 return {batch,pack};
});
const additions={
 '001':{'canva-magic-studio':['payment'],gamma:['commercial','models'],'notion-ai':['commercial'],
  'figma-make':['models','commercial','payment'],pika:['payment'],descript:['commercial','payment']},
 '002':{'github-copilot':['regions'],'mistral-le-chat':['commercial','company'],poe:['price','free','commercial'],
  'adobe-firefly':['regions','company','payment'],recraft:['company'],synthesia:['payment','company'],
  'microsoft-copilot':['free'],'freepik-ai':['company','free']},
 '003':{'groqcloud':['price','company'],'fal-ai':['free','commercial'],'consensus':['commercial'],'together-ai':['free','payment']}
};
function find(pack,id){return pack.products.find(p=>p.id===id)}
test('exactly 32 explicitly sourced facts were added across all three held batches',()=>{
 let count=0;
 for(const [i,fields] of Object.entries(additions)){
  const pack=batches[Number(i)-1].pack;
  for(const [id,keys] of Object.entries(fields)){
   const p=find(pack,id);assert.ok(p,id);
   for(const key of keys){
    const f=p.facts[key];count++;
    assert.equal(f.status,'observed',id+':'+key);
    assert.equal(f.checkedAt,'2026-11-02',id+':'+key);
    const h=new URL(f.source).hostname.toLowerCase();
    assert.ok(p.officialHosts.some(root=>h===root||h.endsWith('.'+root)),id+' suspicious host '+h);
    assert.ok(f.scope?.length>=4&&f.text?.length>=16,id+':'+key);
   }
  }
 }
 assert.equal(count,32);
});
test('the 210 observed/missing/conflict slots reconcile, without publishing anyone',()=>{
 const summary=batches.map(({batch,pack})=>auditOfficialObservations(pack,batch,{today:'2026-11-02'}));
 for(const r of summary){assert.deepEqual(r.issues,[]);assert.equal(r.readyForPublication,false)}
 const ids=[...read('lib/market-api-service-catalog.ts').match(/const ALL=\[([^\]]+)\] as const;/)[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
 const source=read('lib/market-researched-facts.ts');
 const a=source.indexOf('={',source.indexOf('RESEARCHED_FACTS:'))+1;
 const b=source.indexOf('};\nexport const MARKET_RESEARCH_CHECKED_AT',a)+1;
 const f=JSON.parse(source.slice(a,b));
 const report=buildEvidenceReadiness({curatedIds:ids,curatedFacts:f,cohorts:batches.map(x=>x.batch),
  observations:batches.map(x=>x.pack),asOf:'2026-11-02'});
 assert.deepEqual([report.candidateIntake.observed,report.candidateIntake.missing,report.candidateIntake.conflict],[183,27,0]);
 assert.equal(report.candidateIntake.factCells,210);
 assert.equal(report.candidateIntake.publishReady,0);
 assert.equal(report.candidateIntake.publishedFromStaging,0);
 assert.deepEqual(report.candidateIntake.regionalEvidence,{
  missing:22,broad_market_statement:1,provider_specific_restrictions:1,
  restrictions_only:6,other_observation_not_country_proof:0
 });
 assert.equal(report.safety.structurallyValid,true,JSON.stringify(report.safety.structuralIssues));
});
test('plan, region and model caveats prevent misleading free/payment/commercial comparisons',()=>{
 const a=batches[0].pack,b=batches[1].pack,c=batches[2].pack;
 assert.match(find(a,'canva-magic-studio').facts.payment.text,/地区|货币/);
 assert.match(find(a,'figma-make').facts.payment.text,/不支持 PayPal/);
 assert.match(find(a,'figma-make').facts.models.text,/GPT-6\.1/);
 assert.match(find(a,'gamma').facts.commercial.text,/内部业务/);
 assert.match(find(a,'descript').facts.commercial.text,/Storyblocks/);
 assert.match(find(b,'adobe-firefly').facts.company.text,/Adobe KK/);
 assert.match(find(b,'poe').facts.free.text,/24 小时|每天/);
 assert.match(find(b,'mistral-le-chat').facts.company.text,/952 418 325/);
 assert.match(find(b,'synthesia').facts.company.text,/10933652/);
 assert.match(find(b,'freepik-ai').facts.free.text,/20 张/);
 assert.match(find(c,'together-ai').facts.free.text,/不提供/);
 assert.match(find(c,'together-ai').facts.payment.text,/不支持虚拟卡/);
 assert.match(find(c,'fal-ai').facts.free.text,/浏览器端免费/);
 assert.match(find(c,'groqcloud').facts.price.text,/USD 0\.15/);
});
test('secondary source links cannot be smuggled from other hosts or future dates',()=>{
 const batch=batches[1].batch,pack=batches[1].pack;
 const fake=structuredClone(pack),p=find(fake,'freepik-ai');
 assert.ok(Array.isArray(p.facts.free.additionalEvidence));
 p.facts.free.additionalEvidence[0].source='https://www.freepik.com.attacker.invalid/fake';
 assert.ok(auditOfficialObservations(fake,batch,{today:'2026-11-02'}).issues.some(x=>x.code==='BAD_SUPPLEMENTAL_SOURCE_OR_SCOPE'));
 const future=structuredClone(pack);
 find(future,'freepik-ai').facts.free.additionalEvidence[0].checkedAt='2027-03-19';
 assert.ok(auditOfficialObservations(future,batch,{today:'2026-11-02'}).issues.some(x=>x.code==='BAD_SUPPLEMENTAL_SOURCE_OR_SCOPE'));
});
