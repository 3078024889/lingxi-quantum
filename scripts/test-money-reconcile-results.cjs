const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
function compile(file,imports){const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','module','exports',code)(p=>imports[p]||require(p),m,m.exports);return m.exports}
const policy=compile('lib/money/refund-error-policy.ts',{}),retry=compile('lib/money/retry-policy.ts',{}),state=compile('lib/money/refund-state.ts',{});
const reconciliation=compile('lib/money/reconciliation.ts',{'./refund-state':state});
async function run(currency,observation,{rpcOk=true,saveFails=false,attempts=0,queryOnly=false,receipt=null,confirmed=true,lastChecked=null}={}){
 const calls=[],updates=[],requests=[];
 const w={id:'w',order_id:'o',provider:currency==='USD'?'paypal':'wechat',currency,provider_currency:currency,amount_minor:100,provider_amount_minor:100,status:'processing',provider_request_key:'original-stable-key',provider_attempt_count:attempts,provider_refund_id:receipt,submission_confirmed_at:confirmed?"confirmed":null,last_provider_checked_at:lastChecked};
 const admin={from(table){const q={select(){return q},eq(){return q},single:async()=>({data:table==='orders'?{id:'o',provider:w.provider,provider_payment_id:'original-payment',amount_rmb:10,amount_usd:15}:w}),update(x){updates.push(x);return q},then(resolve){return Promise.resolve({error:saveFails?{message:'storage unavailable'}:null}).then(resolve)}};return q},rpc:async(name,args)=>{if(name==='money_begin_provider_call')return{data:{ok:true},error:null};calls.push({name,args});return{data:{ok:rpcOk,error:rpcOk?null:'WITHDRAWAL_CLOSED'},error:null}}};
 const observe=async r=>{requests.push(r);if(observation instanceof Error)throw observation;return observation};let creates=0,queries=0;const adapter={createRefund:r=>{creates++;return observe(r)},queryRefund:r=>{queries++;return observe(r)}};
 const worker=compile('lib/money/reconcile-worker.ts',{'@/lib/supabase/admin':{createAdminClient:()=>admin},'./provider-adapters':{moneyProviderAdapters:()=>new Map([[w.provider,adapter]]),safeProviderError:e=>e.message},'./provider-adapter':{requireProviderAdapter:(id,map)=>map.get(id)},'./reconciliation':reconciliation,'./refund-error-policy':policy,'./retry-policy':retry,'./operator-notifications':{scheduleMoneyNotices(){},flushMoneyNotifications:async()=>({sent:0})}});
 let result,thrown;try{result=await worker.reconcileWithdrawal('w',{queryOnly})}catch(e){thrown=e}
 if(!requests.length)return{result,thrown,calls,updates,requests,creates,queries};
 assert.equal(requests[0].idempotencyKey,'original-stable-key');assert.equal(requests[0].providerAmountMinor,100);assert.equal(requests[0].orderTotalMinor,currency==='USD'?1500:1000);
 return{result,thrown,calls,updates,requests,creates,queries};
}
(async()=>{
 for(const currency of ['CNY','USD']){
  let auto=await run(currency,{status:'succeeded',providerRefundId:'receipt',providerStatus:'SUCCESS'},{queryOnly:true});assert.equal(auto.requests.length,0);
  auto=await run(currency,{status:'succeeded',providerRefundId:'receipt',providerStatus:'SUCCESS'},{queryOnly:true,receipt:'receipt',confirmed:false});assert.equal(auto.requests.length,0);
  auto=await run(currency,{status:'succeeded',providerRefundId:'receipt',providerStatus:'SUCCESS'},{queryOnly:true,receipt:'receipt',lastChecked:new Date().toISOString()});assert.equal(auto.requests.length,0);
  auto=await run(currency,{status:'succeeded',providerRefundId:'receipt',providerStatus:'SUCCESS'},{queryOnly:true,receipt:'receipt'});assert.equal(auto.result.status,'completed');assert.equal(auto.requests[0].providerRefundId,'receipt');assert.equal(auto.creates,0);assert.equal(auto.queries,1);
  auto=await run(currency,{status:'pending',providerStatus:'PENDING'},{queryOnly:true,receipt:'receipt',attempts:11});assert.equal(auto.result.operatorActionRequired,false);assert.equal(auto.updates[0].provider_attempt_count,11);

  let x=await run(currency,{status:'succeeded',providerRefundId:'receipt',providerStatus:'SUCCESS'});assert.equal(x.result.status,'completed');assert.equal(x.calls[0].name,'complete_balance_withdrawal');
  x=await run(currency,{status:'succeeded',providerRefundId:'receipt',providerStatus:'SUCCESS'},{rpcOk:false});assert.equal(x.result.ok,false);assert.equal(x.result.status,'pending');
  x=await run(currency,{status:'failed',errorCode:'CLOSED',providerStatus:'CLOSED'},{rpcOk:false});assert.equal(x.result.ok,false);assert.equal(x.result.status,'pending');
  x=await run(currency,{status:'succeeded',providerRefundId:null});assert.equal(x.result.ok,false);assert.equal(x.calls.length,0);
  x=await run(currency,{status:'succeeded',providerRefundId:'receipt'},{saveFails:true});assert(x.thrown);assert.equal(x.calls.length,0);
  x=await run(currency,{status:'pending',providerStatus:'PENDING'},{attempts:11});assert.equal(x.result.operatorActionRequired,true);assert.equal(x.result.failureCode,'OPERATOR_REVIEW_REQUIRED');assert.equal(x.calls.length,0);
  x=await run(currency,new Error('timeout'));assert.equal(x.result.status,'pending');assert.equal(x.calls.length,0);
 }
 let x=await run('CNY',new Error('WECHAT_REFUND_403:NOT_ENOUGH'));assert.equal(x.result.failureCode,'PROVIDER_FUNDS_REQUIRED');assert.equal(x.result.operatorActionRequired,true);assert.equal(x.calls.length,0);
 x=await run('CNY',{status:'pending',errorCode:'WECHAT_ABNORMAL',providerStatus:'ABNORMAL'});assert.equal(x.result.operatorActionRequired,true);assert.equal(x.calls.length,0);
 let raw;
 const adapters=compile('lib/money/provider-adapters.ts',{
  '@/lib/wechatpay':{createWechatRefund:async()=>raw,queryWechatRefund:async()=>raw},
  '@/lib/alipay':{},
  '@/lib/paypal':{verifyPaypalCompletedOrder:async()=>({captureId:'capture'}),createPaypalRefund:async()=>raw,queryPaypalRefund:async()=>raw},
  './refund-identifiers':{wechatRefundNoFromRequestKey:k=>k}
 });
 const request={providerCurrency:'CNY',providerAmountMinor:100,orderTotalMinor:1000,providerPaymentId:'original',idempotencyKey:'stable',orderId:'order'};
 const wx=new adapters.WechatRefundAdapter();
 raw={refundId:'wx',status:'SUCCESS',raw:{out_trade_no:'original',amount:{currency:'CNY',refund:100}}};assert.equal((await wx.createRefund(request)).status,'succeeded');
 raw.raw.amount.refund=101;await assert.rejects(()=>wx.createRefund(request),/AMOUNT_MISMATCH/);
 raw.raw.amount.refund=100;raw.raw.out_trade_no='another';await assert.rejects(()=>wx.queryRefund(request),/ORDER_MISMATCH/);
 const paypal=new adapters.PaypalRefundAdapter(),usd={...request,providerCurrency:'USD'};
 raw={refundId:'pp',status:'COMPLETED',raw:{amount:{currency_code:'USD',value:'1.00'}}};assert.equal((await paypal.createRefund(usd)).status,'succeeded');
 raw.raw.amount.currency_code='CNY';await assert.rejects(()=>paypal.createRefund(usd),/CURRENCY_MISMATCH/);
 raw.raw.amount.currency_code='USD';raw.raw.amount.value='1.01';await assert.rejects(()=>paypal.queryRefund({...usd,providerRefundId:'pp'}),/AMOUNT_MISMATCH/);
 console.log('PASS: CNY/USD verified receipts, rejected finalization, missing receipts, database failures, operator escalation, timeouts and insufficient merchant funds. No live payment calls.');
})().catch(e=>{console.error(e);process.exitCode=1});
