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
const now=Date.now();
const source=ts.transpileModule(fs.readFileSync('app/api/wechat/mini/orders/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const helperModule={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/mini/order-deletion.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:helperModule.exports});
const id='00000000-0000-0000-0000-000000000001';const foreign='00000000-0000-0000-0000-000000000002';
const dbRows=[{id,user_id:'owner',status:'paid',product_id:'sasi-balance-10',created_at:new Date(now).toISOString(),user_deleted_at:null},{id:foreign,user_id:'other',status:'pending',user_deleted_at:null}];let session={userId:'owner',accountConnected:true},dbFail=false;
function from(){let filters=[],patch,select=false;const q={eq(k,v){filters.push(r=>r[k]===v);return q;},is(k,v){return q.eq(k,v);},in(k,v){filters.push(r=>v.includes(r[k]));return q;},lte(k,v){filters.push(r=>r[k]<=v);return q;},like(){return q;},or(){filters.push(r=>/^(sasi|ai)(-usd)?-balance-/.test(r.product_id||''));return q;},update(v){patch=v;return q;},select(){select=true;return q;},order(){return q;},limit(){return q;},then(resolve){const matches=dbRows.filter(r=>filters.every(f=>f(r)));if(patch&&!dbFail)matches.forEach(r=>Object.assign(r,patch));resolve({data:select?matches:null,error:dbFail?{}:null});}};return q;}
const exported={};vm.runInNewContext(source,{exports:exported,Date,require:n=>n==='next/server'?{NextResponse:{json:(data,opts)=>({data,status:opts?.status||200})}}:n.endsWith('/admin')?{createAdminClient:()=>({from})}:n.endsWith('/session')?{requireMiniSession:async()=>session}:n.endsWith('/rate-limit')?{checkRateLimit:async()=>true}:n.endsWith('/order-cleanup')?{expireMiniUnpaidOrders:async()=>{}}:helperModule.exports});
const req=ids=>({text:async()=>JSON.stringify({orderIds:ids})});
assert.equal((await exported.DELETE(req([foreign]))).status,404);assert.equal(dbRows[1].user_deleted_at,null,'owner guard');
assert.equal((await exported.DELETE(req([id,foreign]))).status,404);assert.equal(dbRows[0].user_deleted_at,null,'mixed ownership batch cannot partially delete');
assert.equal((await exported.DELETE(req(['bad']))).status,400);
dbFail=true;assert.equal((await exported.DELETE(req([id]))).status,503);dbFail=false;
assert.equal((await exported.DELETE(req([id]))).status,200);assert.equal(dbRows[0].status,'paid','deletion cannot erase payment state');
assert.equal((await exported.GET({})).data.orders.length,0,'server deletion survives new device');
session.accountConnected=false;assert.equal((await exported.DELETE(req([id]))).status,409);session=null;assert.equal((await exported.DELETE(req([id]))).status,401);
console.log('PASS: persistent order deletion, ownership, batch atomic guard, errors, expiry exclusion, checkout release and iOS payment conditions');


let webUser={id:'owner'},sameOrigin=true;
const webExports={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/account/orders/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:webExports,Date,require:n=>n==='next/server'?{NextResponse:{json:(data,opts)=>({data,status:opts?.status||200})}}:n.endsWith('/server')?{createClient:()=>({auth:{getUser:async()=>({data:{user:webUser}})}})}:n.endsWith('/admin')?{createAdminClient:()=>({from})}:n.endsWith('/request-security')?{isSameOriginMutation:()=>sameOrigin}:n.endsWith('/rate-limit')?{checkRateLimit:async()=>true}:helperModule.exports});
dbRows[0].user_deleted_at=null;
assert.equal((await webExports.DELETE(req([id,foreign]))).status,404);assert.equal(dbRows[0].user_deleted_at,null);
sameOrigin=false;assert.equal((await webExports.DELETE(req([id]))).status,403);sameOrigin=true;
webUser=null;assert.equal((await webExports.DELETE(req([id]))).status,401);webUser={id:'owner'};
assert.equal((await webExports.DELETE(req([id]))).status,200);assert.equal(dbRows[0].status,'paid');
assert.ok(dbRows[0].user_deleted_at);assert.equal(dbRows[1].user_deleted_at,null);
console.log('PASS: website deletion validates authenticated ownership, origin and full batch; payment settlement and other account records remain intact.');
