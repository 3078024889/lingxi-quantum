import fs from "node:fs";import path from "node:path";import crypto from "node:crypto";
const repo=path.resolve(process.argv[2]||process.cwd());
const files=[
"supabase/migrations/20260924014754_core_wallet_payment_rls_hardening_v14111.sql",
"supabase/migrations/20260925162000_temp_mail_multi_identity_quota_v1487.sql",
"supabase/migrations/20260925164500_temp_mail_persistent_workspace_v1488.sql",
"supabase/migrations/20260925183500_burn_decrypt_before_consume_v1505.sql"];
let missing=0;for(const rel of files){const abs=path.join(repo,rel);if(!fs.existsSync(abs)){console.log(`MISSING ${rel}`);missing++;continue}const buf=fs.readFileSync(abs),sha=crypto.createHash("sha256").update(buf).digest("hex").slice(0,20);console.log(`MIGRATION_PRESENT ${rel} sha256_20=${sha} bytes=${buf.length}`)}
if(missing){console.error(`MIGRATION_RELEASE_SAFETY_MISSING=${missing}`);process.exit(1)}
console.log("MIGRATION_RELEASE_SAFETY=PASS");console.log("NOTE=Read-only. No migration is executed.");
