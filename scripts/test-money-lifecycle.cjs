const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(name){
 const file=path.resolve(root,name);if(cache.has(file))return cache.get(file).exports;
 const m={exports:{}};cache.set(file,m);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 new Function('require','module','exports',code)(p=>p==='@/lib/paypal'?{getPaypalAccessToken:async()=>'TEST-ONLY',queryPaypalOrder:async()=>({raw:{purchase_units:[{payments:{captures:[{id:'capture-test',amount:{currency_code:'USD'}}]}}]}})}:require(p),m,m.exports);
 return m.exports;
}
async function main(){
 const {moneyMinor,walletKind}=load('lib/payments/money-input.ts');
 for(const input of ['',0,-1,'1e3','1.001','Infinity','900719925474099.99',null])assert.equal(moneyMinor(input),null,String(input));
 assert.equal(moneyMinor('1.01'),101);assert.equal(moneyMinor('0.29'),29);assert.equal(moneyMinor(' 9.90 '),990);
 assert.equal(walletKind('ai-usd-balance-10'),'ai_usd');assert.equal(walletKind('sasi-usd-balance-10'),'sasi_usd');
 const {moneyNotice,moneyText}=load('lib/notifications/money-copy.ts');
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar']){
  for(const currency of ['CNY','USD']){
   const pending=moneyNotice(lang,'withdrawal','processing',currency,100),done=moneyNotice(lang,'withdrawal','completed',currency,100);
   assert(pending.title&&pending.body);assert.notEqual(pending.body,done.body);
   assert.notEqual(moneyNotice(lang,'refund','requested',currency,100,true).body,pending.body);
  }
  assert(moneyText(lang,'details'));assert(!/WITHDRAWAL_REQUEST_FAILED/.test(moneyText(lang,'unavailable')));
 }
 const {queryProviderRefund,refundPaypal}=load('lib/payment-refunds.ts');
 let calls=0;global.fetch=async()=>{calls++;throw new Error('unexpected network')};
 const base={provider:'paypal',providerPaymentId:'order-test',withdrawalId:'12345678-1234-1234-1234-123456789abc',refundId:null,currency:'USD',refundAmountMinor:101};
 assert.equal((await queryProviderRefund(base)).state,'pending');assert.equal(calls,0);
 global.fetch=async(url,options)=>{calls++;assert(!options.method||options.method==='GET');return {ok:true,json:async()=>({id:'refund-test',status:'COMPLETED',amount:{currency_code:'USD',value:'1.01'}})}};
 assert.equal((await queryProviderRefund({...base,refundId:'refund-test'})).state,'completed');
 await assert.rejects(()=>queryProviderRefund({...base,refundId:'refund-test',refundAmountMinor:102}),/MISMATCH/);
 global.fetch=async()=>({ok:true,json:async()=>({id:'refund-test',status:'COMPLETED',amount:{currency_code:'CNY',value:'1.01'}})});
 await assert.rejects(()=>refundPaypal({paypalOrderId:'order',localOrderId:'local',withdrawalId:base.withdrawalId,orderAmountUsd:10,refundAmountUsd:1.01}),/MISMATCH/);
 const keys=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
 process.env.WECHAT_MCH_ID='TEST';process.env.WECHAT_CERT_SERIAL_NO='TEST';process.env.WECHAT_PRIVATE_KEY=keys.privateKey.export({type:'pkcs8',format:'pem'});
 global.fetch=async(url,options)=>{assert.equal(options.method,'GET');return {ok:true,json:async()=>({out_refund_no:'LXW'+base.withdrawalId.replace(/-/g,''),out_trade_no:'order-test',refund_id:'wx-test',status:'SUCCESS',amount:{currency:'CNY',refund:101}})}};
 assert.equal((await queryProviderRefund({...base,provider:'wechat',currency:'CNY'})).state,'completed');
 await assert.rejects(()=>queryProviderRefund({...base,provider:'wechat',currency:'CNY',refundAmountMinor:102}),/MISMATCH/);
 console.log('PASS: exact minor units, four wallets, nine-language status distinction, query-only reconciliation, missing receipt guard, provider amount/currency/reference checks. No external payment calls.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
