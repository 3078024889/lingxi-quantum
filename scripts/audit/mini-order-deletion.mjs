import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const storage=new Map();let device={platform:'ios',system:'iOS 18.6',version:'8.0.68'};
const wx={getStorageSync:k=>storage.get(k),setStorageSync:(k,v)=>storage.set(k,v),removeStorageSync:k=>storage.delete(k),getSystemInfoSync:()=>device,showModal:o=>o.success({confirm:true})};
function cjs(path){const module={exports:{}};vm.runInNewContext(fs.readFileSync(path,'utf8'),{module,wx,Date});return module.exports;}
const errors=cjs('miniapp/utils/virtual-payment-errors.js');
assert.match(errors.preflight(99),/至少1元/);assert.equal(errors.preflight(100),'');
device.version='8.0.67';assert.match(errors.preflight(100),/8.0.68/);
device={platform:'android'};assert.equal(errors.preflight(1),'');assert.match(errors.failureMessage({errCode:-15013}),/价格.*-15013/);
device.platform='ios';assert.match(errors.failureMessage({errCode:-1}),/中国大陆 App Store/);
const history=cjs('miniapp/utils/order-history.js'),expiry=cjs('miniapp/utils/topup-expiry.js');
let definition,failDelete=false;const now=Date.now();
let rows=[{id:'pending',status:'pending',product_id:'sasi-balance-10',created_at:new Date(now).toISOString()}, {id:'refund',status:'refunded',product_id:'old',created_at:new Date(now).toISOString()}, {id:'expired',status:'pending',providerConfirmedUnpaid:true,product_id:'ai-usd-balance-50',created_at:new Date(now-expiry.TTL).toISOString()}];
const api={request:async(path,o)=>{if(o?.method==='DELETE'){if(failDelete)throw Error('offline');const ids=o.data.orderIds;rows=rows.filter(row=>!ids.includes(row.id));return {deletedIds:ids};}return {orders:rows};}};
vm.runInNewContext(fs.readFileSync('miniapp/pages/orders/index.js','utf8'),{Page:d=>definition=d,wx,Set,require:n=>n.includes('order-history')?history:n.includes('topup-expiry')?expiry:api});
const page={...definition,data:{...definition.data},setData(v){Object.assign(this.data,v)}};
await page.load();assert.equal(page.data.orders.length,2);page.toggleHistory();assert.equal(page.data.orders.length,0,'expired topups must not move to history');page.toggleHistory();
page.archiveOrder({currentTarget:{dataset:{id:'refund'}}});page.toggleHistory();assert.equal(page.data.orders.length,1);
failDelete=true;await page.clearHistory();assert.equal(page.data.orders.length,1,'failed DELETE cannot report success or remove locally');
failDelete=false;await page.clearHistory();assert.equal(page.data.orders.length,0);await page.load();assert.equal(page.data.orders.length,0,'deleted history cannot reappear on refresh');page.toggleHistory();
storage.set('lx_mini_topup_pending',{orderId:'pending'});await page.deleteOrders(['pending']);assert.equal(storage.has('lx_mini_topup_pending'),false);assert.equal(page.data.orders.length,0);
const source=ts.transpileModule(fs.readFileSync('app/api/wechat/mini/orders/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const helperModule={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/mini/order-deletion.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:helperModule.exports});
const id='00000000-0000-0000-0000-000000000001';const foreign='00000000-0000-0000-0000-000000000002';
const dbRows=[{id,user_id:'owner',status:'paid',product_id:'sasi-balance-10',created_at:new Date(now).toISOString(),user_deleted_at:null},{id:foreign,user_id:'other',status:'pending',user_deleted_at:null}];let session={userId:'owner'},dbFail=false;
function from(){let filters=[],patch,select=false;const q={eq(k,v){filters.push(r=>r[k]===v);return q;},is(k,v){return q.eq(k,v);},in(k,v){filters.push(r=>v.includes(r[k]));return q;},lte(k,v){filters.push(r=>r[k]<=v);return q;},like(){return q;},or(){filters.push(r=>/^(sasi|ai)(-usd)?-balance-/.test(r.product_id||''));return q;},update(v){patch=v;return q;},select(){select=true;return q;},order(){return q;},limit(){return q;},then(resolve){const matches=dbRows.filter(r=>filters.every(f=>f(r)));if(patch&&!dbFail)matches.forEach(r=>Object.assign(r,patch));resolve({data:select?matches:null,error:dbFail?{}:null});}};return q;}
const exported={};vm.runInNewContext(source,{exports:exported,Date,require:n=>n==='next/server'?{NextResponse:{json:(data,opts)=>({data,status:opts?.status||200})}}:n.endsWith('/admin')?{createAdminClient:()=>({from})}:n.endsWith('/session')?{requireMiniSession:async()=>session}:n.endsWith('/rate-limit')?{checkRateLimit:async()=>true}:helperModule.exports});
const req=ids=>({text:async()=>JSON.stringify({orderIds:ids})});
assert.equal((await exported.DELETE(req([foreign]))).status,404);assert.equal(dbRows[1].user_deleted_at,null,'owner guard');
assert.equal((await exported.DELETE(req([id,foreign]))).status,404);assert.equal(dbRows[0].user_deleted_at,null,'mixed ownership batch cannot partially delete');
assert.equal((await exported.DELETE(req(['bad']))).status,400);
dbFail=true;assert.equal((await exported.DELETE(req([id]))).status,503);dbFail=false;
assert.equal((await exported.DELETE(req([id]))).status,200);assert.equal(dbRows[0].status,'paid','deletion cannot erase payment state');
assert.equal((await exported.GET({})).data.orders.length,0,'server deletion survives new device');
session=null;assert.equal((await exported.DELETE(req([id]))).status,401);
console.log('PASS: persistent order deletion, ownership, batch atomic guard, errors, expiry exclusion, checkout release and iOS payment conditions');

