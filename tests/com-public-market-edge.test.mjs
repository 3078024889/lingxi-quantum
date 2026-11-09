import test from 'node:test';
import assert from 'node:assert/strict';
import {publicMarketListings} from '../scripts/cloudflare/public-market-listings.mjs';
const env={NEXT_PUBLIC_SUPABASE_URL:'https://sxsgdpqojepgbbrxrzlq.supabase.co',NEXT_PUBLIC_SUPABASE_ANON_KEY:'public-test-key',SUPABASE_SERVICE_ROLE_KEY:'must-not-use'};
const request=p=>new Request('https://lingxifield.com'+p);
test('public query selects only clean published listings with public credentials',async()=>{
 const result=await publicMarketListings(request('/api/sasi/marketplace/listings'),env,async(url,opts)=>{
  const u=new URL(url);assert.equal(u.pathname,"/rest/v1/sasi_market_public_cards");const q=u.searchParams;
  assert.equal(q.get('status'),'eq.published');assert.equal(q.get('scan_status'),'eq.clean');
  assert.equal(q.get('limit'),'36');assert.equal(opts.headers.apikey,'public-test-key');
  assert.equal(opts.headers.cookie,undefined);
  return Response.json([{status:'published',scan_status:'clean',description:'x'.repeat(1000)}]);
 });
 assert.equal(result.status,200);assert.equal((await result.json()).items[0].description.length,800);
});
test('mine and mutations stay with authenticated application',async()=>{
 const fail=()=>{throw Error('must not fetch')};
 assert.equal(await publicMarketListings(request('/api/sasi/marketplace/listings?mode=mine'),env,fail),null);
 assert.equal(await publicMarketListings(new Request('https://lingxifield.com/api/sasi/marketplace/listings',{method:'POST'}),env,fail),null);
});
test('database preview view rejects oversized or unreviewed rows',async()=>{
 const over=await publicMarketListings(request('/api/sasi/marketplace/listings'),env,async()=>Response.json([{status:'published',scan_status:'clean',description:'x'.repeat(801)}]));
 assert.equal(over.status,503);
 const unscanned=await publicMarketListings(request('/api/sasi/marketplace/listings'),env,async()=>Response.json([{status:'published',scan_status:'unscanned',description:'ok'}]));
 assert.equal(unscanned.status,503);
});
test('upstream failures do not become successful empty catalogs or expose errors',async()=>{
 let calls=0;
 const failed=await publicMarketListings(request('/api/sasi/marketplace/listings'),env,async()=>{calls++;return new Response('private error',{status:503})});
 assert.equal(calls,2);assert.equal(failed.status,503);assert.doesNotMatch(await failed.text(),/private error/);
 const draft=await publicMarketListings(request('/api/sasi/marketplace/listings'),env,async()=>Response.json([{status:'draft',scan_status:'clean'}]));
 assert.equal(draft.status,503);
});
