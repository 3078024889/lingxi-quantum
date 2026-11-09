import test from 'node:test';
import assert from 'node:assert/strict';
import {publicMarketListings} from '../scripts/cloudflare/public-market-listings.mjs';
const env={NEXT_PUBLIC_SUPABASE_URL:'https://sxsgdpqojepgbbrxrzlq.supabase.co',NEXT_PUBLIC_SUPABASE_ANON_KEY:'public-test-key',SUPABASE_SERVICE_ROLE_KEY:'must-not-use'};
const request=p=>new Request('https://lingxifield.com'+p);
test('public query selects only clean published listings with public credentials',async()=>{
 const result=await publicMarketListings(request('/api/sasi/marketplace/listings'),env,async(url,opts)=>{
  const q=new URL(url).searchParams;
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
test('upstream failures do not become successful empty catalogs or expose errors',async()=>{
 let calls=0;
 const failed=await publicMarketListings(request('/api/sasi/marketplace/listings'),env,async()=>{calls++;return new Response('private error',{status:503})});
 assert.equal(calls,3);assert.equal(failed.status,503);assert.doesNotMatch(await failed.text(),/private error/);
 const draft=await publicMarketListings(request('/api/sasi/marketplace/listings'),env,async()=>Response.json([{status:'draft',scan_status:'clean'}]));
 assert.equal(draft.status,503);
});

test('only a network or transient 5xx failure may use the real CN public catalog',async()=>{
 let upstreamCalls=0;
 const networkRecovery=await publicMarketListings(request('/api/sasi/marketplace/listings'),env,async(url)=>{
  if(url.includes("lingxifield.cn")){
   return Response.json({items:[{id:"approved-1",seller_id:"seller",title:"Real approved program",description:"a".repeat(900),category:"software",price_cny_minor:690000,price_usd_minor:690000,status:"published",scan_status:"clean",published_at:null,created_at:"2026-11-09",quarantine_path:"never expose"}]});
  }
  upstreamCalls++;throw new TypeError("regional network error");
 });
 assert.equal(upstreamCalls,2);
 assert.equal(networkRecovery.status,200);
 assert.equal(networkRecovery.headers.get("x-lingxi-catalog-diagnostic"),"cn-verified-public-fallback");
 const rows=(await networkRecovery.json()).items;
 assert.equal(rows.length,1);
 assert.equal(rows[0].description.length,800);
 assert.equal(Object.hasOwn(rows[0],"quarantine_path"),false);
 const denied=await publicMarketListings(request('/api/sasi/marketplace/listings'),env,async(url)=>{
  if(url.includes("lingxifield.cn"))throw Error("Must not call fallback after a 403");
  return new Response("",{status:403});
 });
 assert.equal(denied.status,503);
 assert.equal(denied.headers.get("x-lingxi-catalog-diagnostic"),"upstream-403");
});
test('domestic fallback never publishes draft, unscanned or malformed items',async()=>{
 const reply=await publicMarketListings(request('/api/sasi/marketplace/listings'),env,async(url)=>{
  if(url.includes("lingxifield.cn"))return Response.json({items:[{id:"draft-1",title:"draft",description:"private",category:"software",price_cny_minor:1,price_usd_minor:1,status:"draft",scan_status:"clean"}]});
  throw new TypeError("test network failure");
 });
 assert.equal(reply.status,503);
 assert.equal((await reply.json()).error,"MARKET_LISTINGS_UNAVAILABLE");
});
