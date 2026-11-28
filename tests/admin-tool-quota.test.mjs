import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {runInNewContext} from 'node:vm';

test('tool allowance derives account identity from auth, ignoring request admin and limit fields',async()=>{
 const source=readFileSync(new URL('../app/api/tools/access/route.ts',import.meta.url),'utf8');
 const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const calls=[];const exports={};
 const dependencies={
  'next/server':{NextResponse:{json:(body,options)=>({body,...options,cookies:{set(){}}})}},
  '@/lib/tools/commerce/tool-device':{TOOL_DEVICE_COOKIE:'lx-tool-device',readToolDevice:()=> 'a'.repeat(64),newToolDevice:()=>{throw Error('unexpected cookie creation')}},
  '@/lib/tools/core-workspaces':{quotaToolSlug:s=>s},
  '@/lib/supabase/server':{createClient:()=>({auth:{getUser:async()=>({data:{user:{id:'server-confirmed-user'}}})}})},
  '@/lib/supabase/admin':{createAdminClient:()=>({rpc:async(name,args)=>{calls.push({name,args});return{data:{ok:true,allowed:true,dailyFreeLimit:1,dailyFreeRemaining:1}}}})},
  '@/lib/tools/registry':{getTool:()=>({status:'live'})},
  '@/lib/tools/platform/tool-registry':{publicToolBySlug:()=>null},
  '@/lib/sasi/request-security':{isSameOriginMutation:()=>true},
  '@/lib/security/abuse-guard':{enforceAbuseGuard:async()=>({ok:true})},
  '@/lib/tools/commerce/tool-server-receipt':{toolPassBackendReady:()=>true},
 };
 runInNewContext(output,{exports,URL,console,process:{env:{}},require:name=>{assert(name in dependencies,'Unexpected dependency '+name);return dependencies[name]}});
 const req={url:'https://example.invalid/api/tools/access?toolSlug=pdf-workspace&admin=true&dailyLimit=999',cookies:{get:()=>({value:'signed'})},headers:{get:()=>null},json:async()=>({toolSlug:'pdf-workspace',units:1,requestId:'11111111-1111-4111-8111-111111111111',userId:'attacker-admin',admin:true,dailyLimit:999})};
 await exports.POST(req);await exports.GET(req);
 assert.equal(calls.length,2);
 for(const call of calls){assert.equal(call.args.p_user_id,'server-confirmed-user');assert.equal(call.args.p_device_hash,'a'.repeat(64));assert.equal(call.args.p_tool_slug,'pdf-workspace');assert(!('p_limit' in call.args));assert(!('p_admin' in call.args))}
 assert.equal(calls[1].name,'lingxi_tool_use_status_device');
});
