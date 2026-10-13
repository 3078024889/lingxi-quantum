import fs from 'node:fs';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
export async function verifyWorkerSchedule({db}){
 await db.query(fs.readFileSync('supabase/migrations/20261005150000_sasi_detached_jobs_v150.sql','utf8'));
 // The local PostgreSQL distribution lacks Supabase extensions. Stub only their
 // external adapters; this verifies real PL/pgSQL logic, NOT extension installation.
 await db.query(`create schema vault;create schema cron;create schema net;
 create table vault.secrets(id uuid primary key default gen_random_uuid(),name text unique,secret text);
 create view vault.decrypted_secrets as select id,name,secret as decrypted_secret from vault.secrets;
 create function vault.create_secret(text,text,text) returns uuid language plpgsql as $$declare k uuid;begin insert into vault.secrets(secret,name) values($1,$2) returning id into k;return k;end $$;
 create function vault.update_secret(uuid,text) returns void language sql as $$update vault.secrets set secret=$2 where id=$1$$;
 create table cron.job(name text primary key,schedule text,command text);
 create function cron.schedule(text,text,text) returns bigint language plpgsql as $$begin insert into cron.job values($1,$2,$3) on conflict(name) do update set schedule=$2,command=$3;return 1;end $$;
 create table net.calls(url text,headers jsonb,body jsonb,timeout integer);
 create function net.http_post(url text,headers jsonb,body jsonb,timeout_milliseconds integer) returns bigint language plpgsql as $$begin insert into net.calls values(url,headers,body,timeout_milliseconds);return 1;end $$;`);
 const migration=fs.readFileSync('supabase/migrations/20261013010609_sasi_worker_schedule_v78.sql','utf8').replace(/^create extension[^;]+;\s*/gm,'');
 await db.query(migration);
 assert.equal((await db.query("select configure_sasi_worker_v78('short') as result")).rows[0].result,false);
 assert.equal((await db.query("select configure_sasi_worker_v78('mock-worker-token-not-a-real-secret') as result")).rows[0].result,true);
 assert.equal((await db.query('select kick_sasi_worker_v78() as result')).rows[0].result,0);
 assert.equal((await db.query('select count(*) from net.calls')).rows[0].count,'0');
 for(const role of ['anon','authenticated','service_role']){await db.query('set role '+role);await assert.rejects(db.query('select kick_sasi_worker_v78()'),e=>e.code==='42501');await db.query('reset role');}
 assert.equal((await db.query('select schedule from cron.job')).rows[0].schedule,'10 seconds');
 assert(!(await db.query('select command from cron.job')).rows[0].command.includes('mock-worker-token'));
 await db.query(fs.readFileSync('supabase/migrations/20261013010614_sasi_video_poll_wait_v78.sql','utf8'));
 const owner=(await db.query('select id from auth.users limit 1')).rows[0].id;
 const project=(await db.query('select id from sasi_projects limit 1')).rows[0].id;
 const run=(await db.query("select begin_sasi_durable_run_v110($1,$2,'video.advance','poll-test',$3) as result",[owner,project,randomUUID()])).rows[0].result;
 const job=randomUUID();await db.query("insert into sasi_durable_jobs(id,run_id,user_id,job_kind,workflow_version,payload_json,state,attempt,max_attempts,lease_owner,lease_until,deadline_at) values($1,$2,$3,'video.advance','video.advance.v78','{}','running',12,12,'poll-worker',now()+interval '90 seconds',now()+interval '2 hours')",[job,run.id,owner]);
 assert.equal((await db.query("select defer_sasi_video_poll_v78($1,'wrong-worker') as result",[job])).rows[0].result.ok,false);
 assert.equal((await db.query("select defer_sasi_video_poll_v78($1,'poll-worker') as result",[job])).rows[0].result.state,'waiting');
 assert.equal((await db.query('select attempt from sasi_durable_jobs where id=$1',[job])).rows[0].attempt,11);
 assert.equal((await db.query("select defer_sasi_video_poll_v78($1,'poll-worker') as result",[job])).rows[0].result.ok,false);
 await db.query("update sasi_durable_jobs set job_kind='video.compose',state='running',lease_owner='poll-worker',lease_until=now()+interval '90 seconds' where id=$1",[job]);
 assert.equal((await db.query("select defer_sasi_video_poll_v78($1,'poll-worker') as result",[job])).rows[0].result.state,'waiting');
 await db.query("update sasi_durable_jobs set state='running',lease_owner='poll-worker',lease_until=now()+interval '90 seconds',deadline_at=now()-interval '1 second' where id=$1",[job]);
 assert.equal((await db.query("select defer_sasi_video_poll_v78($1,'poll-worker') as result",[job])).rows[0].result.state,'failed');
 for(const role of ['anon','authenticated']){await db.query('set role '+role);await assert.rejects(db.query("select defer_sasi_video_poll_v78($1,'poll-worker')",[job]),e=>e.code==='42501');await db.query('reset role');}
 console.log('PASS: real PostgreSQL supplier waits preserve retry budget, reject stale/foreign leases and repeat deferral, enforce final deadline and deny client roles.');
 console.log('PASS: real PL/pgSQL schedule configuration, short-secret rejection, empty-queue no-network, restricted dispatcher execution, no plaintext key in cron command. Supabase Vault/network/Cron adapters stubbed; extension installation not verified here.');
}
