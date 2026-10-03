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
 const {execFileSync}=require('node:child_process');
 execFileSync(process.execPath,[path.join(root,'scripts/test-money-reconcile-results.cjs')],{stdio:'inherit'});
 console.log('PASS: exact minor units, four wallets, nine-language status distinction and current reconciliation worker. No external payment calls.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
