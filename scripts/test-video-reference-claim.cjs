const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const id='11111111-1111-4111-8111-111111111111';
async function run(mode,expected){
 let claimed=0,submitted=0,journal=[];
 const task={id,user_id:'owner',project_id:id,provider:'volcengine',state:'quoted',key_fingerprint:'key',memory_version:'m',expires_at:new Date(Date.now()+60000).toISOString(),request:{duration:4,resolution:'720p',references:[{assetId:id,sha256:'hash'}]}};
 const recovering=['recover','uncertain'].includes(mode);if(recovering)task.state='uncertain';
 const admin={rpc:async(name,args)=>{assert.equal(name,'claim_sasi_byok_video_v64');assert.deepEqual(JSON.parse(JSON.stringify(args)),{p_user_id:'owner',p_task_id:id});claimed++;return{data:{ok:true,claimed:true,state:'submitting'},error:null}},from(){const q={select(){return q},eq(){return q},in(){return q},update(){claimed++;return q},maybeSingle:async()=>({data:claimed?{id}:task,error:null}),then(resolve){return Promise.resolve({error:mode==='save-fails'?{code:'test'}:null}).then(resolve)}};return q}};
 const imports={
  '@/lib/sasi/intelligence/archive-generated-media':{generatedArchiveReady:()=>true},
  'node:crypto':require('node:crypto'),
  'next/server':{NextResponse:{json:(body,options={})=>({body,status:options.status||200})}},
  '@/lib/security/bounded-request-json':{boundedRequestJson:async()=>({action:recovering?'refresh':'confirm',taskId:id,acceptSupplierBilling:true})},
  '@/lib/sasi/durable/run-store':{beginDurableRun:async input=>{assert.equal(input.userId,'owner');assert.equal(input.idempotencyKey,'byok-video-submit:'+id);return{id:'run',state:mode==='recover'?'succeeded':'running',output:mode==='recover'?{taskId:id,provider:'volcengine',providerTaskId:'saved-supplier-id'}:null}},checkpointRun:async input=>{journal.push(input);if(input.state==='running')assert.equal(submitted,0);if(input.state==='succeeded')assert.equal(input.payload.providerTaskId,'supplier-id')}},
  '@/lib/supabase/server':{createClient:()=>({auth:{getUser:async()=>({data:{user:{id:'owner'}}})}})},
  '@/lib/supabase/admin':{createAdminClient:()=>admin},
  '@/lib/sasi/request-security':{isSameOriginMutation:()=>true},
  '@/lib/security/abuse-guard':{enforceAbuseGuard:async()=>({ok:true})},
  '@/lib/sasi/load-project-memory':{loadProjectMemory:async()=>({version:'m'})},
  '@/lib/sasi/video-references':{loadVideoReferences:async()=>{if(mode==='unavailable')throw Error('offline');return mode==='missing'?[]:[{assetId:id,sha256:mode==='changed'?'changed':'hash',url:'data:image/jpeg;base64,AAAA'}]}},
  '@/lib/sasi/seedance-byok':{submitSeedanceByok:async()=>{submitted++;return 'supplier-id'}},
  '@/lib/sasi/intelligence/user-video':{selectUserVideoConnection:async()=>({provider:'volcengine',videoModel:'seedance-2.0',fingerprint:'key',encrypted_credential:'encrypted'})},
  '@/lib/sasi/credential-vault':{decryptProviderKey:()=> 'test-key'},
  '@/lib/sasi/pricing-v49':{videoChargeMinor:()=>10},
  '@/lib/sasi/unified-balance':{requireSasiBalance:async()=>{},userSasiCurrency:async()=> 'CNY'},
 };
 const actions={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/sasi/intelligence/video-actions.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:actions,require:n=>n==='server-only'?{}:imports[n]||new Proxy({},{get(){return()=>{throw Error('Unexpected dependency '+n)}}}),console,Date});imports['@/lib/sasi/intelligence/video-actions']=actions;
 const exports={};const js=ts.transpileModule(fs.readFileSync('app/api/sasi/byok/video/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(js,{exports,require:n=>imports[n]||new Proxy({},{get(){return()=>{throw Error('Unexpected dependency '+n)}}}),console,Date});
 const result=await exports.POST({});assert.equal(result.status,expected,mode);const sends=['valid','save-fails'].includes(mode);assert.equal(submitted,sends?1:0);assert.equal(claimed,sends?2:mode==='recover'?1:0);
 if(sends){assert.equal(journal.length,2);assert.equal(journal[1].state,'succeeded')}
 if(mode==='recover')assert.equal(result.body.recovered,true);
}
(async()=>{for(const [mode,status] of [['changed',409],['missing',409],['unavailable',503],['valid',202],['save-fails',503],['recover',202],['uncertain',409]])await run(mode,status);console.log('PASS: invalid references never claim/submit; supplier receipt precedes task persistence; refresh restores known receipt without resubmission; ambiguous submission stays held for reconciliation. Mock supplier only.')})().catch(e=>{console.error(e);process.exitCode=1});
