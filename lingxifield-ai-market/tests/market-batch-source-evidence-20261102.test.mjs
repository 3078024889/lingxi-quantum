import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {materializeCandidateCatalog} from '../lib/market-candidate-review-build.mjs';
import {auditOfficialObservations} from '../lib/market-official-observations.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../data/company-intake/'+name,import.meta.url),'utf8'));
const ids=['001','002','003'];
const cohorts=ids.map(n=>read('batch-'+n+'.json'));
const packs=ids.map(n=>read('batch-'+n+'-official-observations.json'));
const updated=[
 ['microsoft-copilot','payment','support.microsoft.com'],
 ['recraft','price','www.recraft.ai'],
 ['canva-magic-studio','models','www.canva.com'],
 ['mistral-le-chat','payment','help.mistral.ai'],
 ['canva-magic-studio','models','www.canva.com'],
 ['mistral-le-chat','payment','help.mistral.ai'],
 ['tabnine','free','www.tabnine.com'],
 ['microsoft-copilot','commercial','www.microsoft.com'],
 ['freepik-ai','payment','www.freepik.com'],
 ['together-ai','commercial','www.together.ai'],
 ['groqcloud','commercial','console.groq.com'],
 ['fireworks-ai','company','fireworks.ai'],
 ['fireworks-ai','payment','fireworks.ai'],
 ['fireworks-ai','commercial','fireworks.ai'],
 ['fireworks-ai','free','fireworks.ai']
];
test('thirteen newly sourced factual fields remain dated, scoped and strictly pinned to official origin',()=>{
 const rows=packs.flatMap(p=>p.products);
 for(const [id,key,host] of updated){
  const p=rows.find(x=>x.id===id);
  assert.ok(p,id);
  const f=p.facts[key];
  assert.equal(f.status,'observed',id+':'+key);
  assert.equal(new URL(f.source).hostname,host,id+':'+key);
  assert.equal(f.checkedAt,'2026-11-02',id+':'+key);
  assert.ok(f.scope?.length>12&&f.text?.length>70,id+':'+key);
 }
});
test('Microsoft and Magnific payments are NOT marketed as universal Freepik/Copilot checkout',()=>{
 const rows=packs.flatMap(p=>p.products),f=id=>rows.find(x=>x.id===id).facts.payment;
 assert.match(f('microsoft-copilot').text,/地区和账户/);
 assert.match(f('freepik-ai').text,/Magnific/);
 assert.match(f('freepik-ai').text,/不推断 Freepik/);
 assert.match(f('fireworks-ai').text,/Stripe/);
 assert.match(f('fireworks-ai').text,/未确认 PayPal/);
});
test('Fireworks free trial is one-time marketing claim rather than verified entitlement or unlimited service',()=>{
 const p=packs[2].products.find(x=>x.id==='fireworks-ai');
 assert.match(p.facts.free.text,/USD 1/);
 assert.match(p.facts.free.text,/一次性/);
 assert.match(p.facts.free.text,/实时账户页面/);
 assert.ok(p.facts.free.additionalEvidence.length>0);
 assert.match(p.facts.commercial.text,/第三方模型/);
 assert.match(p.facts.company.text,/Fireworks.ai, Inc/);
});
test('public catalog still 32 products; 30 held candidate rows, 28 deduplicated vendors',()=>{
 const r=materializeCandidateCatalog(cohorts,packs);
 assert.deepEqual(r.totals,{observed:192,missing:18,conflict:0});
 assert.equal(r.candidateProducts,30);
 assert.equal(r.publisherGroups,28);
 assert.equal(r.products.find(p=>p.id==='fireworks-ai').legalEntity,'Fireworks.ai, Inc.');
 assert.ok(r.products.every(p=>p.visibleToPublic===false&&p.publishApproved===false&&p.seoIndex===false));
 for(let i=0;i<3;i++){
  const a=auditOfficialObservations(packs[i],cohorts[i],{today:'2026-11-02'});
  assert.equal(a.issues.length,0,JSON.stringify(a.issues));
  assert.equal(a.readyForPublication,false);
 }
});

test('Mistral Le Chat 2026 rebrand uses current Vibe name and official direct URL without losing legacy search',()=>{
 const p=cohorts[1].products.find(x=>x.id==='mistral-le-chat');
 const observed=packs[1].products.find(x=>x.id===p.id);
 assert.equal(p.name,'Mistral Vibe（原 Le Chat）');
 assert.equal(p.website,'https://chat.mistral.ai/');
 assert.ok(p.aliases.includes('Mistral Le Chat'));
 assert.equal(observed.name,p.name);
 assert.ok(observed.facts.company.additionalEvidence.some(x=>
  x.source==='https://help.mistral.ai/en/articles/682992-le-chat-is-now-vibe'));
 const product=materializeCandidateCatalog(cohorts,packs).products.find(x=>x.id===p.id);
 assert.equal(product.website,p.website);
 assert.match(product.name,/Vibe/);
});

