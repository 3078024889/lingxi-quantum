import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {reviewCapture,mergeReviewedObservations,verifyLedger} from '../scripts/review-independent-seo-geo.mjs';

const reason='Checked the saved search or model output, source links, locale and exact measurement method.';
const observedAt=new Date(Date.now()-60_000).toISOString();
const reviewedAt=new Date().toISOString();
const knownIds=new Set(['runway','kling','chatgpt','claude']);
const sha=value=>createHash('sha256').update(value).digest('hex');

function serpCapture(overrides={}){
 return {
  source:'independent_serp',captureGroupId:'google-ai-video-sg-20261101',
  observedAt,country:'SG',language:'en',query:'AI video generator',
  engine:'Google',methodVersion:'SERP.manual-capture.v1',
  results:[
   {platformId:'runway',position:1,sourceUrl:'https://runwayml.com',sampleCount:1,sponsored:false},
   {platformId:'kling',position:2,sourceUrl:'https://klingai.com',sampleCount:1,sponsored:false}
  ],...overrides
 };
}
function geoCapture(overrides={}){
 return {
  source:'ai_answer_citation',captureGroupId:'chatgpt-video-sg-20261101',
  observedAt,country:'SG',language:'en',query:'Which AI video tools are cited for professional video generation?',
  engine:'ChatGPT',model:'GPT-6',modelVersion:'GPT-6-2026-11-01',
  methodVersion:'GEO.manual-answer-capture.v1',
  results:[
   {platformId:'runway',mentions:1,citations:1,sourceUrl:'https://runwayml.com',sampleCount:1,sponsored:false},
   {platformId:'kling',mentions:1,citations:1,sourceUrl:'https://klingai.com',sampleCount:1,sponsored:false}
  ],...overrides
 };
}
function reviewed(rawText,capture){
 const hash=sha(rawText);
 return reviewCapture(rawText,{
  captureGroupId:capture.captureGroupId,rawCaptureSha256:hash,
  reviewer:'auditor-1',reviewedAt,
  decisions:capture.results.map(row=>({platformId:row.platformId,approve:true,reason}))
 },{knownIds});
}

test('independent SERP capture requires two reviewed organic results and verifies the exact raw capture',()=>{
 const capture=serpCapture(),raw=JSON.stringify(capture),result=reviewed(raw,capture);
 assert.equal(result.approved.length,2);
 assert.equal(result.rejected.length,0);
 assert.equal(result.approved[0].source,'independent_serp');
 assert.equal(result.approved[0].id,'serp-'+result.approved[0].recordHash.slice(7,31));
 assert.equal(verifyLedger(result.approved).comparisonGroups,1);
 const tampered=raw.replace('position":1','position":9');
 assert.throws(()=>reviewCapture(tampered,{
  captureGroupId:capture.captureGroupId,rawCaptureSha256:sha(raw),reviewer:'auditor-1',reviewedAt,
  decisions:capture.results.map(row=>({platformId:row.platformId,approve:true,reason}))
 },{knownIds}),/CAPTURE_HASH_OR_GROUP_MISMATCH/);
});

test('GEO citations are tied to the same model, model version, locale, query and archived capture',()=>{
 const capture=geoCapture(),raw=JSON.stringify(capture),result=reviewed(raw,capture);
 assert.equal(result.approved.length,2);
 assert.equal(result.approved[0].source,'ai_answer_citation');
 assert.equal(result.approved[0].modelVersion,'GPT-6-2026-11-01');
 assert.equal(verifyLedger(result.approved).comparisonGroups,1);
});

test('missing review decisions, unknown products, duplicate products and sponsored rows are rejected',()=>{
 const capture=serpCapture(),raw=JSON.stringify(capture),hash=sha(raw);
 const base={captureGroupId:capture.captureGroupId,rawCaptureSha256:hash,reviewer:'auditor-1',reviewedAt};
 assert.throws(()=>reviewCapture(raw,{...base,decisions:[]},{knownIds}),/REVIEW_DECISIONS_INCOMPLETE/);
 const sponsored=serpCapture({results:serpCapture().results.map((x,i)=>i===0?{...x,sponsored:true}:x)});
 assert.throws(()=>reviewCapture(JSON.stringify(sponsored),{
  ...base,rawCaptureSha256:sha(JSON.stringify(sponsored)),
  decisions:sponsored.results.map(row=>({platformId:row.platformId,approve:true,reason}))
 },{knownIds}),/SPONSORED_OR_UNVERIFIED_RESULT_NOT_COMPARABLE/);
 const unknown=serpCapture({results:[...serpCapture().results.slice(0,1),{...serpCapture().results[1],platformId:'not-in-catalog'}]});
 assert.throws(()=>reviewCapture(JSON.stringify(unknown),{
  ...base,rawCaptureSha256:sha(JSON.stringify(unknown)),
  decisions:unknown.results.map(row=>({platformId:row.platformId,approve:true,reason}))
 },{knownIds}),/CAPTURE_PRODUCT_UNKNOWN/);
 const duplicate=serpCapture({results:[...serpCapture().results,{...serpCapture().results[0],position:3}]});
 assert.throws(()=>reviewCapture(JSON.stringify(duplicate),{
  ...base,rawCaptureSha256:sha(JSON.stringify(duplicate)),
  decisions:duplicate.results.map(row=>({platformId:row.platformId,approve:true,reason}))
 },{knownIds}),/CAPTURE_DUPLICATE_PRODUCT/);
});

