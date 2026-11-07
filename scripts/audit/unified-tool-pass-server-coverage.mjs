#!/usr/bin/env node
/** Release-blocking SOURCE audit for remote execution and old paid endpoints.
 * Static evidence cannot replace API replay, payment, and mobile-browser tests.
 * A safely blocked feature is NOT counted as a usable completed integration.
 */
import {existsSync,readFileSync} from "node:fs";
import {join,resolve} from "node:path";
const root=resolve(process.cwd());
const read=p=>readFileSync(join(root,p),"utf8");
const CRITICAL={
 "document-translate":"document-translate",
 "document/normalize":"office-conversion",
 "document/ticket":"office-conversion",
 "media-import":"media-import",
 "media/transcribe":"video-transcription",
 "media/translate":"video-translate",
 "media/tts":"video-dubbing",
 "media/free-dubbing-preview":"video-dubbing",
 "promotion-source":"url-to-video",
 "website-diagnose":"website-diagnose",
 "food/analysis":"food-calorie",
 "food/analysis/[id]":"food-calorie",
 "food/session":"food-calorie",
 "food/calculate":"food-calorie",
 "food/manual-calculate":"food-calorie",
 "temp-mail/create":"temp-mail",
 "temp-mail/batch":"temp-mail",
 "burn-after-read/create":"burn-after-read",
 "burn-after-read/file/prepare":"burn-after-read",
 "burn-after-read/file/complete":"burn-after-read",
 "mobile-file":"mobile-file"
};
const REMOTE_CALL={
 "food/analysis":"await resolveFoodMeal(",
 "document-translate":"await resilientText(",
 "document/normalize":"await convertDocumentToPdf(",
 "document/ticket":"const gateway=safeGateway(",
 "media-import":"await fetchMediaOrResolveShare(",
 "media/transcribe":"await transcribeAudioRemote(",
 "media/translate":"await translateTextRemote(",
 "media/tts":"await synthesizeRemote(",
 "media/free-dubbing-preview":"await transcribeAudioRemote(",
 "website-diagnose":"dns.resolve4("
};
const SAFE_BLOCKED={};
const stageGate=read("lib/tools/commerce/tool-stage-gate.ts");
const stageSql=read("supabase/migrations/20261106060000_tool_pass_order_bound_stages.sql");
const passMailSql=read("supabase/migrations/20261106080000_tool_pass_mail_batch_atomic.sql");
const passMailUi=read("components/tools/TempMailWorkbench.tsx");
const trustedStageGate=stageGate.includes('toolPassCutoverRequested()')
 && stageGate.includes('.rpc("lingxi_redeem_tool_stage"')
 && stageGate.includes('if(data.alreadyStarted)')
 && stageGate.includes('return {ok:false,error:"TOOL_STAGE_ALREADY_STARTED"');
const ticketServer=read("app/api/tools/document/ticket/route.ts");
const gatewayServer=read("infra/document-converter/gateway/server.mjs");
const gatewayPaidGuard=ticketServer.includes("!toolPassCutoverRequested()&&gateway&&secret.length>=32")
 && gatewayServer.includes("const usedNonces=new Map()");
const stageMigration=stageSql.includes('pass_id uuid references public.lingxi_tool_passes(id)')
 && stageSql.includes('p.id=v_use.pass_id')
 && stageSql.includes('primary key(request_id,stage)')
 && stageSql.includes('grant execute on function public.lingxi_redeem_tool_stage');
