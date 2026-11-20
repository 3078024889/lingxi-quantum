import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';

function compile(relativePath, dependencies={}) {
  const exports={};
  const source=readFileSync(new URL(relativePath,import.meta.url),'utf8');
  const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}});
  runInNewContext(outputText,{
    exports,
    require(name) {
      if(!(name in dependencies)) throw Error('Unexpected dependency: '+name);
      return dependencies[name];
    }
  });
  return exports;
}

test('authenticated free translation handles several batches and rejects abuse', async()=>{
  let signedIn=true,throttled=false,providerCalls=0;
  const contract=compile('../lib/tools/document-translation-contract.ts');
  const {POST}=compile('../app/api/tools/document-translate/route.ts',{
    'next/server':{NextResponse:{json:(body,options)=>({body,...options})}},
    '@/lib/supabase/server':{createClient:()=>({auth:{getUser:async()=>({data:{user:signedIn?{id:'test-account'}:null}})}})},
    '@/lib/sasi/request-security':{isSameOriginMutation:req=>req.allowedOrigin},
    '@/lib/security/abuse-guard':{enforceAbuseGuard:async()=>throttled?{ok:false,error:'RATE_LIMITED',status:429}:{ok:true}},
    '@/lib/security/bounded-request-json':{boundedRequestJson:async req=>req.input},
    '@/lib/sasi/experience/free-provider-config':{experienceRegionFromHost:()=> 'cn'},
    '@/lib/tools/document-translation-contract':contract,
    '@/lib/sasi/experience/free-text-router':{runExperienceText:async req=>{
      providerCalls++;
      const {segments}=JSON.parse(req.messages[1].content);
      return {text:JSON.stringify(segments.map(segment=>({id:segment.id,text:'Translated'})))};
    }}
  });
  const run=(id,allowedOrigin=true)=>POST({allowedOrigin,headers:new Headers(),input:{source:'auto',target:'en',segments:[{id,text:'测试'}]}});
  assert.equal((await run('s0',false)).status,403);
  signedIn=false;
  assert.equal((await run('s0')).status,401);
  signedIn=true;
  for(const id of ['s0','s30']){
    const result=await run(id);
    assert.equal(result.status,200);
    assert.equal(result.body.billing,'free');
    assert.equal(result.body.segments[0].id,id);
  }
  throttled=true;
  assert.equal((await run('s60')).status,429);
  assert.equal(providerCalls,2);
});
