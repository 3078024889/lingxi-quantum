const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict'),{randomUUID,createHash}=require('node:crypto');
function load(file,imports){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{exports,require:name=>name in imports?imports[name]:require(name),Buffer,process,URL,Response,Uint8Array,setTimeout,clearTimeout,AbortSignal,fetch});return exports;}
async function main(){
 const owner=randomUUID(),batch=randomUUID(),project=randomUUID(),run=randomUUID(),ids=[randomUUID(),randomUUID()];
 const source=Buffer.from(fs.readFileSync('tests/fixtures/sasi-video-4s.mp4.base64','utf8'),'base64'),hash=createHash('sha256').update(source).digest('hex');
 const tasks=ids.map((id,shotIndex)=>({id,state:'succeeded',project_id:project,request:{batchId:batch,episode:1,shotIndex,duration:4}}));
 const rows=ids.map(id=>({id:randomUUID(),user_id:owner,source_task_id:id,kind:'video',status:'ready',bucket:'sasi-generated',object_key:'sasi/'+owner+'/'+id+'.mp4',storage_provider:'supabase',width:64,height:64,byte_size:source.length,sha256:hash}));
 let foreign=false,corrupt=false,networkCalls=0,queued,checkpoint;
 const objects=new Map(rows.map(row=>[row.object_key,source]));
 function query(table){const filters={};let insert;const q={select:()=>q,eq:(key,value)=>{filters[key]=value;return q},contains:()=>q,order:()=>q,in:()=>q,maybeSingle:async()=>({data:table==='sasi_video_batch_approvals_v78'?foreign?null:{task_ids:ids,project_id:project}:rows.find(row=>Object.entries(filters).every(([key,value])=>row[key]===value))||null}),then:(resolve,reject)=>Promise.resolve({data:table==='sasi_byok_video_tasks'?[...tasks].reverse():rows.filter(row=>ids.includes(row.source_task_id))}).then(resolve,reject),insert:value=>{insert=value;return q},single:async()=>{const row={...insert,id:randomUUID()};rows.push(row);return{data:row}}};return q;}
 const db={from:query,storage:{from:()=>({createSignedUrl:async key=>({data:{signedUrl:'https://fixture.invalid/'+key}}),upload:async(key,bytes)=>{objects.set(key,Buffer.from(bytes));return{}},download:async key=>({data:new Blob([objects.get(key)])})})}};
 const command=load('lib/tools/engine/server/command.ts',{}),duration=load('lib/sasi/mp4-duration.ts',{});
 const transport={fetchPublicMedia:async url=>{networkCalls++;const key=new URL(url).pathname.slice(1);const bytes=objects.get(key);return{response:new Response(corrupt?Buffer.alloc(bytes.length):bytes)}}};
 const archive=load('lib/sasi/intelligence/archive-generated-media.ts',{'server-only':{},'@/lib/supabase/admin':{createAdminClient:()=>db},'@/lib/security/public-media-fetch':transport,'@/lib/tools/engine/server/command':command,'@/lib/sasi/mp4-duration':duration,'@/lib/sasi-kernel/artifact-store/r2':{sasiArtifactR2Ready:()=>false}});
 const compose=load('lib/sasi/durable/video-compose-job.ts',{'server-only':{},'@/lib/supabase/admin':{createAdminClient:()=>db},'./run-store':{beginDurableRun:async()=>({id:run}),checkpointRun:async value=>{checkpoint=value}},'./job-queue':{enqueueDurableJob:async value=>{queued=value}},'@/lib/sasi/intelligence/archive-generated-media':archive,'@/lib/sasi-kernel/artifact-store/r2':{},'@/lib/security/public-media-fetch':transport,'@/lib/tools/engine/server/command':command,'@/lib/sasi/core/conversation-store':{conversationUuid:/^[0-9a-f-]{36}$/i}});
 process.env.SUPABASE_SERVICE_ROLE_KEY='isolated-not-a-key';process.env.NEXT_PUBLIC_SUPABASE_URL='https://fixture.invalid';
 await compose.queueVideoEpisodeAssembly(owner,batch,1);assert.deepEqual(Array.from(queued.payload.taskIds),ids);
 foreign=true;await assert.rejects(compose.executeVideoComposeJob({runId:run,userId:owner,payload:queued.payload}),/INVALID_VIDEO_APPROVAL/);foreign=false;assert.equal(networkCalls,0);
 const input={runId:run,userId:owner,payload:queued.payload};
 const work=compose.executeVideoComposeJob(input);
 await assert.rejects(compose.executeVideoComposeJob(input),/EPISODE_ASSEMBLY_BUSY/);
 const film=await work;assert.equal(film.episode,1);assert.equal(checkpoint.state,'succeeded');
 const asset=rows.find(row=>row.id===film.assetId);assert.equal(asset.duration_seconds,8);assert.equal(asset.verification,'decoded-and-readback');assert.equal(duration.readMp4DurationSeconds(objects.get(asset.object_key)),8);
 const calls=networkCalls;assert.equal((await compose.executeVideoComposeJob(input)).assetId,film.assetId);assert.equal(networkCalls,calls);
 const output=objects.get(asset.object_key);assert(output.length>source.length);
 rows.splice(rows.indexOf(asset),1);corrupt=true;await assert.rejects(compose.executeVideoComposeJob({...input,runId:randomUUID()}),/EPISODE_ASSET_CHANGED/);
 console.log('PASS: actual Node WASM MP4 concatenation and full frame decoding, 4s+4s=8s private archived result, chronological shot order, persisted replay, owner gate and hash rejection. Database/network/storage adapters isolated; no supplier fee or production writes.');
}
main().catch(error=>{console.error(error);process.exitCode=1});
