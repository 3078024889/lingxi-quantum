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
test("mobile and burn-file R2 sessions require atomic receipt-bound creation",()=>{
 const mobile=read("app/api/tools/mobile-file/route.ts");
 const burn=read("app/api/tools/burn-after-read/file/prepare/route.ts");
 const complete=read("app/api/tools/burn-after-read/file/complete/route.ts");
 const mobileSql=read("supabase/migrations/20261106090000_tool_pass_mobile_file_atomic.sql");
 const burnSql=read("supabase/migrations/20261106100000_tool_pass_burn_file_atomic.sql");
 const exportClient=read("lib/tools/shared/download.ts");
 const burnClient=read("components/tools/BurnAfterReadWorkbench.tsx");
 assert(mobile.includes('.rpc("lingxi_prepare_pass_mobile_file_v1"'));
 assert(mobile.includes('if(!toolPassBackendReady())'));
 assert(mobile.indexOf('.rpc("lingxi_prepare_pass_mobile_file_v1"')<mobile.indexOf('putUrl:presignR2('),
   "mobile signed upload issued before owner/paid-task receipt");
 assert(mobileSql.includes("pg_advisory_xact_lock"));
 assert(mobileSql.includes("'mobile-file'"));
 assert(mobileSql.includes("MOBILE_FILE_IDEMPOTENCY_CONFLICT"));
 assert(exportClient.includes("latestConfirmedToolClaim(toolSlug)"));
 assert(exportClient.includes("MOBILE_FILE_REQUIRES_PRIOR_TOOL_START"));
 assert(burn.includes('.rpc("lingxi_prepare_pass_burn_file_v1"'));
 assert(burn.includes('if(!toolPassBackendReady())'));
 assert(burn.indexOf('.rpc("lingxi_prepare_pass_burn_file_v1"')<burn.indexOf('uploadUrl:data.alreadyReady?null:presignR2('),
   "private burn-file R2 token minted without atomic claim validation");
 assert(burnSql.includes("v_use.units<>v_len"));
 assert(burnSql.includes("pg_advisory_xact_lock"));
 assert(burnSql.includes("'burn-file-prepare'"));
 assert(burnSql.includes("PASS_BURN_FILE_REBIND"));
 assert(burnClient.includes("uploadPassShare"));
 assert(burnClient.includes('claimToolStart("burn-after-read",x.length)'));
 assert(complete.includes('.rpc("lingxi_redeem_tool_use"'));
 assert(complete.includes('note.access_request_id'));
 assert(complete.includes('.eq("owner_user_id",user.id)'));
 assert(complete.indexOf("owner_user_id")<complete.indexOf("await r2Head("));
 const tests=read("tests/sql/tool-pass-burn-file-atomic-integrity.sql");
 assert(tests.includes("PASS_BURN_FILE_CROSS_USER_REPLAY"));
 assert(tests.includes("PASS_BURN_UNCLAIMED_RECEIPT_ALLOWED"));
 const mobileTests=read("tests/sql/tool-pass-mobile-file-atomic-integrity.sql");
 assert(mobileTests.includes("MOBILE_CROSS_USER_RETRY_LEAK"));
 assert(mobileTests.includes("UNCREDITED_R2_SESSION_CREATED"));
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
