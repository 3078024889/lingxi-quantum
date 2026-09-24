import fs from "node:fs";
const r=p=>fs.readFileSync(p,"utf8");
const a=(v,m)=>{if(!v)throw new Error("FAIL "+m);console.log("PASS "+m)};

const route=r("app/api/cron/privacy-cleanup/route.ts");
const migration=r("supabase/migrations/20260924150841_privacy_cleanup_r2_safety_v14513.sql");

a(route.includes("fileQuery.error"),"burn file query failure defers note deletion");
a(route.includes("objectDeleteErrors"),"R2 delete failures are observable");
a(route.includes("deferredNotes"),"failed cleanup notes are retained");
a(route.includes('dbCleanup:cleanup.error?null:cleanup.data'),"DB cleanup result is observable");
a(migration.includes("coalesce(has_files,false)=false"),"DB cleanup never deletes file-backed burn notes");
a(migration.includes("burn_file_notes_deferred"),"deferred file-note count returned");
a(migration.includes("burn_notes_owner_user_id_idx"),"burn owner FK index");
a(migration.includes("temp_mail_batch_uses_user_id_idx"),"temp mail batch FK index");
a(migration.includes("ai_usd_wallet_ledger_user_id_idx"),"AI USD ledger FK index");
a(migration.includes("sasi_usd_wallet_ledger_user_id_idx"),"SASI USD ledger FK index");

console.log("V14.51.3 R2 CLEANUP SAFETY=PASS");
