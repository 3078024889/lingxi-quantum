const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
function load(file,imports={},extra={}){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:m.exports,require:n=>n==='server-only'?{}:n in imports?imports[n]:require(n),URL,AbortSignal,Buffer,process:{env:{}},...extra});return m.exports;}
const series=load('lib/sasi/series-plan.ts');
const shots=[{episode:1,duration:5,prompt:'camera follows a red paper boat',assetIds:[]},{episode:2,duration:8,prompt:'same red paper boat reaches shore',assetIds:[]}];
assert.equal(series.validateSeriesShots(shots,12).length,2);
for(const bad of [[],Array(61).fill(shots[0]),[{...shots[0],duration:13}],[{...shots[0],episode:0}],[{...shots[0],assetIds:['ok',7]}]])assert.throws(()=>series.validateSeriesShots(bad,12));
const costs=series.episodeBudgets(shots.map(s=>({...s,estimatedFen:s.duration*9})));
assert.equal(costs[1].fen,45);assert.equal(costs[2].fen,72);
const text=load('lib/sasi/byok-text-profile.ts');const tariff={model:'reviewed-model',inputYuanPerMillion:6,outputYuanPerMillion:30,maxOutputTokens:8192,validUntil:new Date(Date.now()+3600000).toISOString(),priceSource:'https://docs.volcengine.com/docs/ark/model-pricing'};
assert.ok(text.parseTextProfile(JSON.stringify(tariff)));for(const patch of [{validUntil:'yesterday'},{inputYuanPerMillion:-1},{model:'../bad'},{priceSource:'http://localhost/'},{maxOutputTokens:999999}])assert.equal(text.parseTextProfile(JSON.stringify({...tariff,...patch})),null);
let supplierCalls=0;const profile={model:'reviewed-image-model',size:'2K',estimatedFen:40,validUntil:tariff.validUntil,priceSource:tariff.priceSource};
const image=load('lib/sasi/seedream-byok.ts',{}, {fetch:async(url,args)=>{supplierCalls++;assert.equal(url,'https://ark.cn-beijing.volces.com/api/v3/images/generations');assert.equal(args.headers.Authorization,'Bearer owner-secret');assert.equal(JSON.parse(args.body).sequential_image_generation,'disabled');return{ok:true,json:async()=>({data:[{url:'https://example.com/test-image.png'}]})};}});
const user='owner',id='00000000-0000-4000-8000-000000000001';let task={id,user_id:user,state:'quoted',request:{prompt:'a red apple on a white table'},profile_version:image.imageVersion(profile),key_fingerprint:'fingerprint',expires_at:profile.validUntil};
let sameOrigin=true,authorized=true,fail=false;
const db={from(table){let changes;const filters=[];const q={select(){return q;},eq(k,v){filters.push([k,v]);return q;},update(v){changes=v;return q;},maybeSingle:async()=>exec(),then:(ok,no)=>Promise.resolve().then(exec).then(ok,no)};function exec(){assert.ok(filters.some(([k,v])=>k==='user_id'&&v===user),'must scope queries to authenticated owner');if(table==='sasi_provider_connections')return{data:{encrypted_credential:'cipher',fingerprint:'fingerprint',health_status:'healthy'}};assert.equal(table,'sasi_byok_image_tasks');if(!filters.every(([k,v])=>task[k]===v))return{data:null};if(changes)task={...task,...changes};return{data:{...task}};}return q;}};
const route=load('app/api/sasi/byok/image/route.ts',{
 'next/server':{NextResponse:{json:(body,init)=>({body,status:init.status})}},
 '@/lib/supabase/server':{createClient:()=>({auth:{getUser:async()=>({data:{user:authorized?{id:user}:null}})}})},
 '@/lib/supabase/admin':{createAdminClient:()=>db},
 '@/lib/sasi/creation-methods':load('lib/sasi/creation-methods.ts',{}),
'@/lib/sasi/request-security':{isSameOriginMutation:()=>sameOrigin},
 '@/lib/security/abuse-guard':{enforceAbuseGuard:async()=>({ok:true})},
 '@/lib/sasi/credential-vault':{decryptProviderKey:(u,p,c)=>{assert.equal(u,user);assert.equal(c,'cipher');return'owner-secret';}},
 '@/lib/sasi/safety':{reviewSasiProductionInput:()=>({ok:true})},
 '@/lib/sasi/seedream-byok':{...image,imageProfile:()=>profile,generateImage:async(...args)=>{if(fail){supplierCalls++;throw new Error('timeout');}return image.generateImage(...args);}},
});
const post=b=>route.POST({json:async()=>b});const confirm=()=>post({action:'confirm',taskId:id,acceptSupplierBilling:true});
(async()=>{
 sameOrigin=false;assert.equal((await confirm()).status,403);sameOrigin=true;authorized=false;assert.equal((await confirm()).status,401);authorized=true;
 assert.equal((await post({action:'confirm',taskId:id})).status,422);assert.equal(supplierCalls,0);
 await Promise.all([confirm(),confirm()]);assert.equal(supplierCalls,1);assert.equal(task.state,'succeeded');
 task={...task,state:'quoted'};fail=true;assert.equal((await confirm()).status,502);assert.equal(task.state,'uncertain');await confirm();assert.equal(supplierCalls,2,'uncertain request must not be retried');
 console.log('PASS: series bounds and episode costs; reviewed text profiles; BYOK image owner scope, consent, concurrency and uncertain non-retry. No real model calls.');
})().catch(e=>{console.error(e);process.exitCode=1;});
