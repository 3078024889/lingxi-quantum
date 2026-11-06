import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const stageCases=[
 ["document-translate","await resilientText("],
 ["document/normalize","await convertDocumentToPdf("],
 ["document/ticket","const gateway=safeGateway("],
 ["media-import","await fetchMediaOrResolveShare("],
 ["media/transcribe","await transcribeAudioRemote("],
 ["media/translate","await translateTextRemote("],
 ["media/tts","await synthesizeRemote("],
 ["media/free-dubbing-preview","await transcribeAudioRemote("],
 ["website-diagnose","dns.resolve4("],
 ["food/analysis","await resolveFoodMeal("]
];
test("remote provider, signed gateway, network probe and food analysis reject unclaimed one-time stages",()=>{
 for(const [route,remote] of stageCases){
  const c=read("app/api/tools/"+route+"/route.ts");
  const grant=c.indexOf("await authorizeToolPassStage(");
  const cost=c.indexOf(remote);
  assert(grant>=0&&cost>grant,route+" remote cost occurs before server authorization");
  assert(c.slice(grant,cost).includes("if(!stage.ok)"),route+" does not fail closed");
 }
});
test("all one-time stage receipts authenticate owner and reject duplicate execution",()=>{
 const helper=read("lib/tools/commerce/tool-stage-gate.ts");
 for(const token of ['.auth.getUser()',".rpc(\"lingxi_redeem_tool_stage\"","if(data.alreadyStarted)",
   'TOOL_STAGE_ALREADY_STARTED','toolPassCutoverRequested()','TOOL_PASS_BACKEND_NOT_READY'])
  assert(helper.includes(token),"missing boundary: "+token);
 const sql=read("supabase/migrations/20261106060000_tool_pass_order_bound_stages.sql");
 for(const token of ["pass_id uuid references public.lingxi_tool_passes(id)",
 "p.id=v_use.pass_id","primary key(request_id,stage)","p_request_id uuid",
 "lingxi_capture_tool_pass_id","for each row execute function","'food-analysis'"])
  assert(sql.includes(token),"missing SQL assurance: "+token);
 const regression=read("tests/sql/tool-pass-stage-integrity.sql");
 for(const x of ["REFUNDED_PASS_RESTORED_VIA_NEW_PASS",
   "OTHER_TASK_BYPASS","FOOD_DOUBLE_ANALYSIS_ALLOWED","STAGE_OTHER_ACCOUNT_BYPASS",
   "PUBLIC_STAGE_RPC_VISIBLE"])
  assert(regression.includes(x),"missing adversarial PG test: "+x);
});
test("legacy media receipts are kept for previous purchasers until cutover",()=>{
 for(const route of ["media/transcribe","media/translate","media/tts"]){
  const c=read("app/api/tools/"+route+"/route.ts");
  assert(c.includes('stage.mode==="legacy"'),"lost legacy paid delivery: "+route);
  assert(c.includes("requirePaidMediaQuote("), "legacy quote authorization removed: "+route);
 }
 const preview=read("app/api/tools/media/free-dubbing-preview/route.ts");
 assert(preview.includes('stage.mode==="legacy"'));
 assert(preview.includes('claimFreeEntitlement('));
});
test("unsupported quote-keyed storage features fail closed in new mode, retain old records",()=>{
 const cases=[
  ["temp-mail/batch","BATCH_PASS_WORKFLOW_NOT_READY","claim_temp_mail_batch_quote"],
  ["burn-after-read/file/prepare","BURN_FILE_PASS_WORKFLOW_NOT_READY","newBurnObjectKey("],
  ["mobile-file","TEMP_FILE_PASS_WORKFLOW_NOT_READY","newBurnObjectKey("]
 ];
 for(const [route,denial,remote] of cases){
  const code=read("app/api/tools/"+route+"/route.ts");
  const gate=code.indexOf("if(toolPassCutoverRequested())");
  assert(gate>=0&&code.includes(denial),"pass cutover not safely blocked: "+route);
  assert(code.indexOf(remote)>gate,"storage created before new-pass denial: "+route);
  assert(code.slice(gate,gate+250).includes("status:503"),"not fail-closed HTTP 503: "+route);
 }
 const continuation=read("app/api/tools/burn-after-read/file/complete/route.ts");
 assert(continuation.includes('.eq("owner_user_id",user.id)'));
 assert(continuation.indexOf('owner_user_id')<continuation.indexOf("await r2Head("));
});
test("retired per-quote food calculators cannot bypass unified food analysis",()=>{
 const c=read("app/api/tools/food/calculate/route.ts");
 const cutover=c.indexOf("if(toolPassCutoverRequested())");
 assert(cutover>=0);
 assert(c.indexOf("recoverToolQuotePayment(")>cutover);
 assert(c.includes("FOOD_ANALYSIS_REQUIRED"));
 const old=read("app/api/tools/food/manual-calculate/route.ts");
 assert(old.includes("FOOD_ANALYSIS_REQUIRED"));
 assert(old.includes("status:410"));
});
test("image session shares the same operation id as food analysis and service refuses replays",()=>{
 const client=read("components/tools/FoodCalorieWorkbench.tsx");
 assert(client.includes('createFoodImageSession(files,{accessRequestId:accessRequestId.current,operationId:id})'));
 assert(client.includes("requestId:id,accessRequestId:accessRequestId.current"));
 const server=read("app/api/tools/food/analysis/route.ts");
 assert(server.includes('stage:"food-analysis"'));
 assert(server.indexOf("authorizeToolPassStage(")<server.indexOf("await resolveFoodMeal("));
});

