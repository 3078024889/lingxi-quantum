import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
export async function verifyVideoBatches({db,clients,project}){
 await db.query(fs.readFileSync('supabase/migrations/20261013010559_sasi_video_batch_approval_v78.sql','utf8'));
 const owner=randomUUID(),batch=randomUUID(),ids=[randomUUID(),randomUUID()];
 await db.query('insert into auth.users values($1)',[owner]);
 await db.query('insert into sasi_wallets(user_id,available_points,refundable_points) values($1,500,500)',[owner]);
 await db.query('insert into ai_wallets(user_id,available_fen,refundable_fen) values($1,500,500)',[owner]);
 for(const id of ids)await db.query(`insert into sasi_byok_video_tasks(id,user_id,project_id,state,request,profile_version,memory_version,key_fingerprint,estimated_fen,price_source,expires_at) values($1,$2,$3,'quoted',$4,'fixture','fixture','fixture',200,'fixture',now()+interval '1 hour')`,[id,owner,project,{batchId:batch,billingCurrency:'CNY',platformChargeMinor:200}]);
 const approve=c=>c.query('select approve_sasi_video_batch_v78($1,$2,400,$3) as result',[owner,batch,'CNY']);
 const results=await Promise.all(clients.slice(1).map(c=>approve(c)));
 assert(results.every(x=>x.rows[0].result.ok));
 const balance=async()=>(await db.query('select (a.available_points+b.available_fen)::int as available,(a.reserved_points+b.reserved_fen)::int as reserved from sasi_wallets a join ai_wallets b using(user_id) where user_id=$1',[owner])).rows[0];
 assert.deepEqual(await balance(),{available:600,reserved:400});
 assert.equal((await db.query('select approve_sasi_video_batch_v78($1,$2,399,$3) as result',[owner,batch,'CNY'])).rows[0].result.error,'QUOTE_INVALID');
 assert.equal((await db.query('select approve_sasi_video_batch_v78($1,$2,400,$3) as result',[randomUUID(),batch,'CNY'])).rows[0].result.error,'QUOTE_INVALID');
 const claims=await Promise.all(clients.slice(1).map(c=>c.query('select claim_sasi_byok_video_v64($1,$2) as result',[owner,ids[0]])));
 assert.equal(claims.filter(x=>x.rows[0].result.claimed).length,1);
 assert.deepEqual(await balance(),{available:600,reserved:400});
 assert.equal((await db.query('select fail_quoted_sasi_video_v78($1,$2,$3) as result',[owner,ids[1],'fixture precondition failure'])).rows[0].result,true);
 assert.deepEqual(await balance(),{available:800,reserved:200});
 assert.equal((await db.query('select fail_quoted_sasi_video_v78($1,$2,$3) as result',[owner,ids[0],'must not release an uncertain external submission'])).rows[0].result,false);
 for(const role of ['anon','authenticated']){await db.query('set role '+role);await assert.rejects(approve(db),e=>e.code==='42501');await db.query('reset role');}
 console.log('PASS: actual PostgreSQL atomic batch approval; concurrent retry reserves once; changed price/cross-owner rejected; per-clip claim does not reserve twice; unsubmitted failure releases funds; external submission hold retained; client roles denied. Local fixtures only.');
}
