import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function load(path,deps){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,console:{error(){}},Date,Set,URL,require:n=>{if(!(n in deps))throw Error(n);return deps[n];}});return exports;}
const id='11111111-1111-4111-8111-111111111111';
const snapshot={orderId:id,kind:'topup',productId:'sasi-balance-custom-1.5',skuId:'lx_balance_cent',unitPriceFen:1,quantity:150,env:0,openid:'wx-owner'};
let credits=0,acknowledgements=0,state='pending',owner='owner',outbox=false;
const admin={from(table){let write=false;return{select(){return this},eq(){return this},
  upsert(value){outbox=value.handled===false;return Promise.resolve({error:null})},
  update(){write=true;return this},then(resolve){resolve({error:null,data:[]})},
  async maybeSingle(){return{data:table==='orders'?{id,user_id:owner,status:state,product_id:snapshot.productId,amount_rmb:1.5,provider_payment_id:'trade'}:table==='sasi_credit_ledger'?{reference_id:id}:{payload:snapshot}}}
}}};
let remote={order_id:'trade',status:2,order_type:7,env_type:1,order_fee:150,paid_fee:150,left_fee:150};
const deps={
 'next/server':{after:fn=>{pendingAfter.push(fn)}},
 '@/lib/supabase/admin':{createAdminClient:()=>admin},
 '@/lib/fulfill-order':{fulfillPaidOrder:async()=>{if(state!=='paid')credits++;state='paid';return{ok:true}}},
 '@/lib/mini/xpay':{queryVirtualOrder:async()=>remote,notifyVirtualGoodsProvided:async()=>{acknowledgements++;throw Error('provider acknowledgement offline')}},
 '@/lib/mini/virtual-goods':{virtualTopupGoods:()=>({...snapshot,amountFen:150}),miniSandboxUserAllowed:()=>false},
};
const pendingAfter=[];
const fulfillment=load('lib/mini/virtual-fulfillment.ts',deps);
assert.equal((await fulfillment.reconcileVirtualToolOrder(id,'owner')).paid,true,'Delivery failure cannot reverse committed iOS credit');
assert.equal(credits,1);
assert.equal(acknowledgements,0,'Delivery request cannot delay the paid response');
await pendingAfter.shift()();assert.equal(acknowledgements,1);assert.equal(outbox,true,'Delivery retry is persisted before acknowledgement');
assert.equal((await fulfillment.reconcileVirtualToolOrder(id,'owner')).paid,true);assert.equal(credits,1,'Repeated confirmation credits once');
await assert.rejects(()=>fulfillment.reconcileVirtualToolOrder(id,'foreign'),/NOT_FOUND/);
remote={...remote,status:1,paid_fee:0};state='pending';
assert.equal((await fulfillment.reconcileVirtualToolOrder(id,'owner')).providerConfirmedUnpaid,true);
remote={...remote,paid_fee:150};assert.equal((await fulfillment.reconcileVirtualToolOrder(id,'owner')).providerConfirmedUnpaid,false,'Ambiguous payment must not expire');
state='paid';let providerChecks=0;
const status=load('app/api/wechat/mini/tool-pay/status/route.ts',{
 'next/server':{NextResponse:{json:(body,options)=>({body,status:options?.status||200})}},
 '@/lib/supabase/admin':deps['@/lib/supabase/admin'],
 '@/lib/mini/session':{requireMiniSession:async()=>({userId:'owner'})},
 '@/lib/rate-limit':{checkRateLimit:async()=>true},
 '@/lib/mini/virtual-fulfillment':{reconcileVirtualToolOrder:async()=>{providerChecks++;throw Error('offline')}}
});
const response=await status.GET({url:'https://example.test/?orderId='+id});
assert.equal(response.body.paid,true);assert.equal(providerChecks,0,'Already credited customer does not depend on platform availability');
console.log('PASS: actual iOS order type, decimal amount, committed credit vs failed delivery, durable retry, ownership, no duplicate credit, uncertain expiry and offline confirmation');
