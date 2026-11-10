import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createBusinessBridge} from '../workers/com-business-origin/index.mjs';
test('forwards session only to fixed owned origin and preserves backend authorization',async()=>{
 const bridge=createBusinessBridge(async(url,init)=>{
  assert.equal(url,'https://lingxifield.cn/api/money/summary?x=1');
  assert.equal(init.redirect,'manual');assert.equal(init.headers.get('cookie'),'sb-example-auth-token.0=part');
  assert.equal(init.headers.get('authorization'),'Bearer invalid');
  assert.equal(init.headers.get('origin'),'https://evil.example');
  assert.equal(init.headers.get('x-forwarded-host'),'lingxifield.com');
  return Response.json({error:'UNAUTHORIZED'},{status:401});
 });
 const r=await bridge.fetch(new Request('https://lingxifield.com/api/money/summary?x=1',{headers:{cookie:'merchant=private; sb-example-auth-token.0=part',authorization:'Bearer invalid',origin:'https://evil.example'}}));
 assert.equal(r.status,401);assert.match(r.headers.get('cache-control'),/no-store/);
});
test('preserves raw webhook bytes and signature headers, never follows redirects',async()=>{
 const raw='{"id":"example", "spacing":true}\n';
 const bridge=createBusinessBridge(async(url,init)=>{
  assert.equal(init.headers.get('paypal-transmission-sig'),'signature');
  assert.equal(await new Response(init.body).text(),raw);
  return new Response(null,{status:302,headers:{location:'https://merchant.example/approve'}});
 });
 const r=await bridge.fetch(new Request('https://lingxifield.com/api/pay/paypal/webhook',{method:'POST',body:raw,headers:{'paypal-transmission-sig':'signature'}}));
 assert.equal(r.status,302);assert.equal(r.headers.get('location'),'https://merchant.example/approve');
});
test('login redirects return to com and only session cookies are propagated',async()=>{
 const bridge=createBusinessBridge(async()=>new Response(null,{status:303,headers:{location:'https://lingxifield.cn/account?mode=verify','set-cookie':'sb-example-auth-token=token; Domain=lingxifield.cn; HttpOnly; Secure'}}));
 const r=await bridge.fetch(new Request('https://lingxifield.com/account/auth',{method:'POST',body:'mode=signin'}));
 assert.equal(r.headers.get('location'),'https://lingxifield.com/account?mode=verify');
 assert.doesNotMatch(r.headers.get('set-cookie'),/Domain=/i);assert.match(r.headers.get('set-cookie'),/HttpOnly/);
});
test('rejects wrong hosts and pages without contacting any origin; fails closed on outage',async()=>{
 let calls=0;const bridge=createBusinessBridge(async()=>{calls++;throw Error('offline');});
 assert.equal((await bridge.fetch(new Request('https://evil.example/api/pay/create'))).status,403);
 assert.equal((await bridge.fetch(new Request('https://lingxifield.com/account'))).status,404);assert.equal(calls,0);
 assert.equal((await bridge.fetch(new Request('https://lingxifield.com/api/money/summary'))).status,503);
});
