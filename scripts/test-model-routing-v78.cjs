const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
function load(file,imports){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:m.exports,require:n=>n==='server-only'?{}:n in imports?imports[n]:require(n),URL,Headers,AbortSignal,console,process,Date});return m.exports}
const defaults=load('lib/sasi/intelligence/provider-defaults.ts',{});
for(const model of ['doubao-seedance-2-5-260628','doubao-seedream-4-5','sora-2','wan-2.2-t2v','text-embedding-3-small'])assert.equal(defaults.chooseTextModel('volcengine',[],model),'');
assert.equal(defaults.chooseTextModel('volcengine',['doubao-seedance-2-5-260628','doubao-seed-1-6'], 'doubao-seedance-2-5-260628'),'doubao-seed-1-6');
assert.equal(defaults.chooseTextModel('compatible',[],'my-chat-alias'),'my-chat-alias');
assert.equal(defaults.chooseTextModel('gemini',[],'gemini-2.5-flash'),'gemini-2.5-flash');
let owner='owner-a',reads=[],writes=[];
let rows=[{id:'connection-a',user_id:owner,provider:'volcengine',key_hint:'masked',encrypted_credential:'encrypted-fixture',fingerprint:'fixture',enabled:true,health_status:'healthy',base_url:'https://ark.cn-beijing.volces.com/api/v3',model_id:'doubao-seedance-2-5-260628',discovered_models:['doubao-seed-1-6','doubao-seedance-2-0'],capabilities:['text','video'],model_preferences:{text:'doubao-seed-1-6',video:'doubao-seedance-2-5-260628'}}];
const db={from(table){assert.equal(table,'sasi_provider_connections');let predicates=[],update=null,columns='*';const chain={select(c){columns=c;reads.push(c);return chain},eq(k,v){predicates.push(r=>r[k]===v);return chain},in(k,v){predicates.push(r=>v.includes(r[k]));return chain},order(){return chain},update(p){update=p;return chain},maybeSingle(){return execute(true)},then(resolve,reject){return execute(false).then(resolve,reject)}};async function execute(single){const found=rows.filter(r=>predicates.every(f=>f(r)));if(update){writes.push({update,ids:found.map(r=>r.id)});found.forEach(r=>Object.assign(r,update));return {error:null}}const data=found.map(r=>Object.fromEntries(columns.split(',').map(k=>[k,r[k]])));return {data:single?data[0]||null:data,error:null}}return chain}};
const shared={'@/lib/supabase/admin':{createAdminClient:()=>db},'@/lib/sasi/credential-vault':{validByokProvider:p=>p==='volcengine',decryptProviderKey:()=>{throw Error('NO_SECRET_ACCESS')}},'./provider-defaults':defaults,'@/lib/sasi/gateway/ssrf-guard':{validateProviderBaseUrl:u=>({pass:true,normalized:u})},'./runtime-health':{},'./telemetry':{},'@/lib/sasi/pricing-v49':{},'@/lib/sasi/unified-balance':{},'@/lib/security/provider-json-probe':{},'@/lib/security/public-media-range':{},'./provider-lifecycle':{officialOpenAiVideoRetired:()=>false},'@/lib/security/public-media-fetch':{}};
const text=load('lib/sasi/intelligence/user-text.ts',shared),video=load('lib/sasi/intelligence/user-video.ts',shared);
const route=load('app/api/sasi/connections/route.ts',{
 ...shared,'next/server':{NextResponse:{json:(body,options={})=>({body,status:options.status||200})}},
 '@/lib/supabase/server':{createClient:()=>({auth:{getUser:async()=>({data:{user:{id:owner}}})}})},
 '@/lib/sasi/credential-vault':{validByokProvider:p=>p==='volcengine',byokVaultConfigured:()=>true,validateProviderKey:()=>null,encryptProviderKey:()=>{throw Error('NO_KEY_REPLACEMENT')},providerKeyFingerprint:()=>{throw Error('NO_KEY_ACCESS')},providerKeyHint:()=>{throw Error('NO_KEY_ACCESS')}},
 '@/lib/sasi/request-security':{isSameOriginMutation:()=>true},'@/lib/security/abuse-guard':{enforceAbuseGuard:async()=>({ok:true})},
 '@/lib/security/public-endpoint':{parsePublicHttpsUrl:async u=>({url:new URL(u)})},
 '@/lib/sasi/intelligence/provider-defaults':defaults,'@/lib/security/bounded-request-json':{boundedRequestJson:async r=>r.body}
});
const req=body=>({headers:new Headers(),body});
(async()=>{
 assert.equal((await text.selectUserTextConnection(owner)).model_id,'doubao-seed-1-6');
 assert.equal((await video.selectUserVideoConnection(owner)).videoModel,'doubao-seedance-2-5-260628','explicit video preference wins over first discovered model');
 let r=await route.POST(req({provider:'volcengine',models:{text:'doubao-seed-1-6',video:'doubao-seedance-2-5-260628'}}));assert.equal(r.status,200);
 assert.equal(rows[0].encrypted_credential,'encrypted-fixture');assert.equal(rows[0].discovered_models.length,2);assert.equal(rows[0].health_status,'healthy');
 assert(!reads.some(s=>s.includes('encrypted_credential')&&s.includes('key_hint')),'settings must not read the stored secret');
 assert(!writes.some(w=>Object.hasOwn(w.update,'encrypted_credential')));assert.equal(rows[0].model_id,'doubao-seedance-2-5-260628','omitted legacy setting preserved');
 r=await route.GET();assert.equal(r.status,200);assert(!JSON.stringify(r.body).includes('encrypted-fixture'));assert.equal(r.body.connections[0].models.video,'doubao-seedance-2-5-260628');
 const count=writes.length;r=await route.POST(req({provider:'volcengine',models:{text:'bad\nmodel'}}));assert.equal(r.status,400);assert.equal(writes.length,count);
 for(const models of [{text:'doubao-seedance-2-5-260628'},{video:'apikey-fixture-name'}]){r=await route.POST(req({provider:'volcengine',models}));assert.equal(r.status,400);assert.equal(writes.length,count)}
 owner='owner-b';r=await route.POST(req({provider:'volcengine',models:{text:'doubao-seed-1-6'}}));assert.equal(r.status,409);assert.equal(writes.length,count);
 console.log('PASS: media IDs rejected for chat; separate text/video choices; explicit video precedence; owned config updates preserve credentials/discovery; invalid settings and another owner rejected; public response excludes secrets. No supplier requests.');
})().catch(e=>{console.error(e);process.exitCode=1});
