const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict'),ts=require('typescript');
const guardPath='lib/sasi/request-security.ts',own='lingxi-quantum-example-celestial9.vercel.app',branch='lingxi-quantum-git-audit-celestial9.vercel.app',other='another-project.vercel.app';
function compile(source,env,imports={}){
 const exports={};vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,URL,URLSearchParams,console,process:{env},require:id=>{if(id==='server-only')return{};if(id in imports)return imports[id];throw Error('Unexpected import: '+id)}});return exports;
}
function request(host=own,origin='https://'+host,extra={}){const headers=new Headers({host,'sec-fetch-site':'same-origin',...extra});if(origin!==null)headers.set('origin',origin);return{headers,nextUrl:new URL('https://'+host),formData:async()=>new Map([['mode','signin'],['email','invalid']])};}
const source=fs.readFileSync(guardPath,'utf8'),env={VERCEL_ENV:'preview',VERCEL_URL:own,VERCEL_BRANCH_URL:branch},guard=compile(source,env).isSameOriginMutation;
// Exact source from 4291484f; available in shallow CI without reading moving HEAD.
const baselineSource=fs.readFileSync('tests/fixtures/preview-origin-before.ts.txt','utf8');
assert.equal(crypto.createHash('sha256').update(baselineSource).digest('hex'),'82252940a98ea880d9cec7928c0da69490b87125771dba033360fa1e0c211fa2');
const baseline=compile(baselineSource,env).isSameOriginMutation;
assert.equal(baseline(request()),false,'baseline must reproduce rejected own preview');
assert.equal(guard(request()),true);assert.equal(guard(request(branch)),true);
assert.equal(guard(request(own,null,{referer:'https://'+own+'/account'})),true);
for(const host of ['lingxifield.com','www.lingxifield.com','lingxifield.cn','www.lingxifield.cn']){assert.equal(baseline(request(host)),true);assert.equal(guard(request(host)),true);}
for(const req of [
 request(other),request(own,'https://'+other),request(other,'https://'+own),
 request(own,'http://'+own),request(own,'https://'+own+':8443'),request(own,'null'),
 request(own,null),request(own,'https://evil.example',{referer:'https://'+own+'/account'}),
 request(own,'https://'+own,{'sec-fetch-site':'cross-site'}),
 request(own,'https://'+own+'.evil.example'),request(own,'https://user:pass@'+own),
 request(own,'https://'+own,{'sec-fetch-site':'none'}),
])assert.equal(guard(req),false,'must reject untrusted source or destination');
for(const mode of ['production','development',undefined])assert.equal(compile(source,{...env,VERCEL_ENV:mode}).isSameOriginMutation(request()),false);
assert.equal(compile(source,{VERCEL_ENV:'preview'}).isSameOriginMutation(request()),false);
assert.equal(compile(source,{VERCEL_ENV:'preview',VERCEL_URL:'evil.example'}).isSameOriginMutation(request('evil.example')),false);
class Response{constructor(_,options){this.status=options.status;this.headers=new Headers(options.headers)}}
async function auth(guard){return compile(fs.readFileSync('app/account/auth/route.ts','utf8'),env,{'next/server':{NextResponse:Response},'@/lib/supabase/server':{createClient:()=>{throw Error('Validation must not contact auth provider')}},'@/lib/supabase/admin':{},'@/lib/sasi/request-security':{isSameOriginMutation:guard}}).POST(request());}
(async()=>{
 assert.equal((await auth(baseline)).headers.get('location'),'/account?auth_error=origin');
 assert.equal(new URL((await auth(guard)).headers.get('location'),'https://'+own).searchParams.get('auth_error'),'email');
 console.log('PASS: own preview and branch alias accepted; production, foreign previews, mismatched hosts, cross-site, opaque origin and unsafe URL variants remain blocked. Native auth POST reaches validation without contacting the provider.');
})().catch(e=>{console.error(e);process.exitCode=1});
