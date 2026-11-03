import test from 'node:test';import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {safePublicPublisherUrl,classifyPublisherResponse,probeOfficialEndpoint} from '../lib/market-official-use-probe.mjs';
test('publisher inventory is complete for 32 products and flags HTTP-only scope',()=>{
 const obj=JSON.parse(execFileSync(process.execPath,['scripts/probe-official-use.mjs'],{encoding:'utf8',timeout:2000}));
 assert.equal(obj.total,32);
 assert.equal(obj.mode,'static_inventory');
 assert.equal(obj.states.not_probed,32);
 assert.ok(obj.results.every(x=>x.host&&!x.host.includes('localhost')&&x.result==='not_probed'));
 assert.equal(new Set(obj.results.map(x=>x.id)).size,32);
});
test('external link probe rejects private targets, loopback and HTTP without making a request',async()=>{
 for(const url of ['http://github.com/openai','https://localhost/','https://127.0.0.1/a',
 'https://10.1.1.2/path','https://admin:pass@vendor.com','https://vendor.local/a',
 'https://vendor.example/a','javascript:alert(1)','https://example.com:8443/a'])
 assert.equal(safePublicPublisherUrl(url),null,url);
 let invoked=0;
 const r=await probeOfficialEndpoint({id:'x',url:'http://localhost/',kind:'official'},()=>{invoked++;throw Error('should not run')});
 assert.equal(r.result,'invalid_url');assert.equal(invoked,0);
});
test('redirects are classified without following; 403 and 429 are not 404',async()=>{
 let hit=0;
 const fetcher=async (url,options)=>{hit++;assert.equal(options.method,'HEAD');assert.equal(options.redirect,'manual');
  return {status:302,headers:{get:()=>'/login'}}};
 const r=await probeOfficialEndpoint({id:'v',url:'https://vendor.com/',kind:'official'},fetcher);
 assert.equal(hit,1);assert.equal(r.result,'redirect_needs_review');assert.equal(r.redirectHost,'vendor.com');
 assert.equal(classifyPublisherResponse(403,null,'https://vendor.com').result,'access_control_or_bot_challenge');
 assert.equal(classifyPublisherResponse(429,null,'https://vendor.com').result,'rate_limited');
 assert.equal(classifyPublisherResponse(405,null,'https://vendor.com').result,'head_not_supported');
 assert.equal(classifyPublisherResponse(404,null,'https://vendor.com').result,'http_not_found');
});
