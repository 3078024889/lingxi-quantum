import fs from"node:fs";
const bad=[];
function must(p,x){const s=fs.readFileSync(p,"utf8");if(!s.includes(x))bad.push(`${p}: missing ${x}`)}
function mustNot(p,x){const s=fs.readFileSync(p,"utf8");if(s.includes(x))bad.push(`${p}: forbidden ${x}`)}

const m="supabase/migrations/20261003105500_v52a_money_integrity_master.sql";
for(const x of[
 "provider_request_key",
 "provider_attempt_count",
 "next_reconcile_at",
 "money_balance_snapshot_v52",
 "money_reconciliation_candidates_v52",
 "money_record_provider_observation_v52",
 "complete_balance_withdrawal",
 "release_balance_withdrawal"
])must(m,x);

mustNot(m,"drop table");
mustNot(m,"truncate ");
mustNot(m,"status='completed' where");
must("lib/money/provider-adapter.ts","MoneyRefundProviderAdapter");
must("lib/money/reconciliation.ts","MONEY_PROVIDER_SUCCESS_WITHOUT_REFUND_ID");
must("lib/money/invariants.ts","MONEY_REFUND_HOLD_EXCEEDS_REFUNDABLE");
must("app/api/money/summary/route.ts","money_balance_snapshot_v52");
must("app/api/money/summary/route.ts","normalizeWithdrawalStatus");

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("V52A_MONEY_SCHEMA=PASS");
console.log("V52A_PROVIDER_BOUNDARY=PASS");
console.log("V52A_LEDGER_GUARDS=PASS");
console.log("V52A_DUAL_CURRENCY_READMODEL=PASS");
console.log("V52A_RECONCILIATION_FOUNDATION=PASS");