test('Devin Desktop business-code ownership uses the exact vendor-linked Cognition contract',()=>{
 const row=packs[1].products.find(x=>x.id==='devin-desktop');
 const f=row.facts.commercial;
 assert.equal(f.status,'observed');
 assert.equal(f.source,'https://cognition.com/legal/platform-terms-of-service');
 assert.ok(row.officialHosts.includes('cognition.com'));
 assert.match(f.text,/内部业务/);
 assert.match(f.text,/代码/);
 assert.match(f.text,/第三方知识产权/);
 const data=materializeCandidateCatalog(cohorts,packs);
 const card=data.products.find(x=>x.id==='devin-desktop');
 assert.equal(card.facts.commercial.source,f.source);
 assert.equal(card.publishApproved,false);
});

test('Devin legal parent origin may not broaden official source trust for other publishers',()=>{
 const original=auditOfficialObservations(packs[1],cohorts[1],{today:'2026-11-02'});
 assert.deepEqual(original.issues,[]);
 const tampered=structuredClone(packs[1]);
 const other=tampered.products.find(x=>x.id==='tabnine');
 other.officialHosts.push('cognition.com');
 const result=auditOfficialObservations(tampered,cohorts[1],{today:'2026-11-02'});
 assert.ok(result.issues.some(issue=>issue.id==='tabnine'&&issue.code==='INVALID_PUBLISHER_HOST_PIN'));
 const forged=structuredClone(packs[1]);
 const devin=forged.products.find(x=>x.id==='devin-desktop');
 devin.officialHosts.push('cognition.com.attacker.invalid');
 const bad=auditOfficialObservations(forged,cohorts[1],{today:'2026-11-02'});
 assert.ok(bad.issues.some(issue=>issue.id==='devin-desktop'&&issue.code==='INVALID_PUBLISHER_HOST_PIN'));
});


test('Devin Desktop payment choices are first-party scoped, not claimed universal',()=>{
 const row=packs[1].products.find(x=>x.id==='devin-desktop');
 const fact=row.facts.payment;
 assert.equal(fact.status,'observed');
 assert.equal(fact.source,'https://docs.devin.ai/desktop/accounts/usage');
 assert.equal(fact.checkedAt,'2026-11-02');
 assert.match(fact.text,/Apple Pay/);
 assert.match(fact.text,/Google Pay/);
 assert.match(fact.text,/Klarna/);
 assert.match(fact.text,/部分地区/);
 assert.match(fact.text,/Stripe/);
 const audit=auditOfficialObservations(packs[1],cohorts[1],{today:'2026-11-02'});
 assert.equal(audit.issues.length,0,JSON.stringify(audit.issues));
 assert.equal(audit.readyForPublication,false);
});


test('Gamma feature-specific US/Canada mobile app coverage is not a global country/payment whitelist',()=>{
 const p=packs[0].products.find(p=>p.id==='gamma');
 const region=p.facts.regions;
 assert.equal(region.status,'observed');
 assert.equal(region.source,'https://help.gamma.app/en/articles/11016450-does-gamma-have-a-mobile-app');
 assert.equal(region.checkedAt,'2026-11-02');
 assert.match(region.text,/美国、加拿大/);
 assert.match(region.text,/移动浏览器/);
 assert.match(region.text,/不是逐国注册、付款/);
 assert.equal(region.additionalEvidence[0].source,'https://help.gamma.app/en/articles/11048601-why-am-i-having-trouble-connecting-to-gamma');
 const validated=auditOfficialObservations(packs[0],cohorts[0],{today:'2026-11-02'});
 assert.deepEqual(validated.issues,[]);
 assert.equal(validated.readyForPublication,false);
});

test('Tabnine separates annual $39 Code Assistant from $59 Agentic and additional LLM tokens',()=>{
 const p=packs[1].products.find(p=>p.id==='tabnine');
 assert.equal(p.facts.price.source,'https://www.tabnine.com/pricing/');
 assert.match(p.facts.price.text,/39\/用户\/月/);
 assert.match(p.facts.price.text,/59\/用户\/月/);
 assert.match(p.facts.price.text,/年度订阅/);
 assert.match(p.facts.price.text,/5%/);
 assert.equal(p.facts.payment.status,'missing');
 assert.match(p.facts.payment.reason,/Get a quote/);
});
