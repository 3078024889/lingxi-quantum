import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync,mkdtempSync,rmSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildEvidenceReadiness,evidenceReportMarkdown} from '../lib/market-evidence-readiness.mjs';
const curatedFact={price:'$20',priceSource:'https://a.test/price',free:'Free trial',
 freeSource:'https://a.test/free',models:'Test model',modelsSource:'https://a.test/models',
 region:'US',regionSource:'https://a.test/region',commercial:'Licensed',
 commercialSource:'https://a.test/terms',payments:['Card'],paymentSource:'https://a.test/pay'};
const fact=(status,key)=>status==='missing'?{status,reason:'Not yet independently verified.'}:
 {status,text:'Specific sourced public evidence for '+key,source:'https://a.test/'+key,
 checkedAt:'2026-11-02',scope:'publisher_page',...(status==='conflict'?{conflictingSource:'https://a.test/other'}:{})};
const entry=(id,overrides={})=>({id,name:id,officialHosts:['a.test'],reviewStatus:'unapproved',
 facts:Object.fromEntries(['price','free','models','regions','commercial','payment','company'].map(k=>[k,fact('observed',k)])),
 ...overrides});
const cohort=(code,products)=>({batch:code,intakePaused:true,visibleToPublic:false,
 products:products.map(p=>({id:p.id,reviewed:false,publishApproved:false}))});
const input=()=>{
 const batchProducts=[entry('alpha'),entry('beta',{facts:{...entry('beta').facts,free:fact('missing','free')}})];
 return {curatedIds:Array.from({length:32},(_,i)=>'p'+i),
 curatedFacts:Object.fromEntries(Array.from({length:32},(_,i)=>['p'+i,{...curatedFact}])),
 cohorts:[cohort('B001',batchProducts),cohort('B002',[]),cohort('B003',[])],
 observations:[{batch:'B001',products:batchProducts},{batch:'B002',products:[]},{batch:'B003',products:[]}],
 asOf:'2026-11-02'};
};
test('recorded 32x6 sources never imply independent legal/payment verification',()=>{
 const v=buildEvidenceReadiness(input());
 assert.equal(v.curated.count,32);
 assert.equal(v.curated.recordedWithSources,192);
 assert.equal(v.curated.realUserCheckoutVerified,false);
 assert.equal(v.candidateIntake.observed,13);
 assert.equal(v.candidateIntake.missing,1);
 assert.equal(v.candidateIntake.publishReady,0);
 assert.equal(v.candidateIntake.reviewQueue[0].id,'alpha');
 assert.equal(v.externalObservability.actualSearchTrafficMeasured,false);
 assert.equal(v.safety.structurallyValid,false); // fixtures deliberately contain 2 rather than 30 staged products
});
test('reports missing source, future-dated facts and any attempted publication',()=>{
 const x=input();
 delete x.curatedFacts.p0.priceSource;
 x.observations[0].products[0].facts.price.checkedAt='2026-11-03';
 x.cohorts[0].products[0].publishApproved=true;
 const v=buildEvidenceReadiness(x);
 assert.equal(v.curated.missingFieldPairs,1);
 assert.equal(v.candidateIntake.publishReady,0);
 assert.ok(v.safety.structuralIssues.some(x=>x.code==='INVALID_OBSERVATION_SOURCE_OR_DATE'));
 assert.ok(v.safety.structuralIssues.some(x=>x.code==='STAGED_PRODUCT_HAS_APPROVAL'));
});
test('markdown queue explicitly distinguishes observed pages from verified products',()=>{
 const v=buildEvidenceReadiness(input()),m=evidenceReportMarkdown(v);
 assert.match(m,/not independent fact verification/);
 assert.match(m,/132|13/);
 assert.match(m,/B001 \| alpha/);
 assert.match(m,/Candidate products already approved for publication: 0/);
});
test('real CLI confirms 32 curated records and every nonpublic intake product with seven auditable fields',()=>{
 const temp=mkdtempSync(join(tmpdir(),'siai-evidence-'));
 try{
  const json=join(temp,'readiness.json'),md=join(temp,'readiness.md');
  const cli=spawnSync(process.execPath,[new URL('../scripts/report-evidence-readiness.mjs',import.meta.url).pathname,
   '--json='+json,'--markdown='+md],{encoding:'utf8',timeout:15000});
  assert.equal(cli.status,0,cli.stdout+'\n'+cli.stderr);
  const report=JSON.parse(readFileSync(json,'utf8'));
  assert.equal(report.curated.count,32);
  assert.equal(report.curated.recordedWithSources,192);
  const intakeCount=readdirSync(new URL('../data/company-intake/',import.meta.url)).filter(f=>/^batch-\d{3}\.json$/.test(f)).length*10;
  assert(intakeCount>=100);
  assert.equal(report.candidateIntake.products,intakeCount);
  assert.equal(report.candidateIntake.factCells,intakeCount*7);
  assert.equal(report.candidateIntake.publishReady,0);
  assert.equal(report.candidateIntake.observed+report.candidateIntake.missing+report.candidateIntake.conflict,intakeCount*7);
  assert.equal(report.safety.structurallyValid,true);
  assert.match(readFileSync(md,'utf8'),/Candidate review order/);
 }finally{rmSync(temp,{recursive:true,force:true})}
});
