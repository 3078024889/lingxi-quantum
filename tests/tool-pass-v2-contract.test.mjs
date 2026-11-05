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
test("123 actual practical tool candidates are partitioned; SASI remains separately metered",()=>{
 const ok=new Set(data.eligible_candidate_tool_ids),review=new Set(data.further_review_tool_ids);
 assert.equal(ok.size,102);
 assert.equal(review.size,21);
 assert.equal(ok.size+review.size,123);
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
