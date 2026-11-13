import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {passQuote,toolPassClassification,passContractReady,PASS_UUID} from "../lib/tools/commerce/tool-pass-v2.mjs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const data=JSON.parse(read("config/tool-pass-offers.v2.json"));
const sql=read("docs/commerce/tool-pass-v2-unapplied-database-draft.sql");

test("agreed seven-day/month/quarter/year prices are distinct CNY and USD minor units",()=>{
 const expected=[["tools_7d",7,2900],["tools_30d",30,9900],["tools_90d",90,26900],["tools_365d",365,89900]];
 assert.equal(data.plans.length,4);
 for(const [sku,days,minor] of expected){
  for(const c of ["CNY","USD"]){
   const q=passQuote(data,sku,c);
   assert.equal(q?.days,days);
   assert.equal(q?.amountMinor,minor);
   assert.equal(q?.automaticRenewal,false);
  }
 }
 for(const c of ["GBP","eur",null,""])assert.equal(passQuote(data,"tools_7d",c),null);
 for(const sku of ["sasi-video-generate","tools_unlimited","",null])assert.equal(passQuote(data,sku,"CNY"),null);
});
test("never activate an incomplete commercial offer or market it as live unlimited",()=>{
 assert.equal(data.status,"ENGINEERING_NOT_LIVE");
 assert.equal(data.active,false);
 assert.equal(passContractReady(data),false);
 assert.equal(data.free_policy.period,"lifetime");
 assert.equal(data.free_policy.limit,1);
 assert.equal(data.free_policy.upload_counts_without_export,true);
 assert.equal(data.renewal,"manual_only");
});
test("124 actual practical tool candidates are partitioned; SASI remains separately metered",()=>{
 const ok=new Set(data.eligible_candidate_tool_ids),review=new Set(data.further_review_tool_ids);
 assert.equal(ok.size,103);
 assert.equal(review.size,21);
 assert.equal(ok.size+review.size,124);
 for(const id of ok)assert.equal(toolPassClassification(data,id),"locally_eligible");
 for(const id of review)assert.equal(toolPassClassification(data,id),"provider_or_runtime_review");
 for(const id of ok)assert(!review.has(id),"candidate must belong to exactly one group: "+id);
 for(const id of ["sasi-video-generate","sasi-deep-reason","metered-tool-export","wrong_tool","","__proto__"])
  assert.equal(toolPassClassification(data,id),"unknown");
});
test("database draft requires idempotent charges, first-use dual-uniqueness and service-only RPC",()=>{
 for(const name of ["purchase_tool_pass_v2","claim_tool_pass_use_v2","charge_sasi_usage_v49","tool_pass_free_account_v2","tool_pass_free_ip_v2","pg_advisory_xact_lock","enable row level security"])
  assert(sql.includes(name),name);
 for(const sku of data.plans)assert(sql.includes("'"+sku.sku+"'"));
 for(const id of data.eligible_candidate_tool_ids)assert(sql.includes("('"+id+"','2026-11-05')"));
 assert(sql.includes("to service_role"));
 assert(!/grant execute[\s\S]{0,100}to (anon|authenticated)/i.test(sql));
 assert(sql.includes("ORPHANED_CHARGE_REFERENCE"));
 assert(sql.includes("FREE_USED_PASS_REQUIRED"));
});
test("UUID and unknown tool validation cannot treat freeform client text as an authorization",()=>{
 assert(PASS_UUID.test("9c75db7a-1173-4e37-904e-f9a2b7035c92"));
 for(const s of ["none","111111","a-b-c","00000000-0000-0000-0000-000000000000"])
  assert(!PASS_UUID.test(s));
});

test("legacy free-entitlement secret handling fails closed rather than using a public literal",()=>{
 const code=read("lib/tools/commerce/free-entitlement.ts");
 assert(code.includes('ENTITLEMENT_HASH_SECRET_MISSING'));
 assert(code.includes('clientIp==="unknown"'));
 assert(!code.includes('||"lingxifield"'));
 assert(!code.includes("||'lingxifield'"));
});
test("new tool-pass routes are disabled until environment and source flags agree",()=>{
 for(const route of ["quote","purchase","claim"]){
  const code=read("app/api/tools/pass/"+route+"/route.ts");
  assert(code.includes('LINGXIFIELD_TOOL_PASS_ENABLED'));
  assert(code.includes('!offers.active'));
  assert(code.includes('TOOL_PASS_NOT_LIVE'));
 }
});

