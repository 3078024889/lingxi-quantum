import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";

test("QQ free operations workbench serves readable content for all three QQ groups",async()=>{
 let callback;
 const previous=globalThis.Deno;
 globalThis.Deno={serve:fn=>{callback=fn}};
 try{
  await import("../supabase/functions/globalsiai-qq-console/index.ts");
  assert.equal(typeof callback,"function");
  const checks=[
   ["1074475201","灵犀场实用工具"],
   ["1072178710","SASI"],
   ["601549887","WB3"],
  ];
  for(const [group,keyword] of checks){
   const request=new Request(`https://example.supabase.co/functions/v1/globalsiai-qq-console?group=${group}&day=2026-11-05`);
   const response=await callback(request);
   assert.equal(response.status,200);
   assert.match(response.headers.get("content-type"),/text\/html/);
   assert.match(response.headers.get("content-security-policy"),/script-src 'nonce-/);
   assert.match(response.headers.get("x-robots-tag"),/noindex/);
   const html=await response.text();
   assert.match(html,new RegExp(group));
   assert.match(html,new RegExp(keyword));
   assert.match(html,/国际站：https:\/\/lingxifield\.com/);
   assert.match(html,/国内站：https:\/\/lingxifield\.cn/);
   assert.match(html,new RegExp(`qq_${group}_discovery`));
   assert.match(html,new RegExp(`qq_${group}_tutorial`));
   assert.match(html,/复制群公告/);
   assert.match(html,/复制今天五条/);
   assert.equal((html.match(/data-copy="[0-4]"/g)||[]).length,5);
   assert.doesNotMatch(html,/TELEGRAM_BOT_TOKEN|SUPABASE_SERVICE_ROLE_KEY|SCHEDULER_KEY_SHA256/);
   const script=html.match(/<script nonce="[^"]+">([\s\S]*?)<\/script>/)?.[1];
   assert.ok(script);
   assert.doesNotThrow(()=>new vm.Script(script));
  }
 }finally{globalThis.Deno=previous;}
});

test("QQ workbench rejects writes and does not serve unrecognised group IDs",async()=>{
 let callback;
 const prev=globalThis.Deno;
 globalThis.Deno={serve:fn=>callback=fn};
 try{
  await import("../supabase/functions/globalsiai-qq-console/index.ts");
  const denied=await callback(new Request("https://example.supabase.co/functions/v1/globalsiai-qq-console",{method:"POST"}));
  assert.equal(denied.status,405);
  const invalid=await callback(new Request("https://example.supabase.co/functions/v1/globalsiai-qq-console?group=123456789&day=2026-11-05"));
  const html=await invalid.text();
  assert.match(html,/当前群：<b>1074475201/);
  assert.doesNotMatch(html,/qq_123456789_/);
 }finally{globalThis.Deno=prev;}
});
