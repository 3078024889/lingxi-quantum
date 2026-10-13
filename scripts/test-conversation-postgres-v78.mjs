import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';

const runtime=path.resolve('../lingxi-quantum/_local/r64-db-runtime');
const require=createRequire(path.join(runtime,'package.json'));
const EmbeddedPostgres=(await import(pathToFileURL(require.resolve('embedded-postgres')).href)).default;
const {Client}=require('pg');
const password=randomUUID(),port=55478;
const server=new EmbeddedPostgres({databaseDir:path.join(runtime,'clusters','conversation-'+randomUUID()),user:'postgres',password,port,persistent:true,postgresFlags:['-h','127.0.0.1']});
const clients=[];
async function connect(){const c=new Client({host:'127.0.0.1',port,user:'postgres',password,database:'postgres'});await c.connect();clients.push(c);return c;}
try{
 await server.initialise();await server.start();const db=await connect();
 await db.query('create role anon;create role authenticated;create role service_role;');
 await db.query("create table public.sasi_provider_connections(id integer primary key,encrypted_credential text,model_id text);insert into public.sasi_provider_connections values(1,'encrypted-fixture','legacy-model')");
 await db.query(fs.readFileSync('supabase/migrations/20261013010618_sasi_model_preferences_v78.sql','utf8'));
 assert.deepEqual((await db.query('select model_preferences from public.sasi_provider_connections')).rows[0].model_preferences,{});
 await db.query('update public.sasi_provider_connections set model_preferences=$1',[{text:'chat-alias',video:'doubao-seedance-2-5-260628'}]);
 for(const invalid of [{text:123},{video:'x'.repeat(181)},{unknown:'value'},[],null])await assert.rejects(db.query('update public.sasi_provider_connections set model_preferences=$1',[JSON.stringify(invalid)]),e=>e.code==='23514');
 assert.equal((await db.query('select encrypted_credential from public.sasi_provider_connections')).rows[0].encrypted_credential,'encrypted-fixture');
 for(const name of ['20261005131500_sasi_unified_conversation_v120.sql','20261013010553_sasi_conversation_workspace_v78.sql'])await db.query(fs.readFileSync(path.join('supabase/migrations',name),'utf8'));
 const owner=randomUUID(),thread=randomUUID(),request=randomUUID(),question='请继续这个五十集的故事';
 const sql='select save_sasi_chat_turn_v78($1,$2,$3,$4,$5,$6) as result';
 const save=(c,answer=null,user=owner)=>c.query(sql,[user,thread,request,question,answer,null]);
 const pending=await save(db);assert.equal(pending.rows[0].result.ok,true);
 assert.equal((await db.query("select state from sasi_conversation_messages where role='assistant'")).rows[0].state,'pending');
 const answer='完整章节。'.repeat(4000);
 const concurrent=await Promise.all(Array.from({length:12},async()=>save(await connect(),answer)));
 assert(concurrent.every(x=>x.rows[0].result.ok));
 assert.equal((await db.query('select count(*) from sasi_conversation_messages')).rows[0].count,'2');
 assert.equal((await db.query("select content,state from sasi_conversation_messages where role='assistant'")).rows[0].content,answer);
 assert.equal((await save(db,'另一个结果')).rows[0].result.error,'HISTORY_CONFLICT');
 assert.equal((await save(db,answer,randomUUID())).rows[0].result.error,'HISTORY_NOT_FOUND');
 assert.equal((await db.query(sql,[owner,thread,randomUUID(),null,null,null])).rows[0].result.error,'INVALID_HISTORY');
 for(const role of ['anon','authenticated']){await db.query('set role '+role);await assert.rejects(save(db),e=>e.code==='42501');await db.query('reset role');}
 console.log('PASS: actual local PostgreSQL migrations; model preference bounds/types and existing credential preservation; pending-to-complete, 12 concurrent retries, exactly one turn, long Chinese answer, conflict rejection, owner isolation, null validation, client-role RPC denial. No production data.');
}finally{await Promise.all(clients.map(c=>c.end().catch(()=>{})));await server.stop().catch(()=>{});}
