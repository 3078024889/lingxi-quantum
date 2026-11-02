import test from 'node:test';
import assert from 'node:assert/strict';
import {allowedOfficialUrl,publicIp,robotsPermits,extractOfficialText,snapshotOfficialPage} from '../lib/market-safe-source-harvest.mjs';
const host=['fireworks.ai'];
test('pinned HTTPS sources reject private origins, open redirects and forged vendor domains',()=>{
 assert.ok(allowedOfficialUrl('https://fireworks.ai/pricing',host));
 for(const url of ['http://fireworks.ai/pricing','https://fireworks.ai.evil.invalid/pricing',
  'https://127.0.0.1/admin','https://user:secret@fireworks.ai/pricing','https://fireworks.ai:8080/'])
  assert.equal(allowedOfficialUrl(url,host),null,url);
});
test('DNS public IP gating and robots path controls are deterministic',()=>{
 for(const ip of ['127.0.0.1','10.0.4.1','172.19.1.1','192.168.0.2','169.254.7.3','::1'])
  assert.equal(publicIp(ip),false,ip);
 assert.equal(publicIp('8.8.8.8'),true);
 assert.equal(robotsPermits('User-agent: *\nDisallow: /admin\nAllow: /admin/public','/admin/private'),false);
 assert.equal(robotsPermits('User-agent: *\nDisallow: /admin\nAllow: /admin/public','/admin/public/info'),true);
 assert.equal(robotsPermits('User-agent: *\nDisallow:','/pricing'),true);
});
test('HTML extraction yields non-executable evidence excerpts',()=>{
 const p=extractOfficialText('<title>Vendor Pricing</title><script>poison()</script><main><p>Price USD 20 per month</p></main>',['price']);
 assert.equal(p.title,'Vendor Pricing');
 assert.equal(p.bodyPreview.includes('poison()'),false);
 assert.equal(p.hits.length,1);
});
test('robots-first source snapshot never automatically approves facts',async()=>{
 const routes=[],html='<html><title>Official</title><p>Pricing USD 20 per month</p></html>';
 const mock=async url=>{routes.push(url);return String(url).endsWith('robots.txt')?
 new Response('User-agent: *\nAllow: /',{status:200,headers:{'content-type':'text/plain'}}):
 new Response(html,{status:200,headers:{'content-type':'text/html'}})};
 const result=await snapshotOfficialPage({url:'https://fireworks.ai/pricing',officialHosts:host,
  fetchFn:mock,dnsLookup:async()=>[{address:'8.8.8.8',family:4}],terms:['pricing']});
 assert.equal(result.status,'snapshot_only');
 assert.equal(result.sourceVerified,false);
 assert.equal(result.readyToPublish,false);
 assert.equal(result.sha256.length,64);
 assert.equal(routes.length,2);
});
test('robots denial and private DNS fail without visiting source page',async()=>{
 let calls=0;
 const mock=async()=>{calls++;return new Response('User-agent: *\nDisallow: /',{status:200,headers:{'content-type':'text/plain'}})};
 await assert.rejects(()=>snapshotOfficialPage({url:'https://fireworks.ai/pricing',officialHosts:host,
  dnsLookup:async()=>[{address:'8.8.8.8',family:4}],fetchFn:mock}),/ROBOTS_DISALLOWS/);
 assert.equal(calls,1);
 await assert.rejects(()=>snapshotOfficialPage({url:'https://fireworks.ai/pricing',officialHosts:host,
  dnsLookup:async()=>[{address:'127.0.0.1',family:4}],fetchFn:mock}),/SOURCE_PRIVATE_IP_BLOCKED/);
 assert.equal(calls,1);
});
