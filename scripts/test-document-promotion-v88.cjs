const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
function load(file,deps={}){const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module,exports:module.exports,require:name=>deps[name]??require(name),AbortController,AbortSignal,TextEncoder,TextDecoder,URL,Date,Buffer},{filename:file});return module.exports}
const contract=load('lib/tools/document-translation-contract.ts');
const source=[{id:'s0',text:'Hello'},{id:'s1',text:'world'}];
assert.equal(contract.translationSegments(source).length,2);
assert.deepEqual(JSON.parse(JSON.stringify(contract.parseTranslatedSegments('[{"id":"s1","text":"monde"},{"id":"s0","text":"Bonjour"}]',source))),[{id:'s0',text:'Bonjour'},{id:'s1',text:'monde'}]);
for(const text of ['[]','[{"id":"s0","text":"Bonjour"}]','[{"id":"s0","text":"Bonjour"},{"id":"s0","text":"monde"}]','[{"id":"s0","text":"Bonjour"},{"id":"s1","text":"�"}]'])assert.throws(()=>contract.parseTranslatedSegments(text,source));
for(const value of [[],[{id:'s0',text:'a'},{id:'s0',text:'b'}],[{id:'bad',text:'hello'}],[{id:'s0',text:'x'.repeat(8001)}]])assert.throws(()=>contract.translationSegments(value));
async function main(){
 let authenticated=false,answer=true,calls=0;
 const api=load('app/api/tools/document-translate/route.ts',{
  'next/server':{NextResponse:{json:(body,init={})=>({body,status:init.status||200})}},
  '@/lib/supabase/server':{createClient:()=>({auth:{getUser:async()=>({data:{user:authenticated?{id:'fixture-user'}:null}})}})},
  '@/lib/sasi/request-security':{isSameOriginMutation:()=>true},
  '@/lib/security/abuse-guard':{enforceAbuseGuard:async()=>({ok:true})},
  '@/lib/security/bounded-request-json':{boundedRequestJson:async req=>req.body},
  '@/lib/sasi/experience/free-provider-config':{experienceRegionFromHost:()=> 'global'},
  '@/lib/tools/document-translation-contract':contract,
  '@/lib/sasi/experience/resilient-text':{resilientText:async input=>{calls++;assert.equal(input.allowConnected,false,'translation must never auto-fall-back to paid generation');if(!answer)return {kind:'needs-connection',experienceState:'exhausted'};const text=JSON.stringify(source.map(row=>({...row,text:'translated '+row.text})));input.validateAnswer(text);return {kind:'answer',answer:text}}},
 });
 const req={headers:new Headers(),body:{source:'auto',target:'fr',segments:source}};
 assert.equal((await api.POST(req)).status,401);assert.equal(calls,0);
 authenticated=true;assert.equal((await api.POST({...req,body:{...req.body,target:'invalid'}})).status,400);assert.equal(calls,0);
 const success=await api.POST(req);assert.equal(success.status,200);assert.equal(success.body.segments.length,2);
 answer=false;const unavailable=await api.POST(req);assert.equal(unavailable.status,503);assert.equal(unavailable.body.error,'TRANSLATION_ALLOWANCE_EXHAUSTED');
 const pricing=load('lib/sasi/pricing-v49.ts');assert.equal(pricing.videoChargeMinor(24,'1080p','CNY'),720);assert.equal(pricing.videoChargeMinor(24,'720p','CNY'),480);
 const promotion=load('lib/sasi/promotion-brief.ts');const series=load('lib/sasi/series-specification.ts',{'./pricing-v49':pricing,'./promotion-brief':promotion});
 const tagged='Source page mentions 50 episodes and 720p.\nREQUESTED PROMOTION: 1 episode; each episode 24 seconds; resolution 1080p; ratio 9:16.';
 assert.equal(series.seriesSpecification(tagged).episodes,1);assert.equal(series.seriesSpecification(tagged).seconds,24);assert.equal(promotion.promotionSettings(tagged).resolution,'1080p');
 assert.match(fs.readFileSync('app/api/tools/promotion-source/route.ts','utf8'),/fetchPublicMedia\(/);
 console.log('PASS translation complete-ID/Unicode contract, owner gate, language validation, included-only billing with exhausted allowance stopped, existing 720p/1080p pricing reused. API services isolated; no provider requests.');
}
main().catch(error=>{console.error(error);process.exitCode=1});
