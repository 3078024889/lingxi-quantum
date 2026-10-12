const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const source=ts.transpileModule(fs.readFileSync('app/api/tools/burn-after-read/file/prepare/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
async function scenario(mode,status){
 let signed=0,dbCalls=0;const note={id:'note',expires_at:new Date(Date.now()+60000).toISOString(),ready_at:mode==='ready'?'ready':null,consumed_at:mode==='consumed'?'consumed':null};if(mode==='expired')note.expires_at=new Date(Date.now()-1000).toISOString();
 const admin={from(table){dbCalls++;const filters=[],q={select(){return q},eq(k,v){filters.push([k,v]);return q},order(){return q},maybeSingle:async()=>{assert(filters.some(([k,v])=>k===(table==='burn_notes'?'owner_user_id':'user_id')&&v==='owner'));return{data:table==='burn_notes'?note:{id:'quote',quantity:1},error:mode==='note-error'&&table==='burn_notes'?{code:'TEST'}:null}},then(resolve){return Promise.resolve({data:[{id:'file',object_key:'burn/note/file',original_name:'file.txt',size_bytes:10,mime_type:'text/plain'}],error:mode==='file-error'?{code:'TEST'}:null}).then(resolve)}};return q}};
 const imports={
  'next/server':{NextResponse:{json:(body,o={})=>({body,status:o.status||200})}},
  '@/lib/supabase/server':{createClient:()=>({auth:{getUser:async()=>({data:{user:{id:'owner'}}})}})},
  '@/lib/supabase/admin':{createAdminClient:()=>admin},
  '@/lib/sasi/request-security':{isSameOriginMutation:()=>true},
  '@/lib/security/abuse-guard':{enforceAbuseGuard:async()=>({ok:true})},
  '@/lib/security/bounded-request-json':{boundedRequestJson:req=>req.json()},
  '@/lib/tools/burn-link-token':{createBurnRevealToken:()=> 'signed'},
  '@/lib/r2-private':{r2Ready:()=>true,presignR2:(method,key,ttl)=>{assert.equal(method,'PUT');assert(ttl>0&&ttl<=60);signed++;return 'https://example.test/upload'}},
 };
 const exports={};vm.runInNewContext(source,{exports,require:n=>{if(!imports[n])throw Error(n);return imports[n]},console,Date});
 const r=await exports.POST({headers:new Headers(),json:async()=>({quoteId:'quote',ciphertext:'encrypted',iv:'12345678',ttlMinutes:10,mode:'once',maxViews:1,files:[{name:'file.txt',type:'text/plain',size:mode==='fraction'?1.5:10}]})});assert.equal(r.status,status,mode);
 assert.equal(signed,mode==='pending'?1:0);if(mode==='ready'){assert.equal(r.body.alreadyReady,true);assert.equal(r.body.files[0].uploadUrl,null)}if(mode==='fraction')assert.equal(dbCalls,0);
}
(async()=>{for(const [mode,status] of [['ready',200],['pending',200],['expired',410],['consumed',410],['fraction',400],['note-error',503],['file-error',503]])await scenario(mode,status);console.log('PASS: owned paid preparation, completed uploads never receive PUT URLs, expiry/consumption prevent reissue, bounded URL lifetime, fractional sizes and database errors fail closed. Mock R2/DB.')})().catch(e=>{console.error(e);process.exitCode=1});
