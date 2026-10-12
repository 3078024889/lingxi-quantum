const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const file='app/api/tools/burn-after-read/file/complete/route.ts';
const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
async function scenario(change,expected){
 let note={id:'note',owner_user_id:'owner',ready_at:null,consumed_at:null,expires_at:new Date(Date.now()+60000).toISOString()},heads=0;
 const admin={from(table){const filters=[],q={select(){return q},eq(k,v){filters.push([k,'eq',v]);return q},is(k,v){filters.push([k,'eq',v]);return q},gt(k,v){filters.push([k,'gt',v]);return q},update(v){q.patch=v;return q},maybeSingle:async()=>{
  assert(filters.some(f=>f[0]==='owner_user_id'&&f[2]==='owner'));
  let value=note&&filters.every(([k,op,v])=>op==='gt'?note[k]>v:note[k]===v)?{...note}:null;
  if(q.patch&&value){Object.assign(note,q.patch);value={id:note.id}}
  return{data:value,error:null};
 },then(resolve){return Promise.resolve({data:[{object_key:'burn/note/file',size_bytes:10}],error:null}).then(resolve)}};return q}};
 const imports={'next/server':{NextResponse:{json:(body,o={})=>({body,status:o.status||200})}},'@/lib/supabase/server':{createClient:()=>({auth:{getUser:async()=>({data:{user:{id:'owner'}}})}})},'@/lib/supabase/admin':{createAdminClient:()=>admin},'@/lib/sasi/request-security':{isSameOriginMutation:()=>true},'@/lib/security/abuse-guard':{enforceAbuseGuard:async()=>({ok:true})},'@/lib/r2-private':{r2Head:async()=>{heads++;if(change==='delete')note=null;if(change==='consume')note.consumed_at=new Date().toISOString();if(change==='expire')note.expires_at=new Date(Date.now()-1000).toISOString();if(change==='duplicate')note.ready_at=new Date().toISOString();return{size:10}}}};
 if(change==='other-owner')note.owner_user_id='other';
 if(change==='already-expired')note.expires_at=new Date(Date.now()-1000).toISOString();
 imports['@/lib/security/bounded-request-json']={boundedRequestJson:req=>req.json()};
 const exports={};vm.runInNewContext(js,{exports,require:n=>{if(!imports[n])throw Error(n);return imports[n]},console,Date});
 const result=await exports.POST({headers:new Headers(),json:async()=>({id:'note'})});assert.equal(result.status,expected,change);
 if(['other-owner','already-expired'].includes(change))assert.equal(heads,0);
 if(['consume','expire'].includes(change))assert.equal(note.ready_at,null);
}
(async()=>{for(const [change,status] of [['normal',200],['duplicate',200],['other-owner',404],['already-expired',410],['delete',410],['consume',410],['expire',410]])await scenario(change,status);console.log('PASS: completion requires owner; deletion, expiration and consumption cannot be revived after HEAD; concurrent completion is idempotent. No R2 or database calls.')})().catch(e=>{console.error(e);process.exitCode=1});
