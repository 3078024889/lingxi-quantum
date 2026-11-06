import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("legacy paid quote cannot fund unlimited new vendor calls",()=>{
 const sql=read("supabase/migrations/20261106070000_tool_legacy_media_paid_stage_caps.sql");
 const testSql=read("tests/sql/tool-pass-legacy-media-integrity.sql");
 for(const signal of ["lingxi_claim_legacy_media_stage",
  "where id=p_quote_id for update","q.user_id<>p_user_id","q.status<>'paid'",
  "max_units:=ceil(q.quantity)","LEGACY_MEDIA_PAID_ALLOWANCE_EXHAUSTED",
  "primary key(quote_id,stage,operation_id)","p_characters","revoke all on function"])
  assert(sql.includes(signal),"missing historical quote guard "+signal);
 for(const signal of ["REPEATED_PAID_QUOTE_UNLIMITED","CROSS_ACCOUNT_QUOTE_BYPASS",
  "UNPAID_QUOTE_BYPASS","TRANSLATION_CHAR_BUDGET_BYPASS",
  "TTS_CHAR_BUDGET_BYPASS","PAID_MEDIA_RPC_PUBLICLY_EXPOSED"])
  assert(testSql.includes(signal),"missing quote abuse regression "+signal);
});
test("historical media tasks validate paid quote and consume bounded stage before provider calls",()=>{
 const guards=read("lib/tools/media/paid-guard.ts");
 assert(guards.includes('.rpc("lingxi_claim_legacy_media_stage"'));
 assert(guards.includes('if(claimed.alreadyStarted)'));
 for(const [route,stage,provider] of [
  ["transcribe","media-transcribe","await transcribeAudioRemote("],
  ["translate","media-translate","await translateTextRemote("],
  ["tts","media-tts","await synthesizeRemote("]
 ]){
  const code=read("app/api/tools/media/"+route+"/route.ts");
  assert(code.includes('stage.mode==="legacy"'),route+" lost legacy delivery branch");
  assert(code.includes('stage:"'+stage+'"'),route+" missing source stage");
  assert(code.includes('operationId:'),route+" missing idempotency ID");
  assert(code.indexOf("requirePaidMediaQuote(quoteId,allowed,")<code.indexOf(provider),
   route+" calls paid provider without quote-stage accounting");
 }
});
