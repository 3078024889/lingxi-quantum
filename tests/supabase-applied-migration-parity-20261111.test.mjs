import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import test from "node:test";

const appliedMigration="supabase/migrations/20261110124412_sasi_market_balance_snapshot_and_payout_lock_20261110.sql";
const staleCandidate="supabase/migrations/20261110121500_sasi_market_seller_balance_snapshot.sql";

test("repository mirrors the already-applied production seller snapshot and payout-lock migration",()=>{
 assert.equal(existsSync(appliedMigration),true,"production-applied migration file must be present");
 assert.equal(existsSync(staleCandidate),false,"unapplied earlier duplicate must not be replayed");
 const sql=readFileSync(appliedMigration,"utf8");
 assert.match(sql,/CREATE OR REPLACE FUNCTION public\.sasi_market_seller_balance_snapshot\(\)/);
 assert.match(sql,/v_user_id uuid := auth\.uid\(\)/);
 assert.match(sql,/SET search_path=''/);
 assert.match(sql,/REVOKE ALL ON FUNCTION public\.sasi_market_seller_balance_snapshot\(\) FROM PUBLIC,anon/);
 assert.match(sql,/GRANT EXECUTE ON FUNCTION public\.sasi_market_seller_balance_snapshot\(\) TO authenticated,service_role/);
 assert.match(sql,/ALTER FUNCTION public\.sasi_market_request_payout\(bigint,text,uuid\) SET search_path=''/);
 assert.match(sql,/REVOKE ALL ON FUNCTION public\.sasi_market_request_payout\(bigint,text,uuid\) FROM PUBLIC,anon,authenticated,service_role/);
});
