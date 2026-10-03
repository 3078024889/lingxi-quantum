const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
function compile(file,imports){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(p=>p==='server-only'?{}:imports[p]||require(p),m,m.exports);return m.exports}
(async()=>{
 let claims=0,updates=[],sentBody,headers,fail=false,user=null;
 const admin={rpc:async()=>{claims++;return{data:[{id:'notice',withdrawal_id:'w',event_type:'PROVIDER_FUNDS_REQUIRED',attempt_count:1}]}},from(table){const q={select(){return q},eq(){return q},is(){return q},single:async()=>({data:table==='money_operator_settings'?{admin_emails:['business@lingxifield.com'],notify_email:'business@lingxifield.com'}:{id:'w',provider:'paypal',currency:'CNY',amount_minor:700,provider_currency:'USD',provider_amount_minor:100}}),update(x){updates.push(x);return q},then(r){return Promise.resolve({error:null}).then(r)}};return q}};
 const settings=compile('lib/money/operator-settings.ts',{'@/lib/supabase/admin':{createAdminClient:()=>admin},'@/lib/supabase/server':{createClient:()=>({auth:{getUser:async()=>({data:{user}})}})}});
 user={email:'outsider@example.invalid',user_metadata:{email:'business@lingxifield.com',role:'admin'}};assert.equal(await settings.moneyAdministrator(),null);
 user={email:'business@lingxifield.com'};assert.equal((await settings.moneyAdministrator()).email,user.email);
 const notifications=compile('lib/money/operator-notifications.ts',{'next/server':{after(){}},'@/lib/supabase/admin':{createAdminClient:()=>admin},'./operator-settings':settings});
 const originalKey=process.env.RESEND_API_KEY,originalFetch=global.fetch;delete process.env.RESEND_API_KEY;
 try{
  assert.deepEqual(await notifications.flushMoneyNotifications(),{sent:0,configured:false});assert.equal(claims,0);
  process.env.RESEND_API_KEY='fixture';global.fetch=async(url,options)=>{sentBody=JSON.parse(options.body);headers=options.headers;return{ok:!fail,json:async()=>fail?{}:{id:'resend-receipt'}}};
  assert.equal((await notifications.flushMoneyNotifications()).sent,1);assert.deepEqual(sentBody.to,['business@lingxifield.com']);assert(sentBody.subject.includes('US$1.00'));assert(sentBody.text.includes('CNY'));assert.equal(headers['Idempotency-Key'],'money-notice/notice');assert.equal(updates[0].status,'sent');assert.equal(updates[0].message_id,'resend-receipt');
  fail=true;updates=[];assert.equal((await notifications.flushMoneyNotifications()).sent,0);assert.equal(updates[0].status,'failed');assert(updates[0].available_at);assert(!updates[0].sent_at);
  fail=false;updates=[];assert.equal((await notifications.flushMoneyNotifications(5,true)).sent,1);assert.equal(updates[0].attempt_count,0);assert(updates[0].available_at);assert.equal(updates[1].status,'sent');
 }finally{global.fetch=originalFetch;if(originalKey===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=originalKey}
 const policy=compile('lib/money/refund-error-policy.ts',{});
 for(const e of ['WECHAT_REFUND_403:NOT_ENOUGH','ALIPAY_ACQ.SELLER_BALANCE_NOT_ENOUGH','PAYPAL_REFUND_HTTP_422:INSUFFICIENT_FUNDS'])assert.equal(policy.classifyProviderException(new Error(e)).failureCode,'PROVIDER_FUNDS_REQUIRED');
 let providerCalls=0;
 const service=compile('lib/payments/withdrawal-processing.ts',{'@/lib/supabase/admin':{createAdminClient:()=>({from(){const q={select(){return q},eq(){return q},single:async()=>({data:{id:'w',status:'requested',submission_confirmed_at:null}})};return q}})},'@/lib/money/operator-notifications':{scheduleMoneyNotices(){}},'@/lib/money/reconcile-worker':{reconcileWithdrawal:async()=>{providerCalls++}}});
 assert.equal((await service.refreshWithdrawal('w','u')).status,'requested');assert.equal(providerCalls,0);
 console.log('PASS: administrator allowlist, spoofed metadata rejection, unconfirmed request safety, three provider funds errors, unconfigured mail queue, USD notice amount, stable mail idempotency, successful receipt and failed-mail retry. No live payments or emails.');
})().catch(e=>{console.error(e);process.exitCode=1});
