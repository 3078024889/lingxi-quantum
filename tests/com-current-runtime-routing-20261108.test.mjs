import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';

test('generated edge wrapper serves public merchant status without exposing authenticated balance',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'lingxi-routing-'));
 try{
  const script=resolve('scripts/cloudflare/patch-critical-static-html-20261108.mjs');
  const source=await readFile(script,'utf8');
  const assets=join(dir,'.open-next/assets/__lingxi_edge_static__');
  await mkdir(assets,{recursive:true});
  for(const match of source.matchAll(/:\s*"([a-z0-9-]+\.html)"/g))
   await writeFile(join(assets,match[1]),'<html><head></head><body>LINGXIFIELD SIAI'+'x'.repeat(5000)+'</body></html>');
  await writeFile(join(assets,'software-catalog.json'),JSON.stringify({products:{'sasi-copernicus-si95-source':{available:false}},payment:{paypal:false}}));
  const wrapper=join(dir,'.open-next/offload-worker.mjs');
  await writeFile(wrapper,'export default {async fetch(request,env,ctx){ const offloaded=null; const app=env.current;\n  return offloaded||app.fetch(request,env,ctx);\n}}');
  execFileSync(process.execPath,[script],{cwd:dir,stdio:'pipe'});
  const {default:worker}=await import(pathToFileURL(wrapper).href);
  let currentCalls=0,legacyCalls=0;
  const env={current:{fetch:async request=>{currentCalls++;assert.equal(request.headers.get('cookie'),'sb-example-auth-token=test');return new Response('current',{status:401});}},LINGXI_COM_LEGACY_GATEWAY:{fetch:async()=>{legacyCalls++;return new Response('legacy');}}};
  // Provider status is public, account-neutral and never redirects to the legacy backend.
  const providers=await worker.fetch(new Request('https://lingxifield.com/api/pay/providers',{headers:{cookie:'sb-example-auth-token=test'}}),env,{});
  assert.equal(providers.status,200);
  assert.equal(providers.headers.get('cache-control'),'no-store, max-age=0');
  assert.equal(providers.headers.get('x-lingxi-render-mode'),'edge-merchant-readiness');
  const readiness=await providers.json();
  assert.deepEqual([readiness.wechat,readiness.alipay,readiness.paypal],[false,false,false]);
  assert.deepEqual(Object.keys(readiness).sort(),['alipay','diagnostics','paypal','wechat']);
  // Privileged balance queries must still be served by the real authenticated runtime.
  const money=await worker.fetch(new Request('https://lingxifield.com/api/money/summary',{headers:{cookie:'sb-example-auth-token=test'}}),env,{});
  assert.equal(money.status,401);
  assert.equal(await money.text(),'current');
  assert.equal(currentCalls,1);assert.equal(legacyCalls,0);
  const health=await worker.fetch(new Request('https://lingxifield.com/api/health',{headers:{cookie:'sb-example-auth-token=test'}}),env,{});
  assert.equal(health.status,200);
  assert.equal(health.headers.get('x-lingxi-health-scope'),'edge-liveness');
  assert.deepEqual(await health.json(),{ok:true,service:'lingxifield',scope:'edge-liveness'});
  assert.equal(currentCalls,1);assert.equal(legacyCalls,0);
  const payment=await worker.fetch(new Request('https://lingxifield.com/api/pay/paypal/create',{method:'POST'}),env,{});
  assert.equal(await payment.text(),'legacy');assert.equal(legacyCalls,1);
  let assetCalls=0;
  env.ASSETS={fetch:async()=>{assetCalls++;return new Response('anonymous-login-shell');}};
  const login=await worker.fetch(new Request('https://lingxifield.com/account'),env,{});
  assert.equal(await login.text(),'anonymous-login-shell');assert.equal(assetCalls,1);
  const signed=await worker.fetch(new Request('https://lingxifield.com/account',{headers:{cookie:'sb-example-auth-token=test'}}),env,{});
  assert.equal(await signed.text(),'anonymous-login-shell');assert.equal(assetCalls,2);
  env.current={fetch:async request=>{assert.equal(new URL(request.url).search,'?mode=verify&email=test%40example.com');return new Response('verification-form');}};
  const verify=await worker.fetch(new Request('https://lingxifield.com/account?mode=verify&email=test%40example.com'),env,{});
  assert.equal(await verify.text(),'anonymous-login-shell');assert.equal(assetCalls,3);
 }finally{await rm(dir,{recursive:true,force:true});}
});
