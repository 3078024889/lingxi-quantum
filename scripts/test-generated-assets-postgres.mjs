import fs from 'node:fs';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
export async function verifyGeneratedAssets({db,clients,project}){
 await db.query(`create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
 for(const name of ['20260927232326_sasi_byok_image_tasks.sql','20261012120000_generated_asset_delivery_gate.sql'])await db.query(fs.readFileSync('supabase/migrations/'+name,'utf8'));
 for(const currency of ['CNY','USD']){
  const user=randomUUID();await db.query('insert into auth.users values($1)',[user]);
  const active=currency==='CNY'?'sasi_wallets':'sasi_usd_wallets',legacy=currency==='CNY'?'ai_wallets':'ai_usd_wallets';
  const aa=currency==='CNY'?'available_points':'available_cents',ar=currency==='CNY'?'reserved_points':'reserved_cents',af=currency==='CNY'?'refundable_points':'refundable_cents';
  const la=currency==='CNY'?'available_fen':'available_cents',lr=currency==='CNY'?'reserved_fen':'reserved_cents',lf=currency==='CNY'?'refundable_fen':'refundable_cents';
  for(const [table,a,f] of [[active,aa,af],[legacy,la,lf]])await db.query(`insert into ${table}(user_id,${a},${f}) values($1,500,500)`,[user]);
  const balance=async()=>{const a=(await db.query(`select ${aa} as available,${ar} as reserved,${af} as refundable from ${active} where user_id=$1`,[user])).rows[0],l=(await db.query(`select ${la} as available,${lr} as reserved,${lf} as refundable from ${legacy} where user_id=$1`,[user])).rows[0];return{available:Number(a.available)+Number(l.available),reserved:Number(a.reserved)+Number(l.reserved),refundable:Number(a.refundable)+Number(l.refundable)}};
  const image=async()=>{const id=randomUUID();await db.query(`insert into sasi_byok_image_tasks(id,user_id,request,profile_version,key_fingerprint,estimated_fen,expires_at) values($1,$2,$3,'fixture','fixture',200,now()+interval '1 hour')`,[id,user,{billingCurrency:currency,platformChargeMinor:200}]);return id};
  const asset=async(id,kind)=>{const aid=randomUUID();await db.query(`insert into sasi_generated_assets(id,user_id,project_id,source_task_id,kind,storage_provider,bucket,object_key,sha256,byte_size,mime_type,width,height,duration_seconds,verification,status) values($1,$2,$3,$4,$5,'supabase','sasi-generated',$6,$7,100,$8,720,1280,$9,'decoded-and-readback','ready')`,[aid,user,project,id,kind,`sasi/${user}/generated/${id}/fixture`, 'a'.repeat(64),kind==='image'?'image/png':'video/mp4',kind==='image'?null:4]);return aid};
  const id=await image();
  const claims=await Promise.all(clients.slice(1).map(c=>c.query('select claim_sasi_byok_image_v77($1,$2) as result',[user,id])));
  assert.equal(claims.filter(r=>r.rows[0].result.claimed).length,1);
  assert.deepEqual(await balance(),{available:800,reserved:200,refundable:1000});
  const finish=(c,output)=>c.query('select complete_sasi_byok_image_v77($1,$2,$3) as result',[user,id,output]);
  assert.equal((await finish(db,{imageUrl:'https://example.test/unarchived.png'})).rows[0].result.error,'ASSET_REQUIRED');
  assert.deepEqual(await balance(),{available:800,reserved:200,refundable:1000});
  const aid=await asset(id,'image'),out={assetId:aid,imageUrl:'/api/sasi/generated-assets/'+aid};
  await db.query(`create function fail_image_save() returns trigger language plpgsql as $$begin if new.state='succeeded' then raise exception 'injected image persistence failure';end if;return new;end $$;create trigger image_failure before update on sasi_byok_image_tasks for each row execute function fail_image_save();`);
  await assert.rejects(finish(db,out),e=>e.code==='P0001');assert.deepEqual(await balance(),{available:800,reserved:200,refundable:1000});
  await db.query('drop trigger image_failure on sasi_byok_image_tasks;drop function fail_image_save()');
  const completions=await Promise.all(clients.slice(1).map(c=>finish(c,out)));assert(completions.every(r=>r.rows[0].result.ok));assert.equal(completions.filter(r=>!r.rows[0].result.alreadyCompleted).length,1);
  assert.deepEqual(await balance(),{available:800,reserved:0,refundable:800});
  assert.equal((await db.query('select complete_sasi_byok_image_v77($1,$2,$3) as result',[randomUUID(),id,out])).rows[0].result.error,'TASK_NOT_FOUND');
  const invalid=await image();await db.query('select claim_sasi_byok_image_v77($1,$2)',[user,invalid]);
  await db.query("select fail_sasi_byok_image_v77($1,$2,'IMAGE_DECODE_INVALID')",[user,invalid]);await db.query("select fail_sasi_byok_image_v77($1,$2,'IMAGE_DECODE_INVALID')",[user,invalid]);
  assert.deepEqual(await balance(),{available:800,reserved:0,refundable:800});
  const vid=randomUUID();await db.query(`insert into sasi_byok_video_tasks(id,user_id,project_id,state,request,profile_version,memory_version,key_fingerprint,estimated_fen,price_source,expires_at,provider_task_id) values($1,$2,$3,'quoted',$4,'p','m','k',200,'fixture',now()+interval '1 hour','supplier-'||($1::uuid)::text)`,[vid,user,project,{billingCurrency:currency,platformChargeMinor:200}]);
  await db.query('select claim_sasi_byok_video_v64($1,$2)',[user,vid]);await db.query("update sasi_byok_video_tasks set state='queued' where id=$1",[vid]);
  const vf=output=>db.query("select complete_sasi_byok_video_v64($1,$2,$3,'succeeded',$4) as result",[user,vid,'supplier-'+vid,output]);
  assert.equal((await vf({videoUrl:'https://example.test/not-archived.mp4'})).rows[0].result.error,'ASSET_REQUIRED');assert.deepEqual(await balance(),{available:600,reserved:200,refundable:800});
  assert.equal((await vf({assetId:aid})).rows[0].result.error,'ASSET_REQUIRED');
  const va=await asset(vid,'video');assert((await vf({assetId:va,videoUrl:'/api/sasi/generated-assets/'+va})).rows[0].result.ok);await vf({assetId:va});assert.deepEqual(await balance(),{available:600,reserved:0,refundable:600});
  console.log('PASS: '+currency+' archived-asset gates; concurrent image claims/completions once; failed persistence rolls back fee and release; bad media release idempotent; cross-owner/kind/task assets rejected; video retains hold until archived. Asset metadata fixtures, no production writes.');
 }
 for(const role of ['anon','authenticated']){
  await db.query('set role '+role);await assert.rejects(db.query('select claim_sasi_byok_image_v77($1,$2)',[randomUUID(),randomUUID()]),e=>e.code==='42501');await db.query('reset role');
 }
 assert.equal((await db.query("select public from storage.buckets where id='sasi-generated'")).rows[0].public,false);
 console.log('PASS: private generated bucket and privileged RPC access denied to anon/authenticated.');
}
