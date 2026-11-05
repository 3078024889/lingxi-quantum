import test from "node:test";
import assert from "node:assert/strict";
import {planUnusedToolPassWalletReversal as plan} from "../lib/tools/commerce/tool-pass-refund-plan.mjs";
const good={
 request_id:"a1111111-1111-4111-8111-111111111111",
 user_id:"a0000000-0000-4000-8000-000000000001",
 state:"active",currency:"USD",amount_minor:9900,
 active_source_minor:2000,legacy_source_minor:7900,
 active_refundable_source_minor:2000,legacy_refundable_source_minor:3000,
 starts_at:"2026-11-06T00:00:00Z",ends_at:"2026-12-06T00:00:00Z"
};
const without=(override={},operations=[])=>plan({order:{...good,...override},operations});
test("only propose refund back to the original two wallets, preserving refundable principal",()=>{
 const p=without();
 assert.equal(p.ok,true);
 assert.equal(p.kind,"WALLET_REVERSAL_PLAN_ONLY");
 assert.equal(p.totalMinor,9900);
 assert.deepEqual(p.credits,[
  {wallet:"sasi",amountMinor:2000,refundableMinor:2000},
  {wallet:"legacy_ai",amountMinor:7900,refundableMinor:3000}
 ]);
 assert(!("paid" in p));
});
test("no refund plan is available without an explicit source usage-ledger lookup",()=>{
 assert.equal(plan({order:good}).error,"UNVERIFIED_USAGE");
 assert.equal(plan({order:good,operations:null}).error,"UNVERIFIED_USAGE");
 assert.equal(plan({order:good,operations:[null]}).error,"UNVERIFIED_USAGE");
});
test("deny used, refunded, revoked, misattributed and time-ambiguous terms",()=>{
 assert.equal(without({},[{user_id:good.user_id,access_kind:"pass",claimed_at:"2026-11-08T00:00:00Z"}]).error,"PASS_ALREADY_USED");
 assert.equal(without({state:"refunded"}).error,"NOT_AN_ACTIVE_WALLET_PURCHASE");
 assert.equal(without({state:"revoked"}).error,"NOT_AN_ACTIVE_WALLET_PURCHASE");
 assert.equal(without({currency:"EUR"}).error,"NOT_AN_ACTIVE_WALLET_PURCHASE");
 assert.equal(without({ends_at:"not a date"}).error,"INVALID_TERM");
 assert.equal(without({refund_reference_id:"completed"}).error,"REFUND_ALREADY_RECORDED");
});
test("reject ledger split discrepancies and refundable principal inflation",()=>{
 assert.equal(without({active_source_minor:1000}).error,"BALANCE_SOURCE_MISMATCH");
 assert.equal(without({active_refundable_source_minor:2001}).error,"REFUNDABLE_PRINCIPAL_MISMATCH");
 assert.equal(without({legacy_refundable_source_minor:7901}).error,"REFUNDABLE_PRINCIPAL_MISMATCH");
 assert.equal(without({amount_minor:0}).error,"BALANCE_SOURCE_MISMATCH");
});
test("other accounts and free use cannot be falsely counted as an original pass usage",()=>{
 const out=without({},[
  {user_id:"b0000000-0000-4000-8000-000000000002",access_kind:"pass",claimed_at:"2026-11-08T00:00:00Z"},
  {user_id:good.user_id,access_kind:"free",claimed_at:"2026-11-08T00:00:00Z"}
 ]);
 assert.equal(out.ok,true);
});
test("CNY original-wallet provenance is not mixed with the USD record",()=>{
 const cny=without({currency:"CNY",amount_minor:2900,active_source_minor:2000,legacy_source_minor:900,legacy_refundable_source_minor:900});
 assert.equal(cny.ok,true);
 assert.equal(cny.currency,"CNY");
 assert.equal(cny.credits[1].amountMinor,900);
});