test('a comparative group cannot publish only one approved product or omit a review reason',()=>{
 const capture=serpCapture(),raw=JSON.stringify(capture),hash=sha(raw);
 assert.throws(()=>reviewCapture(raw,{
  captureGroupId:capture.captureGroupId,rawCaptureSha256:hash,reviewer:'auditor-1',reviewedAt,
  decisions:[
   {platformId:'runway',approve:true,reason},
   {platformId:'kling',approve:false,reason:'This row could not be independently verified.'}
  ]
 },{knownIds}),/COMPARISON_REQUIRES_TWO_APPROVED_PRODUCTS/);
 assert.throws(()=>reviewCapture(raw,{
  captureGroupId:capture.captureGroupId,rawCaptureSha256:hash,reviewer:'auditor-1',reviewedAt,
  decisions:capture.results.map(row=>({platformId:row.platformId,approve:true,reason:'too short'}))
 },{knownIds}),/REVIEW_DECISION_INVALID/);
});

test('ledger merge is idempotent, rejects hash conflicts and detects changed rank values',()=>{
 const capture=serpCapture(),raw=JSON.stringify(capture),result=reviewed(raw,capture);
 const once=mergeReviewedObservations([],result.approved);
 const twice=mergeReviewedObservations(once.result,result.approved);
 assert.equal(once.added,2);
 assert.equal(twice.added,0);
 assert.equal(twice.duplicate,2);
 assert.throws(()=>mergeReviewedObservations(once.result,[{...result.approved[0],recordHash:'sha256:'+'0'.repeat(64)}]),/OBSERVATION_ID_HASH_CONFLICT/);
 assert.throws(()=>verifyLedger([{...result.approved[0],position:99},result.approved[1]]),/INDEPENDENT_RECORD_HASH_MISMATCH/);
});

test('published comparative rows require a retained raw capture archive whose digest matches',()=>{
 const capture=serpCapture(),raw=JSON.stringify(capture),result=reviewed(raw,capture);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'seo-geo-capture-'));
 const filename=capture.captureGroupId+'-'+result.rawCaptureSha256.slice(0,16)+'.json';
 try{
  assert.throws(()=>verifyLedger(result.approved,{captureDirectory:dir}),/RAW_CAPTURE_ARCHIVE_MISSING_OR_TAMPERED/);
  fs.writeFileSync(path.join(dir,filename),raw,'utf8');
  assert.equal(verifyLedger(result.approved,{captureDirectory:dir}).comparisonGroups,1);
  fs.writeFileSync(path.join(dir,filename),raw+'tampered','utf8');
  assert.throws(()=>verifyLedger(result.approved,{captureDirectory:dir}),/RAW_CAPTURE_ARCHIVE_MISSING_OR_TAMPERED/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('first-party Search Console rows are hash-checked but never counted as competitor comparison groups',()=>{
 const base={property:'sc-domain:lingxifield.com',page:'https://ai.lingxifield.com/en/platform/chatgpt',
  query:'best AI assistant',date:'2026-10-28',impressions:20,clicks:2,position:5.4};
 const hash=sha(JSON.stringify(base));
 const row={id:'gsc-'+hash.slice(0,24),source:'google_search_console',sourceProperty:base.property,
  sourcePage:base.page,sourceDate:base.date,query:base.query,impressions:base.impressions,
  clicks:base.clicks,position:base.position,recordHash:'sha256:'+hash};
 const report=verifyLedger([row]);
 assert.equal(report.gsc,1);
 assert.equal(report.comparisonGroups,0);
 assert.throws(()=>verifyLedger([{...row,position:1}]),/GSC_RECORD_HASH_MISMATCH/);
});

test('capture ingestion rejects private query data, unexpected fields and oversized raw files',()=>{
 const capture=serpCapture({privateNote:'must not be archived'});
 const raw=JSON.stringify(capture);
 assert.throws(()=>reviewCapture(raw,{}, {knownIds}),/CAPTURE_UNEXPECTED_FIELD/);
 const privateQuery=serpCapture({query:'search for person@example.com'});
 const privateRaw=JSON.stringify(privateQuery);
 assert.throws(()=>reviewCapture(privateRaw,{}, {knownIds}),/CAPTURE_QUERY_PRIVACY_RISK/);
 assert.throws(()=>reviewCapture(' '.repeat(256001),{}, {knownIds}),/CAPTURE_SIZE_INVALID/);
 const rowExtra=serpCapture({results:serpCapture().results.map((x,i)=>i===0?{...x,rawHtml:'not allowed'}:x)});
 assert.throws(()=>reviewCapture(JSON.stringify(rowExtra),{}, {knownIds}),/CAPTURE_RESULT_UNEXPECTED_FIELD/);
});
