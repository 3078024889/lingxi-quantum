import test from 'node:test';
import assert from 'node:assert/strict';
import {validateMarketReview} from './audit-review-gate.mjs';

const langs=['zh','en','ja','ko','fr','de','es','pt','ar'];
const product={id:'sample-tool',status:'verified',website:'https://example.org'};
const record={productId:'sample-tool',metric:'website_visits',value:42,sourceUrl:'https://example.org/report',observedAt:'2026-10-28',region:'global',period:'2026-10',unit:'visits',method:'third_party',status:'official_verified'};
const base=()=>({languages:[...langs],products:[{...product}],records:[{...record}],previewUrl:'https://example.vercel.app',reviewApproved:false});
test('valid input still requires approval before indexing',()=>{const r=validateMarketReview(base());assert.equal(r.ok,true);assert.equal(r.indexable,false);});
test('approved verified evidence may be indexed',()=>{const x=base();x.reviewApproved=true;assert.equal(validateMarketReview(x).indexable,true);});
test('unverified evidence is never indexable',()=>{const x=base();x.reviewApproved=true;x.records[0].status='candidate';assert.equal(validateMarketReview(x).indexable,false);});
test('missing languages prevent publication',()=>{const x=base();x.languages.pop();assert.equal(validateMarketReview(x).ok,false);});
test('unsafe preview URL rejected',()=>{const x=base();x.previewUrl='http://evil.example';assert.ok(validateMarketReview(x).errors.includes('unsafe_preview_url'));});
test('duplicates rejected',()=>{const x=base();x.products.push({...product});assert.equal(validateMarketReview(x).ok,false);});
test('source URL must use https',()=>{const x=base();x.records[0].sourceUrl='http://example.org';assert.equal(validateMarketReview(x).ok,false);});
test('non-finite metric is rejected',()=>{const x=base();x.records[0].value=Infinity;assert.equal(validateMarketReview(x).ok,false);});
test('no records cannot be indexed',()=>{const x=base();x.records=[];x.reviewApproved=true;assert.equal(validateMarketReview(x).indexable,false);});
