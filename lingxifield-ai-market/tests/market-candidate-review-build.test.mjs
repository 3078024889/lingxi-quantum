import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {materializeCandidateCatalog} from '../lib/market-candidate-review-build.mjs';
import {renderCandidateReviewHtml} from '../lib/market-candidate-review-html.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../data/company-intake/'+name,import.meta.url),'utf8'));
const versions=['001','002','003'];
const data=()=>[versions.map(n=>read('batch-'+n+'.json')),
 versions.map(n=>read('batch-'+n+'-official-observations.json'))];

test('all 30 candidate products and 28 deduplicated publisher groups materialize, with no approvals',()=>{
 const r=materializeCandidateCatalog(...data());
 assert.equal(r.candidateProducts,30);
 assert.equal(r.publisherGroups,28);
 assert.equal(r.factCells,210);
 assert.deepEqual(r.totals,{observed:187,missing:23,conflict:0});
 assert.equal(new Set(r.products.map(p=>p.id)).size,30);
 assert.ok(r.products.every(p=>p.visibleToPublic===false&&p.publishApproved===false&&p.seoIndex===false));
 assert.equal(r.products.find(p=>p.id==='cursor').legalEntity,'Anysphere, Inc.');
 assert.equal(r.products.find(p=>p.id==='cursor').parentGroup,'SpaceX');
 assert.equal(r.products.find(p=>p.id==='leonardo').parentGroupId,'canva');
 assert.equal(r.products.find(p=>p.id==='github-copilot').parentGroupId,'microsoft');
 assert.equal(r.products.find(p=>p.id==='microsoft-copilot').parentGroupId,'microsoft');
 assert.equal(r.products.find(p=>p.id==='adobe-firefly').legalEntity,null);
 assert.ok(r.products.every(p=>p.listed==='not_verified'&&p.founded===null));
});

test('real source-backed 7-field data is attached, no missing field becomes fictitious fact',()=>{
 const r=materializeCandidateCatalog(...data());
 for(const p of r.products){
  assert.equal(Object.keys(p.facts).length,7,p.id);
  assert.equal(p.recordedCount+p.missingCount+p.conflicts,7,p.id);
  for(const [name,f] of Object.entries(p.facts)){
   if(f.status==='missing')assert.equal(f.text,null,p.id+':'+name);
   else{assert.ok(f.source.startsWith('https://'),p.id+':'+name);
    assert.ok(f.checkedAt&&f.scope&&f.text,p.id+':'+name)}
  }
 }
 assert.equal(r.products.find(p=>p.id==='cursor').regionalEvidence,'not_documented');
});

test('candidate review HTML has 30 directly expandable product rows and in-cell legal/company facts',()=>{
 const review=materializeCandidateCatalog(...data());
 const html=renderCandidateReviewHtml(review);
 assert.equal((html.match(/<tr class="product"/g)||[]).length,30);
 assert.equal((html.match(/<tr class="detail"/g)||[]).length,30);
 assert.equal((html.match(/<details>/g)||[]).length,30);
 for(const id of ['cursor','canva-magic-studio','github-copilot','adobe-firefly','replicate','openrouter'])
  assert.ok(html.includes('data-id="'+id+'"'),id);
 for(const name of ['公司名称','法人主体','所属集团','是否上市','成立时间'])
  assert.ok(html.includes(name),name);
 assert.match(html,/noindex,nofollow,noarchive/);
 assert.match(html,/Content-Security-Policy/);
 assert.match(html,/id="search"/);
 assert.match(html,/id="category"/);
 assert.match(html,/id="status"/);
 assert.ok(!html.includes('fetch('));
 assert.ok(!html.includes('localStorage'));
 assert.ok(html.includes('visibleToPublic')===false);
});

test('HTML escapes user/vendor-provided text including script tags and attributes',()=>{
 const r=materializeCandidateCatalog(...data());
 const p=r.products[0];
 p.name='<img src=x onerror=alert(1)>';
 p.company='"><script>window.pwned=1</script>';
 const html=renderCandidateReviewHtml(r);
 assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
 assert.ok(!html.includes('<img src=x onerror=alert(1)>'));
 assert.ok(!html.includes('<script>window.pwned=1</script>'));
 assert.ok(html.includes('&lt;script&gt;window.pwned=1&lt;/script&gt;'));
});

test('unreviewed products fail closed on forged source, changed approval, or batch count',()=>{
 let [cohorts,observations]=data();
 cohorts[0].products[0].publishApproved=true;
 assert.throws(()=>materializeCandidateCatalog(cohorts,observations),/CANDIDATE_ID_APPROVAL/);
 [cohorts,observations]=data();
 observations[0].products[0].facts.price.source='https://cursor.com.attacker.invalid/pricing';
 assert.throws(()=>materializeCandidateCatalog(cohorts,observations),/UNTRUSTED_CANDIDATE_FACT_SOURCE/);
 [cohorts,observations]=data();
 cohorts[0].products.pop();
 assert.throws(()=>materializeCandidateCatalog(cohorts,observations),/CANDIDATE_BATCH_NOT_HELD/);
});

test('CLI produces complete 30-row HTML and normalized JSON without altering public catalog',()=>{
 const dir=mkdtempSync(join(tmpdir(),'siai-review-'));
 try{
  const htmlFile=join(dir,'review.html'),jsonFile=join(dir,'review.json');
  const out=spawnSync(process.execPath,[new URL('../scripts/build-candidate-review.mjs',import.meta.url).pathname,
   '--html='+htmlFile,'--json='+jsonFile],{encoding:'utf8',timeout:18000});
  assert.equal(out.status,0,out.stderr+'\n'+out.stdout);
  const j=JSON.parse(readFileSync(jsonFile,'utf8'));
  const html=readFileSync(htmlFile,'utf8');
  assert.equal(j.candidateProducts,30);
  assert.equal(j.publisherGroups,28);
  assert.equal(j.totals.missing,23);
  assert.match(html,/30 款候选产品内部审核/);
  assert.match(html,/Anysphere, Inc\./);
  assert.equal(j.products.some(p=>p.publishApproved),false);
 }finally{rmSync(dir,{recursive:true,force:true})}
});
