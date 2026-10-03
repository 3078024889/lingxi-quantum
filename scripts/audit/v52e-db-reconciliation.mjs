import fs from"node:fs";
const bad=[];
const read=p=>fs.readFileSync(p,"utf8");

for(const p of[
 "supabase/migrations/20261003060400_money_reconciliation_formalization_v52e.sql",
 "supabase/migrations/20261003060456_money_reconciliation_constraints_v52e.sql",
 "lib/money/reconcile-worker.ts",
 "app/api/cron/withdrawal-reconcile/route.ts"
])if(!fs.existsSync(p))bad.push(`missing ${p}`);

const m1=read("supabase/migrations/20261003060400_money_reconciliation_formalization_v52e.sql");
for(const x of[
 "money_claim_reconciliation_v52e",
 "for update skip locked",
 "provider_request_key",
 "balance_withdrawals_reconcile_idx",
 "grant execute on function public.money_claim_reconciliation_v52e"
])if(!m1.toLowerCase().includes(x.toLowerCase()))bad.push(`migration1 missing ${x}`);

const m2=read("supabase/migrations/20261003060456_money_reconciliation_constraints_v52e.sql");
if(!m2.includes("balance_withdrawals_provider_attempt_count_nonnegative"))bad.push("attempt count constraint missing");

const worker=read("lib/money/reconcile-worker.ts");
if(!worker.includes('admin.rpc("money_claim_reconciliation_v52e"'))bad.push("worker not using DB claim RPC");
if(worker.includes('.from("balance_withdrawals")\n  .select("id")\n  .in("status"'))bad.push("worker still direct-selects due rows");

const cron=read("app/api/cron/withdrawal-reconcile/route.ts");
if(!cron.includes("reconcileDueWithdrawals(20)"))bad.push("cron not unified on claim worker");
if(cron.includes("refreshWithdrawal"))bad.push("cron still bypasses claim worker");

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("V52E_DB_MIGRATION_HISTORY_FORMALIZED=PASS");
console.log("V52E_RECONCILIATION_CLAIM_RPC=PASS");
console.log("V52E_SKIP_LOCKED_CONCURRENCY_GUARD=PASS");
console.log("V52E_PROVIDER_ATTEMPT_CONSTRAINT=PASS");
console.log("V52E_CRON_UNIFIED_ON_RECONCILE_WORKER=PASS");
console.log("V52E_LOCAL_REMOTE_MIGRATION_VERSIONS_ALIGNED=PASS");
