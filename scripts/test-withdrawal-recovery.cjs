const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
function compile(file,imports){const mod={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;new Function('require','module','exports','console',code)(name=>name==='server-only'?{}:imports[name]||require(name),mod,mod.exports,{error(){}});return mod.exports;}
async function scenario(provider,error,attemptState='completed'){
 const updates=[],calls=[],rpc=[];const withdrawal={id:'w',user_id:'u',order_id:'o',provider,provider_currency:provider==='paypal'?'USD':'CNY',provider_amount_minor:100,status:'processing',updated_at:'2020-01-01',provider_refund_id:null};
 const admin={from(table){let update;const q={select(){return q},eq(){return q},single:async()=>({data:table==='balance_withdrawals'?withdrawal:{id:'o',provider_payment_id:'LXoriginal',amount_rmb:10,amount_usd:10}}),update(value){update=value;return q},then(resolve){updates.push(update);return Promise.resolve({error:null}).then(resolve)}};return q},async rpc(name,args){rpc.push({name,args});return {data:{ok:true},error:null}}};
 const service=compile('lib/payments/withdrawal-processing.ts',{'@/lib/supabase/admin':{createAdminClient:()=>admin},'@/lib/payment-refunds':{refundProviderConfigured:()=>true,queryProviderRefund:async()=>{throw new Error(error)},executeProviderRefund:async input=>{calls.push(input);return {state:attemptState,refundId:'verified-provider-ref',providerStatus:attemptState==='completed'?'SUCCESS':'PROCESSING'}}}});
 const result=await service.refreshWithdrawal('w','u');
 const retry=provider==='wechat'&&error==='WECHAT_REFUND_404:RESOURCE_NOT_EXISTS';assert.equal(calls.length,retry?1:0);
 if(retry){assert.equal(calls[0].withdrawalId,'w');assert.equal(calls[0].refundAmountMinor,100);assert.equal(calls[0].orderAmountMinor,1000);assert.equal(calls[0].providerPaymentId,'LXoriginal');assert.equal(result.status,attemptState==='completed'?'completed':'processing');assert.equal(rpc.length,attemptState==='completed'?1:0);}else{assert.equal(result.status,'processing');assert.equal(rpc.length,0);assert.equal(updates[0].failure_code,'PROVIDER_CONFIRMATION_PENDING');}
}
(async()=>{
 await scenario('wechat','WECHAT_REFUND_404:RESOURCE_NOT_EXISTS');await scenario('wechat','WECHAT_REFUND_404:RESOURCE_NOT_EXISTS','pending');
 for(const error of ['timeout','WECHAT_REFUND_401:SIGN_ERROR','WECHAT_REFUND_500:SYSTEM_ERROR','WECHAT_REFUND_404:MCH_NOT_EXISTS'])await scenario('wechat',error);
 await scenario('paypal','PAYPAL_REFUND_QUERY_FAILED');
 const copy=compile('lib/notifications/money-copy.ts',{});
 const admin={from(table){const rows=table==='orders'?[{id:'test',product_id:'toolquote:test',currency:'USD',amount_usd:2,amount_rmb:4,created_at:'2026-10-01'}]:[];const q={select(){return q},eq(){return q},in(){return q},order(){return q},limit(){return Promise.resolve({data:rows,error:null})}};return q}};
 const feed=compile('lib/notifications/money-feed.ts',{'@/lib/supabase/admin':{createAdminClient:()=>admin},'./money-copy':copy});
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar']){const result=await feed.accountMoneyFeed('u',lang);assert.equal(result.items[0].currency,'USD');assert.equal(result.items[0].amountMinor,200);assert(result.items[0].title);}
 console.log('PASS: definitive missing-refund retry uses original reference/amount; uncertain responses never resubmit or release holds; USD notifications in nine languages.');
})().catch(e=>{console.error(e);process.exitCode=1});
