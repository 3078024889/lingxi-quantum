const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
function compile(file,imports){const mod={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;new Function('require','module','exports','console',code)(name=>name==='server-only'?{}:imports[name]||require(name),mod,mod.exports,{error(){}});return mod.exports;}
async function scenario(status,workerResult){
 const updates=[],calls=[];
 const admin={rpc:async()=>({data:{ok:true},error:null}),from(){const q={select(){return q},eq(){return q},single:async()=>({data:{id:'w',status}}),update(value){updates.push(value);return q},then(resolve){return Promise.resolve({error:null}).then(resolve)}};return q}};
 const service=compile('lib/payments/withdrawal-processing.ts',{'@/lib/supabase/admin':{createAdminClient:()=>admin},'@/lib/money/operator-notifications':{scheduleMoneyNotices(){}},'@/lib/money/reconcile-worker':{reconcileWithdrawal:async id=>{calls.push(id);return workerResult}}});
 const result=await service.refreshWithdrawal('w','u',true);
 if(['completed','failed'].includes(status)){assert.equal(calls.length,0);assert.equal(result.status,status)}
 else{assert.deepEqual(calls,['w']);assert.equal(result.status,workerResult.status==='completed'?'completed':'processing');assert.equal(result.needsSupport,Boolean(workerResult.operatorActionRequired));assert.equal(result.failureCode,workerResult.failureCode||null)}
}
(async()=>{
 await scenario('completed',{});await scenario('failed',{});
 await scenario('requested',{status:'completed'});
 await scenario('processing',{status:'pending',operatorActionRequired:true,failureCode:'PROVIDER_FUNDS_REQUIRED'});
 await scenario('processing',{status:'pending',operatorActionRequired:true,failureCode:'OPERATOR_REVIEW_REQUIRED'});
 await scenario('processing',{status:'pending'});
 const copy=compile('lib/notifications/money-copy.ts',{});
 const admin={from(table){const rows=table==='orders'?[{id:'test',product_id:'toolquote:test',currency:'USD',amount_usd:2,amount_rmb:4,created_at:'2026-10-01'}]:[];const q={select(){return q},eq(){return q},in(){return q},order(){return q},limit(){return Promise.resolve({data:rows,error:null})}};return q}};
 const feed=compile('lib/notifications/money-feed.ts',{'@/lib/supabase/admin':{createAdminClient:()=>admin},'@/lib/money/operator-settings':{moneyOperatorSettings:async()=>({admin_emails:[]})},'./money-copy':copy});
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar']){const result=await feed.accountMoneyFeed('u',lang);assert.equal(result.items[0].currency,'USD');assert.equal(result.items[0].amountMinor,200);assert(result.items[0].title);}
 console.log('PASS: current dispatcher preserves pending/support states and never resubmits closed withdrawals; USD notifications in nine languages.');
})().catch(e=>{console.error(e);process.exitCode=1});
