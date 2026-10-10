import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
let page, calls=0, release;
const wx={showToast(){},navigateTo({url}){assert.equal(url,'/pages/balance/index')}};
vm.runInNewContext(fs.readFileSync('miniapp/pages/pay/index.js','utf8'),{Page:p=>page=p,wx,require:()=>({request:async(path,options)=>{
 assert.equal(path,'/api/wechat/mini/tool-pay/balance');assert.equal(options.data.quoteId,'q');calls++;
 await new Promise(resolve=>release=resolve);return{ok:true,paid:true};
}})});
const instance={...page,data:{...page.data,quoteId:'q',quote:{}},setData(v){Object.assign(this.data,v)}};
const pending=instance.payBalance();await instance.payBalance();assert.equal(calls,1);release();await pending;
assert.equal(instance.data.paid,true);await instance.payBalance();assert.equal(calls,1);
instance.data.paid=false;instance.data.orderId='pending-virtual';await instance.payBalance();assert.equal(calls,1,'Do not switch payment method for an uncertain external payment');
instance.recharge();
let enabled=false,session=null,currency='CNY',ready=true,rpcCount=0,lastArgs;
const admin={from(){return{select(){return this},eq(){return this},async maybeSingle(){return{data:{id:'q',tool_id:'food-calorie',currency}}}}},async rpc(name,args){rpcCount++;lastArgs=args;assert.equal(name,'pay_tool_quote_with_sasi_balance');return{data:{ok:true,paid:true}}}};
const deps={
 'next/server':{NextResponse:{json:(body,init={})=>({body,status:init.status||200})}},
 '@/lib/supabase/admin':{createAdminClient:()=>admin},
 '@/lib/mini/session':{requireMiniSession:async()=>session},
 '@/lib/mini/virtual-goods':{miniVirtualToolsEnabled:()=>enabled},
 '@/lib/mini/payment-availability':{MINI_PAYMENT_PAUSED:{code:'PAUSED'}},
 '@/lib/tools/service-readiness':{toolRuntimeStateLive:async()=>({ready})},
 '@/lib/rate-limit':{checkRateLimit:async()=>true,getClientIp:()=>''},
};
const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/wechat/mini/tool-pay/balance/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,process:{env:{}},require:n=>deps[n]});
const req={headers:{get:()=>null},json:async()=>({quoteId:'11111111-1111-4111-8111-111111111111',userId:'attacker'})};
assert.equal((await exports.POST(req)).status,503);enabled=true;
assert.equal((await exports.POST(req)).status,401);session={userId:'owner'};
currency='USD';assert.equal((await exports.POST(req)).status,409);currency='CNY';ready=false;
assert.equal((await exports.POST(req)).status,503);assert.equal(rpcCount,0);ready=true;
assert.equal((await exports.POST(req)).status,200);assert.equal(lastArgs.p_user_id,'owner');assert.equal(lastArgs.p_quote_id,'q');
console.log('PASS: native balance double-click/uncertain-payment guards, closed gate, owner identity, CNY-only and runtime checks');
