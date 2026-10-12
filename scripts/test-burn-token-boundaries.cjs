const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const tokenExports={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/tools/burn-link-token.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:tokenExports,require:n=>n==='server-only'?{}:require(n),process:{env:{BURN_LINK_TOKEN_SECRET:'isolated-test-secret'}},Buffer,Date});
const signed=tokenExports.createBurnRevealToken('note',new Date(Date.now()+60000).toISOString());
assert(tokenExports.verifyBurnRevealToken('note',signed));
assert.equal(tokenExports.verifyBurnRevealToken('other-note',signed),false);
assert.equal(tokenExports.verifyBurnRevealToken('note',signed+'X'),false);
assert.equal(tokenExports.verifyBurnRevealToken('note',tokenExports.createBurnRevealToken('note',new Date(Date.now()-20000).toISOString())),false);
console.log('PASS: actual HMAC binds note ID and expiry; tampered and expired tokens rejected.');
for(const action of ['consume','ack']){
 let calls=0,valid=false;
 const exports={};const imports={
  '@/lib/security/bounded-request-json':{boundedRequestJson:req=>req.json()},
  'next/server':{NextResponse:{json:(body,options={})=>({body,status:options.status||200,headers:options.headers})}},
  '@/lib/supabase/admin':{createAdminClient:()=>{calls++;return{rpc:async(name,args)=>{if(action==='ack'){assert.equal(args.p_view_id,'12345678-1234-1234-1234-123456789012');assert.equal(name,'commit_burn_note_view')}return{data:{ciphertext:'encrypted',iv:'nonce',has_files:false,access_until:new Date(Date.now()+60000).toISOString()},error:null}}}}},
  '@/lib/tools/burn-link-token':{verifyBurnRevealToken:(id,token)=>valid&&id==='note'&&token==='signed'},
  '@/lib/r2-private':{presignR2:()=>{throw Error('must not sign absent files')}}
 };
 const js=ts.transpileModule(fs.readFileSync(`app/api/tools/burn-after-read/${action}/route.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(js,{exports,require:n=>{if(!imports[n])throw Error(n);return imports[n]},console});
 (async()=>{const req=body=>({json:async()=>body,headers:new Headers({origin:'https://lingxifield.cn',referer:'https://lingxifield.cn/tools/burn-after-read/note','sec-fetch-site':'same-origin'})});
  for(const body of [{id:'note'},{id:'note',revealToken:'forged'},{id:'note',revealToken:{}},null]){const r=await exports.POST(req(body));assert.equal(r.status,body===null?400:403);assert.equal(calls,0)}
  valid=true;if(action==='ack'){const r=await exports.POST(req({id:'note',revealToken:'signed'}));assert.equal(r.status,400);assert.equal(calls,0)}
  const r=await exports.POST(req({id:'note',revealToken:'signed',viewId:'12345678-1234-1234-1234-123456789012'}));assert.equal(r.status,200);assert.equal(calls,1);assert.equal(r.headers['Cache-Control'],'no-store');
  console.log(`PASS: ${action} rejects same-origin/WebView token bypass before database access; signed token accepted.`);
 })().catch(error=>{console.error(error);process.exitCode=1});
}
