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

test('retired translation endpoint never invokes a model for old clients',async()=>{
 const {POST}=compile('../app/api/tools/document-translate/route.ts',{
  'next/server':{NextResponse:{json:(body,options)=>({body,...options})}},
 });
 for(let i=0;i<3;i++){
  const result=await POST();assert.equal(result.status,410);
  assert.equal(result.body.error,'LOCAL_PROCESSING_REQUIRED');
 }
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

test('free acceptance allows repeated document and subtitle uploads without allocating a daily use',async()=>{
  const runtime=free=>({
    process:{env:{NEXT_PUBLIC_TOOL_PASS_ENFORCED:'true',NEXT_PUBLIC_TOOL_FREE_ACCEPTANCE:free}},
    fetch:async()=>({ok:false,json:async()=>({error:'DAILY_TOOL_FREE_USED'})}),
  });
  function client(flag){
    const env=runtime(flag);
    const acceptance=compile('../lib/tools/commerce/free-acceptance.ts',{
      '../advanced-catalog':{ADVANCED_TOOLS:[]},'../registry':{getTool:()=>undefined},
    },env);
    return compile('../lib/tools/commerce/tool-start-client.ts',{'./free-acceptance':acceptance},env);
  }
  const free=client('true');
  for(const tool of ['document-translate','subtitle-translate']){
    for(const requestId of ['first','second']){
      const result=await free.claimToolStart(tool,1,requestId);
      assert.equal(result.ok,true);
      assert.equal(result.requestId,requestId);
    }
  }
  const normal=client('false');
  await assert.rejects(normal.claimToolStart('document-translate',1,'normal'),/DAILY_TOOL_FREE_USED/);
});

test('local translation acceptance includes saving and sharing, while normal export remains gated',async()=>{
 for(const flag of ['true','false']){
  const runtime={process:{env:{NEXT_PUBLIC_TOOL_FREE_ACCEPTANCE:flag}}};
  const acceptance=compile('../lib/tools/commerce/free-acceptance.ts',{'../advanced-catalog':{ADVANCED_TOOLS:[]},'../registry':{getTool:()=>undefined}},runtime);
  const client=compile('../lib/tools/commerce/export-access-client.ts',{
   './free-acceptance':acceptance,'./metered-catalog':{isMeteredTool:()=>true,isMeteredOperationTool:()=>false},
   './tool-start-client':{TOOL_PASS_ENFORCED:false},'./tool-route-slug':{toolSlugFromPathname:path=>path.split('/').pop()},
  },{...runtime,location:{pathname:'/tools/document-translate'},WeakMap,crypto:{randomUUID:()=> 'fixture'}});
  const blob={};
  if(flag==='true'){
   await client.ensureToolExportAccess(blob,'translation.docx','save');
   await client.ensureToolExportAccess(blob,'translation.docx','share');
   assert.equal(client.isExportAccessGranted(blob),true);
  }else{
   assert.equal(client.isExportAccessGranted(blob),false);
   await assert.rejects(client.ensureToolExportAccess(blob,'translation.docx'),/EXPORT_ACCESS_NOT_READY/);
  }
 }
});
