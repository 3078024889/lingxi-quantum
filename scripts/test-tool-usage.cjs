const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('assert/strict');
const {NextRequest}=require('next/server');
function load(file,imports={},globals={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:p=>p==='server-only'?{}:imports[p]||require(p),TextDecoder,Uint8Array,Intl,...globals});return exports;}
(async()=>{
 let inserts=[],error=null;const route=load('app/api/tools/analytics/track/route.ts',{'@/lib/supabase/admin':{createAdminClient:()=>({from:()=>({insert:async x=>{inserts.push(x);return {error}}})})},'@/lib/security/bounded-request-json':load('lib/security/bounded-request-json.ts'),'@/lib/security/abuse-guard':{enforceAbuseGuard:async()=>({ok:true})},'@/lib/sasi/request-security':load('lib/sasi/request-security.ts',{}, {URL})});
 const body={eventType:'process_completed',toolId:'batch-image',sessionId:'00000000-0000-4000-8000-000000000001',metadata:{file_count:2,failed_count:1,duration_ms:12,filename:'private.png',query:'secret',amount:100}};
 const req=(b=body,headers={})=>new NextRequest('https://lingxifield.com/api/tools/analytics/track',{method:'POST',headers:{origin:'https://lingxifield.com','user-agent':'Browser','content-type':'application/json',...headers},body:JSON.stringify(b)});
 assert.equal((await route.POST(req())).status,200);assert.equal(inserts.length,1);assert.equal(inserts[0].user_id,null);assert.notEqual(inserts[0].session_id,body.sessionId);assert.deepEqual(JSON.parse(JSON.stringify(inserts[0].metadata)),{file_count:2,failed_count:1,duration_ms:12});
 assert.equal((await route.POST(req({...body,eventType:'export_paid'}))).status,400);
 assert.equal((await route.POST(req(body,{origin:'https://evil.invalid'}))).status,403);
 for(const h of [{dnt:'1'},{'sec-gpc':'1'},{'user-agent':'HeadlessChrome'}])assert.equal((await route.POST(req(body,h))).status,204);
 assert.equal(inserts.length,1);
 assert.equal((await route.POST(req({...body,extra:'x'.repeat(3000)}))).status,400);
 error={message:'unavailable'};assert.equal((await route.POST(req())).status,503);
 let fetches=0,beacons=0;const storage={getItem:()=>null,setItem:()=>{}};
 const nav={userAgent:'Browser',sendBeacon:()=>{beacons++;return false}};
 const client=load('lib/tools/analytics-client.ts',{}, {window:{},navigator:nav,sessionStorage:storage,crypto:{randomUUID:()=>body.sessionId},Blob,fetch:async()=>{fetches++}});
 client.trackToolEvent('export_clicked','batch-image');assert.equal(fetches,1);assert.equal(beacons,1);
 storage.getItem=()=>{throw Error('denied')};assert.doesNotThrow(()=>client.trackToolEvent('tool_open','batch-image'));assert.equal(fetches,1);
 storage.getItem=()=>null;nav.doNotTrack='1';client.trackToolEvent('tool_open','batch-image');assert.equal(fetches,1);
 delete nav.doNotTrack;storage.getItem=k=>k==='lx-analytics-test'?'1':null;client.trackToolEvent('tool_open','batch-image');assert.equal(fetches,1);
 console.log('PASS tool usage: private content omitted, no client-paid events, origin/privacy/bot/body guards, DB errors visible, storage failures harmless, beacon fallback, test opt-out');
})().catch(e=>{console.error(e);process.exitCode=1});