test("a half-enabled frontend/backend can never initiate new legacy per-tool charges",()=>{
 const runtime=read("lib/tools/commerce/tool-server-receipt.ts");
 assert(runtime.includes('export function toolPassCutoverRequested()'));
 assert(runtime.includes('process.env.NEXT_PUBLIC_TOOL_PASS_ENFORCED==="true" ||'));
 assert(runtime.includes('process.env.TOOL_PASS_BACKEND_READY==="true"'));
 for(const [path,denial] of [
  ["app/api/tools/quote/route.ts","SINGLE_TOOL_CHECKOUT_RETIRED"],
  ["app/api/tools/quote/topup/route.ts","SINGLE_TOOL_TOPUP_RETIRED"],
  ["app/api/tools/pay/create/route.ts","SINGLE_TOOL_CHECKOUT_RETIRED"],
  ["app/api/tools/pricing/route.ts","SINGLE_TOOL_PRICING_RETIRED"],
  ["app/api/tools/free-export/route.ts","SINGLE_TOOL_CHECKOUT_RETIRED"],
 ]){
  const code=read(path);
  assert(code.includes("toolPassCutoverRequested()"),"partial flag bypass in "+path);
  assert(code.includes(denial),"legacy charging route not retired: "+path);
 }
 const paid=read("app/api/tools/pay/create/route.ts");
 assert(paid.indexOf('if(quote.status==="paid")')<paid.indexOf('if(toolPassCutoverRequested()'),
  "existing paid user lost receipt recovery");
 const exports=read("app/api/tools/free-export/route.ts");
 assert(exports.includes('select("id,user_id,ip_hash,tool_id")'),
  "historical export reservations cannot be owner checked");
});

test("direct Office gateway tickets stay disabled during paid cutover until nonce store is durable",()=>{
 const ticket=read("app/api/tools/document/ticket/route.ts");
 const gateway=read("infra/document-converter/gateway/server.mjs");
 assert(gateway.includes("const usedNonces=new Map()"),"gateway nonce persistence assumption changed; re-audit");
 assert(ticket.includes("!toolPassCutoverRequested()&&gateway&&secret.length>=32"),
  "non-durable gateway direct ticket is reachable by unified-paid customers");
 assert(ticket.includes('await authorizeToolPassStage('),"ticket issuance still must require an authenticated stage");
 const normal=read("app/api/tools/document/normalize/route.ts");
 assert(normal.indexOf("authorizeToolPassStage(")<normal.indexOf("await convertDocumentToPdf("));
});

test("batch mailbox pass claims exact mailbox count and creates one atomic idempotent batch",()=>{
 const code=read("app/api/tools/temp-mail/batch/route.ts");
 const sql=read("supabase/migrations/20261106080000_tool_pass_mail_batch_atomic.sql");
 const ui=read("components/tools/TempMailWorkbench.tsx");
 for(const n of [
  "p_count integer,p_entries jsonb","v_source.units<>p_count","v_source.access_kind<>'pass'",
  "PASS_MAIL_DAILY_LIMIT","PASS_MAIL_REQUEST_CONFLICT","PASS_MAIL_PAID_BATCH_REQUIRED",
  "primary key references public.lingxi_tool_use_events","v_stage:=public.lingxi_redeem_tool_stage",
  "created_at>=date_trunc"
 ])assert(sql.includes(n),"missing pass-mail batch security boundary "+n);
 assert(code.includes('.rpc("lingxi_create_pass_mail_batch"'));
 assert(code.includes('if(toolPassCutoverRequested()&&!quoteId)'));
 assert(code.includes('if(!toolPassBackendReady())'));
 assert(code.includes('if(!quoteId)return NextResponse.json({error:"PAID_BATCH_REQUIRED"'));
 assert(ui.includes('claimToolStart("temp-mail",batchCount,requestId)'));
 assert(ui.includes('sessionStorage.setItem(key'));
 for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"])
  assert(ui.includes("\n "+lang+":{"),"missing localized batch-pass UI: "+lang);
});
