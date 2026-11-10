import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyPaypalWebhook} from '../lib/paypal.ts';

test('unsigned and malformed notifications never call merchant OAuth or verification endpoints',async()=>{
 const oldFetch=globalThis.fetch,oldId=process.env.PAYPAL_WEBHOOK_ID;
 process.env.PAYPAL_WEBHOOK_ID='non-secret-test-webhook-id';
 let calls=0;
 globalThis.fetch=async()=>{calls++;throw Error('NETWORK_MUST_NOT_BE_CALLED')};
 try{
  assert.equal(await verifyPaypalWebhook(new Headers(),'{}'),false);
  const headers=new Headers(Object.fromEntries(['paypal-transmission-id','paypal-transmission-time','paypal-cert-url','paypal-auth-algo','paypal-transmission-sig'].map(k=>[k,'test'])));
  for(const body of ['not-json','null','[]','42'])assert.equal(await verifyPaypalWebhook(headers,body),false);
  for(const name of [...headers.keys()]){
   const partial=new Headers(headers);partial.delete(name);
   assert.equal(await verifyPaypalWebhook(partial,'{}'),false);
  }
  assert.equal(calls,0);
 }finally{
  globalThis.fetch=oldFetch;
  if(oldId===undefined)delete process.env.PAYPAL_WEBHOOK_ID;else process.env.PAYPAL_WEBHOOK_ID=oldId;
 }
});
