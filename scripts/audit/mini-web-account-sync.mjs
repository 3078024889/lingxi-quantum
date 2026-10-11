import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(path, mocks, extras = {}) {
  const module = {exports:{}};
  const code=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  vm.runInNewContext(code,{module,exports:module.exports,require:name=>{if(!(name in mocks))throw Error(name);return mocks[name]},console,Date,AbortSignal,...extras});
  return module.exports;
}
let websiteUser={id:'website-10505',email:'10505@example.test'},rpcCalls=[];
const proof={sourceUserId:'old-9454',openid:'same-wechat',expiresAt:Date.now()+60000,nonce:'nonce',sessionTokenHash:'a'.repeat(64)};
const handler=load('app/api/wechat/mini/account-link/confirm/route.ts',{
 'next/server':{NextResponse:{json:(data,options={})=>({data,status:options.status||200})}},
 '@/lib/mini/crypto':{decryptMiniSecret:()=>JSON.stringify(proof)},
 '@/lib/supabase/server':{createClient:()=>({auth:{getUser:async()=>({data:{user:websiteUser}})}})},
 '@/lib/supabase/admin':{createAdminClient:()=>({rpc:async(name,args)=>{rpcCalls.push({name,args});return{data:{ok:true},error:null}}})},
});
const req={json:async()=>({ticket:'encrypted-proof'})};
assert.equal((await handler.POST(req)).status,200);
assert.equal(rpcCalls[0].args.p_target_user_id,'website-10505','Destination is the authenticated website account, never the native default');
assert.equal(rpcCalls[0].args.p_source_user_id,'old-9454');
assert.equal(rpcCalls[0].args.p_token_hash,'a'.repeat(64),'Only the proven current phone session is connected');
websiteUser=null;
assert.equal((await handler.POST(req)).status,401);assert.equal(rpcCalls.length,1,'No web login means no account connection');
websiteUser={id:'website-10505'};proof.expiresAt=Date.now()-1;
assert.equal((await handler.POST(req)).status,400);assert.equal(rpcCalls.length,1,'Expired handoffs cannot connect');

let effect,fetches=0;const states=[];
const component=load('app/account/MiniAccountLinkPanel.tsx',{
 react:{useCallback:fn=>fn,useEffect:fn=>{effect=fn},useRef:value=>({current:value}),useState:value=>[value,next=>states.push(next)]},
 'react/jsx-runtime':{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})},
 '@/lib/useLang':{useLang:()=>false},
 '@/lib/mini/payment-client':{openMiniRecharge:async()=>true},
},{fetch:async()=>{fetches++;return{ok:true,json:async()=>({ok:true,account:'10505@example.test'})}}});
component.default({ticket:'encrypted-proof',accountLabel:'10505@example.test'});
effect();effect();
await new Promise(resolve=>setTimeout(resolve,0));
assert.equal(fetches,1,'Website login automatically connects once, including repeated React effects');
assert.ok(states.includes('done'));assert.ok(states.some(value=>typeof value==='string'&&value.includes('10505@example.test')));
for(const path of ['balance-pay/create','tool-pay/create','tool-pay/balance']) {
  let touchedMoney=false;
  const guarded=load(`app/api/wechat/mini/${path}/route.ts`,{
    'next/server':{NextResponse:{json:(data,options={})=>({data,status:options.status||200})}},
    crypto:{randomUUID:()=>{throw Error('Must not create an order')}},
    '@/lib/supabase/admin':{createAdminClient:()=>{touchedMoney=true;throw Error('Must not touch a wallet')}},
    '@/lib/mini/session':{requireMiniSession:async()=>({userId:'old-9454',accountConnected:false})},
    '@/lib/mini/payment-availability':{MINI_PAYMENT_PAUSED:{}},
    '@/lib/mini/virtual-goods':{miniVirtualTopupsEnabled:()=>true,miniVirtualToolsEnabled:()=>true},
    '@/lib/mini/virtual-pay':{},'@/lib/mini/crypto':{},'@/lib/mini/wechat':{},
    '@/lib/tools/service-readiness':{},
    '@/lib/rate-limit':{checkRateLimit:async()=>true,getClientIp:()=>''},
    '@/lib/mini/account':{},
  },{process:{env:{WECHAT_MINI_VPAY_ENV:'production'}}});
  assert.equal((await guarded.POST({headers:{get:()=>null}})).status,409,`${path} rejects a stale mapped identity`);
  assert.equal(touchedMoney,false,'Account confirmation precedes all order and wallet operations');
}
console.log('PASS: authenticated website destination, exact phone handoff, unauthenticated/expired rejection, automatic one-time sync');