test("coverage matches all existing main practical-tool registries, including one-word OCR",()=>{
 const advanced=read("lib/tools/advanced-catalog.ts");
 const metered=read("lib/tools/commerce/metered-catalog.ts");
 const paid=read("lib/tools/paid-catalog.ts");
 const advancedIds=[...advanced.matchAll(/href:\s*['"]\/tools\/([^'"?/#]+)[^'"]*['"]/g)].map(m=>m[1]);
 const meterBlock=metered.match(/export const METERED_TOOL_IDS=\[([\s\S]*?)\] as const/);
 assert(meterBlock);
 const meteredIds=[...meterBlock[1].matchAll(/["']([^"']+)["']/g)].map(m=>m[1]);
 const paidIds=[...paid.matchAll(/^\s*"([^"]+)",/gm)].map(m=>m[1]).filter(id=>!id.startsWith("sasi-")&&id!=="metered-tool-export");
 const source=new Set([...advancedIds,...meteredIds,...paidIds]);
 const covered=new Set([...data.eligible_candidate_tool_ids,...data.further_review_tool_ids]);
 assert(source.has("ocr"),"OCR must be available for first-use policy");
 assert.deepEqual([...covered].sort(),[...source].sort(),"Added/removed real tool ID needs a policy classification");
});

test("generic file workbench checks entitlement BEFORE processing; export is not the charge boundary",()=>{
 const code=read("components/tools/ToolWorkbench.tsx");
 const start=code.indexOf("authorizeToolPassStart(tool.slug,crypto.randomUUID())");
 const process=code.indexOf("const out = await runFileTool(tool, files, {");
 assert(start>=0&&process>=0&&start<process,"processing started before first-use entitlement claim");
 const client=read("lib/tools/commerce/tool-pass-start-client.ts");
 assert(client.includes('NEXT_PUBLIC_LINGXIFIELD_TOOL_PASS_ENABLED'));
 assert(client.includes('return {ok:true,reason:"legacy"}'));
 assert(client.includes('/api/tools/pass/claim'));
});
test("all nine public UI languages have pass copy and nonrenewal disclosure",()=>{
 const i18n=read("lib/tools/commerce/tool-pass-i18n.ts");
 for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"])
  assert(i18n.includes(" "+lang+":{"),"missing "+lang+" tool pass UI");
 for(const key of ["firstFree","useStarts","noAutoRenew","separateCost"])
  assert(i18n.includes(key+":"),"missing disclosure "+key);
});

test("tool pass purchase UI is hidden and noindexed until safety gates are enabled",()=>{
 const page=read("app/tools/pass/page.tsx");
 const ui=read("components/tools/ToolPassOffers.tsx");
 assert(page.includes('notFound()'));
 assert(page.includes('LINGXIFIELD_TOOL_PASS_ENABLED'));
 assert(page.includes('!offers.active'));
 assert(page.includes('index:false'));
 assert(ui.includes('requestId:crypto.randomUUID()'));
 assert(ui.includes('credentials:"same-origin"'));
 assert(ui.includes('aria-live="polite"'));
 assert(ui.includes('disabled={Boolean(pending)}'));
});

test("pass status exposes only the authenticated user's own verified entitlement state",()=>{
 const code=read("app/api/tools/pass/status/route.ts");
 assert(code.includes('LINGXIFIELD_TOOL_PASS_ENABLED'));
 assert(code.includes('!offers.active'));
 assert(code.includes('.auth.getUser()'));
 assert(code.includes('.eq("user_id",user.id)'));
 assert(code.includes('o.state==="active"'));
 assert(code.includes('Date.parse(o.ends_at)>now'));
 assert(code.includes('Cache-Control":"private, no-store'));
 assert(!code.includes('select("*")'));
 assert(!code.includes('service_role'));
});

test("refunded entitlements and old operation receipts cannot silently regain paid access",()=>{
 const sql=read("docs/commerce/tool-pass-v2-unapplied-database-draft.sql");
 const smoke=read("tests/sql/tool-pass-v2-smoke.sql");
 for(const code of ["PASS_NOT_ACTIVE","PASS_EXPIRED_OR_REVOKED","OPERATION_RECEIPT_EXPIRED"])
  assert(sql.includes("'"+code+"'")&&smoke.includes("'"+code+"'"),code);
 assert(sql.includes("interval '10 minutes'"));
 assert(smoke.includes("update public.tool_pass_orders_v2 set state='refunded'"));
});

test("no partial checkout can launch merely by toggling one environment/source flag",()=>{
 assert.equal(passContractReady({...data,active:true}),false);
 assert.equal(passContractReady({...data,active:true,status:"PRODUCTION_VERIFIED"}),false);
 assert.equal(passContractReady({...data,active:true,status:"PRODUCTION_VERIFIED",schema_applied_verified:true,refund_verified:true,not_validated:[]}),false);
 const required=["claim","purchase","quote","status"];
 for(const name of required){
  const route=read("app/api/tools/pass/"+name+"/route.ts");
  assert(route.includes("passContractReady(offers)"),"missing final release gate on "+name);
 }
});

test("original two-wallet debits and refundable principal are captured before granting purchases",()=>{
 const sql=read("docs/commerce/tool-pass-v2-unapplied-database-draft.sql");
 const stub=read("tests/sql/tool-pass-v2-stub.sql");
 const smoke=read("tests/sql/tool-pass-v2-smoke.sql");
 for(const name of ["active_source_minor","legacy_source_minor","active_refundable_source_minor","legacy_refundable_source_minor"])
  assert(sql.includes(name)&&smoke.includes(name),"source wallet metadata missing: "+name);
 for(const name of ["sasi_wallets","ai_wallets","sasi_usd_wallets","ai_usd_wallets"])
  assert(sql.includes("public."+name+" where user_id=p_user_id for update"),"purchase does not lock original source: "+name);
 assert(sql.includes("TOOL_PASS_REFUNDABLE_SOURCE_MISMATCH"));
 assert(sql.includes("TOOL_PASS_SOURCE_SPLIT_MISMATCH"));
 assert(stub.includes("refundable_points")&&stub.includes("refundable_fen")&&stub.includes("refundable_cents"));
 assert(smoke.includes("USD_REFUNDABLE_SNAPSHOT_BAD"));
});

test("paid operations are bound to a single concrete order even after replacement purchases",()=>{
 const sql=read("docs/commerce/tool-pass-v2-unapplied-database-draft.sql");
 const smoke=read("tests/sql/tool-pass-v2-smoke.sql");
 assert(sql.includes("pass_order_id uuid references public.tool_pass_orders_v2(request_id)"));
 assert(sql.includes("pass_operation_source_check"));
 assert(sql.includes("request_id=previous.pass_order_id"));
 assert(sql.includes("'passOrderId',previous.pass_order_id"));
 assert(sql.includes("pass_order_id)"));
 assert(smoke.includes("PAID_USE_NOT_BOUND_TO_EXACT_ORDER"));
 assert(smoke.includes("REFUNDED_OLD_RECEIPT_ACCEPTED_VIA_NEW_PASS"));
});
test("unused-pass wallet refund is an atomic non-public original-source reversal, not a PSP refund",()=>{
 const sql=read("docs/commerce/tool-pass-v2-unapplied-wallet-refund.sql");
 const smoke=read("tests/sql/tool-pass-v2-refund-smoke.sql");
 for(const step of [
  "public.refund_unused_tool_pass_wallet_v2",
  "public.sasi_credit_ledger","public.ai_wallet_ledger",
  "public.sasi_usd_wallet_ledger","public.ai_usd_wallet_ledger",
  "SOURCE_LEDGER_MISMATCH","PASS_ALREADY_USED",
  "STACKED_PASS_REQUIRES_REVIEW",
  "tool_pass_wallet_refunds_v2","pg_advisory_xact_lock",
  "service_role","original_wallets_only"
 ])assert(sql.includes(step),"missing refund invariants: "+step);
 for(const assertion of [
  "CNY_WALLET_OR_PRINCIPAL_NOT_RESTORED",
  "USD_WALLET_OR_PRINCIPAL_NOT_RESTORED",
  "DUPLICATE_REFUND_JOURNAL",
  "USED_PASS_REFUNDED",
  "TAMPERED_LEDGER_REFUNDED",
  "PUBLIC_REFUND_RPC_EXPOSED",
  "STACKED_FIRST_PASS_REFUND_DID_NOT_FAIL",
 ])assert(smoke.includes(assertion),"missing refund regression: "+assertion);
 assert(sql.includes("revoke all on function public.refund_unused_tool_pass_wallet_v2"));
 assert(!/grant execute on function public\.refund_unused_tool_pass_wallet_v2[\s\S]{0,130}to (anon|authenticated)\s*;/i.test(sql));
 assert(sql.trim().startsWith("-- Draft only."));
});
