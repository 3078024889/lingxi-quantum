import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {reviewGscEvidence,mergeReviewedObservations} from '../scripts/review-gsc-observations.mjs';

const origin='https://ai.lingxifield.com';
const property='sc-domain:lingxifield.com';
const query='best AI video generator';
const date='2026-10-28';
function row(overrides={}){
 const base={property,page:origin+'/en/platform/chatgpt',query,date,impressions:20,clicks:2,position:5.4,...overrides.base};
 const digest=createHash('sha256').update(JSON.stringify(base)).digest('hex');
 return {
  id:'gsc-'+digest.slice(0,24),platformId:'chatgpt',source:'google_search_console',
  observedAt:base.date+'T12:00:00Z',country:'GLOBAL',language:'en',query:base.query,
  sourceProperty:base.property,sourcePage:base.page,sourceDate:base.date,
  sourceUrl:'https://search.google.com/search-console/performance/search-analytics',
  recordHash:'sha256:'+digest,methodVersion:'GSC.web.page-query-date.v1',
  sampleCount:base.impressions,position:base.position,impressions:base.impressions,clicks:base.clicks,
  sponsored:false,reviewed:false,...overrides.row
 };
}
function manifest(decisions){
 return {reviewer:'3078024889',reviewedAt:new Date(Date.now()-1000).toISOString(),decisions};
}
const reason='Checked source property, canonical product URL, aggregate metrics and query privacy.';

test('GSC publication requires an explicit decision for every pending row',()=>{
 const pending=[row()];
 const result=reviewGscEvidence(pending,manifest([{id:pending[0].id,approve:true,reason}]),{
  expectedOrigin:origin,expectedProperty:property,knownIds:new Set(['chatgpt'])
 });
 assert.equal(result.approved.length,1);
 assert.equal(result.approved[0].reviewed,true);
 assert.equal(result.approved[0].reviewedBy,'3078024889');
 assert.equal(result.approved[0].reviewReason,reason);
 assert.equal(result.rejected.length,0);
 assert.throws(()=>reviewGscEvidence(pending,manifest([]),{
  expectedOrigin:origin,expectedProperty:property,knownIds:new Set(['chatgpt'])
 }),/REVIEW_DECISIONS_INCOMPLETE/);
});

test('rejected rows never enter the public observation ledger',()=>{
 const pending=[row()];
 const result=reviewGscEvidence(pending,manifest([{id:pending[0].id,approve:false,reason:'Query mapping was not sufficiently specific to approve.'}]),{
  expectedOrigin:origin,expectedProperty:property,knownIds:new Set(['chatgpt'])
 });
 assert.equal(result.approved.length,0);
 assert.equal(result.rejected.length,1);
 assert.equal(mergeReviewedObservations([],result.approved).result.length,0);
});

test('tampered metrics, unsafe queries, and wrong product hosts are rejected',()=>{
 const original=row();
 const tampered={...original,clicks:19};
 assert.throws(()=>reviewGscEvidence([tampered],manifest([{id:tampered.id,approve:true,reason}]),{
  expectedOrigin:origin,expectedProperty:property,knownIds:new Set(['chatgpt'])
 }),/GSC_METRICS_INVALID|GSC_RECORD_HASH_MISMATCH/);
 const unsafe=row({base:{query:'customer email person@example.com'}});
 assert.throws(()=>reviewGscEvidence([unsafe],manifest([{id:unsafe.id,approve:true,reason}]),{
  expectedOrigin:origin,expectedProperty:property,knownIds:new Set(['chatgpt'])
 }),/GSC_QUERY_NOT_SAFE_OR_NORMALIZED/);
 const wrongHost=row({base:{page:'https://lingxifield.com/en/platform/chatgpt'}});
 assert.throws(()=>reviewGscEvidence([wrongHost],manifest([{id:wrongHost.id,approve:true,reason}]),{
  expectedOrigin:origin,expectedProperty:property,knownIds:new Set(['chatgpt'])
 }),/GSC_PRODUCT_PAGE_MISMATCH/);
});

test('merge is idempotent and rejects a conflicting hash for the same observation ID',()=>{
 const approved=reviewGscEvidence([row()],manifest([{id:row().id,approve:true,reason}]),{
  expectedOrigin:origin,expectedProperty:property,knownIds:new Set(['chatgpt'])
 }).approved;
 const once=mergeReviewedObservations([],approved);
 const twice=mergeReviewedObservations(once.result,approved);
 assert.equal(once.added,1);
 assert.equal(twice.added,0);
 assert.equal(twice.duplicate,1);
 assert.throws(()=>mergeReviewedObservations(once.result,[{...approved[0],recordHash:'sha256:'+'0'.repeat(64)}]),/OBSERVATION_ID_HASH_CONFLICT/);
});