const rows=Object.entries(CRITICAL).map(([route,tool])=>{
 const file="app/api/tools/"+route+"/route.ts";
 if(!existsSync(join(root,file)))return {route,tool,state:"UNSAFE",reason:"MISSING_ROUTE"};
 const code=read(file);
 if(!/export\s+(?:async\s+)?function\s+POST\s*\(/.test(code))
  return {route,tool,state:"UNSAFE",reason:"NO_POST"};
 if(route in SAFE_BLOCKED){
  const marker=SAFE_BLOCKED[route];
  const index=code.indexOf(marker);
  const start=code.indexOf('if(toolPassCutoverRequested())');
  const firstCost=[code.indexOf('const admin=createAdminClient()',start),
   code.indexOf('const key=newBurnObjectKey(',start)]
   .filter(x=>x>=0).sort((a,b)=>a-b)[0]??-1;
  if(start>=0&&index>start&&code.slice(start,index+240).includes('status:503')
   &&(firstCost<0||start<firstCost))
   return {route,tool,state:"BLOCKED",reason:"PASS_WORKFLOW_NOT_INTEGRATED"};
  return {route,tool,state:"UNSAFE",reason:"BLOCKER_MISSING_OR_AFTER_COST"};
 }
 if(route==="burn-after-read/file/prepare"){
  const sql=read("supabase/migrations/20261106100000_tool_pass_burn_file_atomic.sql");
  const tests=read("tests/sql/tool-pass-burn-file-atomic-integrity.sql");
  const ui=read("components/tools/BurnAfterReadWorkbench.tsx");
  const complete=read("app/api/tools/burn-after-read/file/complete/route.ts");
  const ok=code.includes('toolPassBackendReady()')
   &&code.includes('.rpc("lingxi_prepare_pass_burn_file_v1"')
   &&code.includes('if(!UUID.test(requestId)')
   &&code.includes('newBurnObjectKey(noteId')
   &&code.includes('PASS_BURN_FILE_RESPONSE_INVALID')
   &&code.includes('quoteId')
   &&sql.includes('pg_advisory_xact_lock')
   &&sql.includes('v_use.units<>v_len')
   &&sql.includes("'burn-file-prepare'")
   &&sql.includes("PASS_BURN_FILE_REBIND")
   &&sql.includes("revoke all on function public.lingxi_prepare_pass_burn_file_v1")
   &&ui.includes("uploadPassShare")
   &&ui.includes('claimToolStart("burn-after-read",x.length)')
   &&ui.includes('operationId:receiptId')
   &&complete.includes('note.access_request_id')
   &&complete.includes('.rpc("lingxi_redeem_tool_use"')
   &&tests.includes("PASS_BURN_FILE_CROSS_USER_REPLAY")
   &&tests.includes("PASS_BURN_UNCLAIMED_RECEIPT_ALLOWED");
  return {route,tool,state:ok?"GUARDED":"UNSAFE",
   reason:ok?"ATOMIC_ENCRYPTED_FILE_NOTE_AND_RETRYABLE_R2_SESSION":"FILE_NOTE_OR_CLIENT_BINDING_UNVERIFIED"};
 }
 if(route==="mobile-file"){
  const sql=read("supabase/migrations/20261106090000_tool_pass_mobile_file_atomic.sql");
  const cli=read("lib/tools/shared/download.ts");
  const claims=read("lib/tools/commerce/tool-start-client.ts");
  const test=read("tests/sql/tool-pass-mobile-file-atomic-integrity.sql");
  const ok=code.includes('toolPassBackendReady()')
   &&code.includes('.rpc("lingxi_prepare_pass_mobile_file_v1"')
   &&code.includes('if(!UUID.test(requestId)')
   &&code.includes('newBurnObjectKey(`tool-${user.id}`')
   &&code.includes('if(!actualKey.startsWith(')
   &&sql.includes('pg_advisory_xact_lock')
   &&sql.includes("'mobile-file'")
   &&sql.includes('MOBILE_FILE_IDEMPOTENCY_CONFLICT')
   &&sql.includes('MOBILE_FILE_STAGE_INCONSISTENT')
   &&sql.includes('v_existing_op')
   &&sql.includes('revoke all on function public.lingxi_prepare_pass_mobile_file_v1')
   &&cli.includes('latestConfirmedToolClaim(toolSlug)')
   &&cli.includes('MOBILE_FILE_REQUIRES_PRIOR_TOOL_START')
   &&claims.includes('lastClaimBySlug.set(')
   &&test.includes('MOBILE_CROSS_USER_RETRY_LEAK')
   &&test.includes('UNCREDITED_R2_SESSION_CREATED');
  return {route,tool,state:ok?"GUARDED":"UNSAFE",
   reason:ok?"ATOMIC_OWNER_BOUND_SECONDARY_MOBILE_HANDOFF":"MOBILE_SESSION_BINDING_UNVERIFIED"};
 }
 if(route==="temp-mail/batch"){
  const ok=code.includes('if(toolPassCutoverRequested()&&!quoteId)')
   &&code.includes('if(!toolPassBackendReady())')
   &&code.includes('.rpc("lingxi_create_pass_mail_batch"')
   &&code.includes("accessRequestId")
   &&passMailSql.includes('v_source.units<>p_count')
   &&passMailSql.includes("v_source.access_kind<>'pass'")
   &&passMailSql.includes("PASS_MAIL_DAILY_LIMIT")
   &&passMailSql.includes("v_stage:=public.lingxi_redeem_tool_stage(")
   &&passMailSql.includes("primary key references public.lingxi_tool_use_events")
   &&passMailUi.includes('claimToolStart("temp-mail",batchCount,requestId)');
  return {route,tool,state:ok?"GUARDED":"UNSAFE",reason:ok?"ATOMIC_PASS_BATCH_AND_LEGACY_DELIVERY":"BATCH_QUOTA_OR_IDEMPOTENCY_UNVERIFIED"};
 }
 if(route==="food/manual-calculate"){
  const retired=code.includes("FOOD_ANALYSIS_REQUIRED")&&code.includes("status:410")
    &&!code.includes("calculate_food_paid_bound_v18");
  return {route,tool,state:retired?"RETIRED":"UNSAFE",reason:retired?"OLD_CALCULATOR_DISABLED":"LEGACY_CALCULATOR_REACHABLE"};
 }
 if(route==="food/calculate"){
  const start=code.indexOf("if(toolPassCutoverRequested())");
  const old=code.indexOf("recoverToolQuotePayment(");
  const retired=start>=0&&old>start&&code.includes("FOOD_ANALYSIS_REQUIRED")
    &&code.slice(start,old).includes("status:410");
  return {route,tool,state:retired?"RETIRED":"UNSAFE",reason:retired?"OLD_CALCULATOR_DISABLED_IN_PASS_MODE":"LEGACY_CALCULATOR_REACHABLE"};
 }
 if(route==="burn-after-read/file/complete"){
  const owner=code.includes('.eq("owner_user_id",user.id)')||code.includes(".eq('owner_user_id',user.id)");
  const ownershipBeforeR2=code.indexOf("owner_user_id")>=0&&code.indexOf("owner_user_id")<code.indexOf("await r2Head(");
  const verified=code.includes('note.access_request_id')&&
   code.includes('.rpc("lingxi_redeem_tool_use"');
  return {route,tool,state:owner&&ownershipBeforeR2&&verified?"CONTINUATION":"UNSAFE",
   reason:owner&&ownershipBeforeR2&&verified?"OWNED_AND_PASS_REVOCATION_CHECKED":"UNVERIFIED_PASS_CONTINUATION"};
 }
 if(route in REMOTE_CALL){
  const start=code.indexOf("await authorizeToolPassStage(");
  const cost=code.indexOf(REMOTE_CALL[route]);
  const okay=trustedStageGate&&stageMigration&&
   (route!=="document/ticket"||gatewayPaidGuard)&&start>=0&&cost>start
   &&code.slice(start,cost).includes("if(!stage.ok)");
  return {route,tool,state:okay?"GUARDED":"UNSAFE",
   reason:okay?"ONE_TIME_BACKEND_STAGE":"NO_ONE_TIME_STAGE_BEFORE_REMOTE_COST"};
 }
 // The already-integrated shared-analysis, private-mail and burn-note APIs
 // call the RPC which is already covered by the isolated SQL acceptance suite.
 const ready=code.includes("toolPassBackendReady");
 const proof=/redeemToolStart\s*\(|lingxi_consume_food_pass_v1|lingxi_create_pass_burn_note/.test(code);
 return {route,tool,state:ready&&proof?"GUARDED":"UNSAFE",
  reason:ready&&proof?"EXISTING_BACKEND_PROOF":"NO_TASK_BOUND_PROOF"};
});
const counts=Object.fromEntries(["GUARDED","RETIRED","CONTINUATION","BLOCKED","UNSAFE"]
 .map(key=>[key,rows.filter(r=>r.state===key).length]));
const unfinished=rows.filter(r=>r.state==="BLOCKED"||r.state==="UNSAFE");
const output={criticalRoutes:rows.length,counts,unfinished,pass:unfinished.length===0,
 caution:"BLOCKED is safe against NEW paid access but unavailable to unified-pass customers, NOT a release success. Static evidence requires E2E replay/legacy-rights testing."};
console.log(JSON.stringify(output,null,2));
if(unfinished.length)process.exitCode=1;
