import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const snapshot={kind:'topup',env:0,orderId:'o',productId:'sasi-balance-10',skuId:'lx_balance_10',unitPriceFen:1000,quantity:1,openid:'owner'};
let state='pending',updates=0,credits=0;
let remote={order_id:'trade',status:6,order_type:0,env_type:1,paid_fee:0,order_fee:1000};
const admin={from(table){let update=false;return{select(){return this},eq(){return this},update(){update=true;updates++;return this},
  async maybeSingle(){return{data:table==='orders'?{id:'o',user_id:'u',product_id:snapshot.productId,amount_rmb:10,provider_payment_id:'trade',status:state}:{payload:snapshot}}},
  then(resolve){resolve({data:update?[{id:'o'}]:[]})}}}};
const exports={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/mini/virtual-fulfillment.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require(name){return{
  '@/lib/supabase/admin':{createAdminClient:()=>admin},
  '@/lib/fulfill-order':{fulfillPaidOrder:async()=>{credits++;return{ok:true}}},
  '@/lib/mini/xpay':{queryVirtualOrder:async()=>remote,notifyVirtualGoodsProvided:async()=>{}},
  '@/lib/mini/virtual-goods':{virtualTopupGoods:()=>({...snapshot,amountFen:1000})},
}[name]}});
let result=await exports.reconcileVirtualToolOrder('o','u');assert.equal(result.closed,true);assert.equal(updates,1);assert.equal(credits,0);
for(const mutation of [{status:1},{status:0},{paid_fee:1000},{order_id:'other'},{order_fee:999},{env_type:2},{order_type:1}]){
  updates=0;remote={order_id:'trade',status:6,order_type:0,env_type:1,paid_fee:0,order_fee:1000,...mutation};
  result=await exports.reconcileVirtualToolOrder('o','u');assert.equal(result.closed,undefined);assert.equal(updates,0);assert.equal(credits,0);
}
await assert.rejects(exports.reconcileVirtualToolOrder('o','another-owner'));
console.log('PASS: only matching provider-closed unpaid orders are cleared; unknown, paid, mismatched and foreign orders stay protected');
