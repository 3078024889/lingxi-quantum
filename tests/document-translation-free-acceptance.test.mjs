import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';

function compile(relativePath, dependencies={}, runtime={}) {
  const exports={};
  const source=readFileSync(new URL(relativePath,import.meta.url),'utf8');
  const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}});
  runInNewContext(outputText,{
    exports, ...runtime,
    require(name) {
      if(!(name in dependencies)) throw Error('Unexpected dependency: '+name);
      return dependencies[name];
    }
  });
  return exports;
}

test('authenticated free translation handles several batches and rejects abuse', async()=>{
  let signedIn=true,throttled=false,providerCalls=0;
  const contexts=[];
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
      const {segments,context}=JSON.parse(req.messages[1].content);
      contexts.push(context);
      return {text:JSON.stringify(segments.map(segment=>({id:segment.id,text:'Translated'})))};
    }}
  });
  const run=(id,allowedOrigin=true,context)=>POST({allowedOrigin,headers:new Headers(),input:{source:'auto',target:'en',segments:[{id,text:'测试'}],context}});
  assert.equal((await run('s0',false)).status,403);
  signedIn=false;
  assert.equal((await run('s0')).status,401);
  signedIn=true;
  for(const id of ['s0','s30']){
    const result=await run(id,true,{before:'前文',after:'后文'});
    assert.equal(result.status,200);
    assert.equal(result.body.billing,'free');
    assert.equal(result.body.segments[0].id,id);
  }
  assert.deepEqual(contexts,[{before:'前文',after:'后文'},{before:'前文',after:'后文'}]);
  assert.equal((await run('s60',true,{before:'界'.repeat(1201),after:''})).status,400);
  throttled=true;
  assert.equal((await run('s60')).status,429);
  assert.equal(providerCalls,2);
});

test('an incomplete translation uses the next provider without the streaming first-token timer', async()=>{
  const contract=compile('../lib/tools/document-translation-contract.ts');
  const providers=['primary','backup'].map((id,priority)=>({
    id,priority,wire:'openai',tasks:['knowledge'],canaryPercent:100,dailyShare:1,
    quality:1,speed:1,model:'test-model',apiKey:'fixture',baseUrl:'https://'+id+'.example.invalid',
  }));
  const timers=[], affinities=[];
  const {runExperienceText}=compile('../lib/sasi/experience/free-text-router.ts',{
    'server-only':{},
    './free-provider-config':{experienceProviders:()=>providers},
    './provider-state':{providerStates:async()=>({}),recordProviderRun:async()=>{}},
    './session-affinity':{getSessionAffinity:async()=>null,setSessionAffinity:async(_user,_session,id)=>affinities.push(id)},
    './canary':{canaryAllowed:()=>true},
  },{
    AbortController,
    setTimeout:(_callback,delay)=>timers.push(delay),
    clearTimeout:()=>{},
    fetch:async url=>({ok:true,json:async()=>({choices:[{message:{
      content:url.includes('primary')?'[]':'[{"id":"s0","text":"Complete translation"}]',
    }}]})}),
  });
  const result=await runExperienceText({
    region:'cn',task:'knowledge',userId:'fixture',sessionKey:'document-translate',
    messages:[{role:'user',content:'测试'}],
    validateText:text=>contract.parseTranslatedSegments(text,[{id:'s0',text:'测试'}]),
  });
  assert.equal(result.providerId,'backup');
  assert.equal(result.attempts,2);
  assert.deepEqual(affinities,['backup']);
  assert.deepEqual(timers,[60000,60000]);
});

test('free acceptance allows repeated document uploads without allocating a daily use',async()=>{
  const dependencies={'./free-acceptance':{isFreeLocalAcceptanceTool:()=>false}};
  const runtime=free=>({
    process:{env:{NEXT_PUBLIC_TOOL_PASS_ENFORCED:'true',NEXT_PUBLIC_TOOL_FREE_ACCEPTANCE:free}},
    fetch:async()=>({ok:false,json:async()=>({error:'DAILY_TOOL_FREE_USED'})}),
  });
  const free=compile('../lib/tools/commerce/tool-start-client.ts',dependencies,runtime('true'));
  for(const requestId of ['first','second']){
    const result=await free.claimToolStart('document-translate',1,requestId);
    assert.equal(result.ok,true);
    assert.equal(result.requestId,requestId);
  }
  const normal=compile('../lib/tools/commerce/tool-start-client.ts',dependencies,runtime('false'));
  await assert.rejects(normal.claimToolStart('document-translate',1,'normal'),/DAILY_TOOL_FREE_USED/);
});
