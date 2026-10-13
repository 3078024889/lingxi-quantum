const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict'),sharp=require('sharp');
function load(file,imports){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{exports,require:n=>n in imports?imports[n]:require(n),Buffer,process,URL,Response,Uint8Array,setTimeout,clearTimeout,AbortSignal,fetch});return exports;}
async function main(){
 const rows=[],objects=new Map();let source,corrupt=false,failSave=false,downloads=0;
 const query=()=>{const filters={};let value;const q={select:()=>q,eq:(k,v)=>{filters[k]=v;return q},maybeSingle:async()=>({data:rows.find(r=>Object.entries(filters).every(([k,v])=>r[k]===v))||null}),insert:v=>{value=v;return q},single:async()=>{if(failSave)return{error:{code:'ISOLATED_DB_FAILURE'}};const row={...value,id:require('node:crypto').randomUUID()};rows.push(row);return{data:row}}};return q;};
 const db={from:()=>query(),storage:{from:()=>({
  upload:async(key,bytes)=>{objects.set(key,Buffer.from(bytes));return{}},
  download:async key=>{const b=objects.get(key);return{data:new Blob([corrupt?Buffer.alloc(b.length):b])}},
 })}};
 const duration=load('lib/sasi/mp4-duration.ts',{}),command=load('lib/tools/engine/server/command.ts',{});
 const archive=load('lib/sasi/intelligence/archive-generated-media.ts',{'server-only':{},'@/lib/supabase/admin':{createAdminClient:()=>db},'@/lib/security/public-media-fetch':{fetchPublicMedia:async()=>{downloads++;return{response:new Response(source)}}},'@/lib/tools/engine/server/command':command,'@/lib/sasi/mp4-duration':duration,'@/lib/sasi-kernel/artifact-store/r2':{sasiArtifactR2Ready:()=>false}});
 process.env.SUPABASE_SERVICE_ROLE_KEY='isolated-not-a-key';process.env.NEXT_PUBLIC_SUPABASE_URL='https://isolated.invalid';
 const input=kind=>({userId:require('node:crypto').randomUUID(),taskId:require('node:crypto').randomUUID(),kind,url:'https://isolated.invalid/file'});
 source=await sharp({create:{width:32,height:32,channels:3,background:'blue'}}).png().toBuffer();const imageInput=input('image');
 const image=await archive.archiveGeneratedMedia(imageInput);assert.equal(image.width,32);assert.equal(image.height,32);assert.equal(image.verification,'decoded-and-readback');assert.equal(rows.length,1);
 const count=downloads;assert.equal((await archive.archiveGeneratedMedia(imageInput)).assetId,image.assetId);assert.equal(downloads,count);
 corrupt=true;await assert.rejects(archive.archiveGeneratedMedia(imageInput),/GENERATION_ARCHIVE_VERIFY_FAILED/);corrupt=false;
 source=Buffer.from('<html>not a generated image</html>');await assert.rejects(archive.archiveGeneratedMedia(input('image')),/IMAGE_DECODE_INVALID/);assert.equal(rows.length,1);
 source=await sharp({create:{width:32,height:32,channels:3,background:'blue'}}).png().toBuffer();corrupt=true;await assert.rejects(archive.archiveGeneratedMedia(input('image')),/GENERATION_ARCHIVE_VERIFY_FAILED/);corrupt=false;assert.equal(rows.length,1);
 failSave=true;await assert.rejects(archive.archiveGeneratedMedia(input('image')),/GENERATION_ARCHIVE_SAVE_FAILED/);failSave=false;assert.equal(rows.length,1);
 source=Buffer.from(fs.readFileSync('tests/fixtures/sasi-video-4s.mp4.base64','utf8'),'base64');const videoInput={...input('video'),expectedDuration:4};
 await assert.rejects(archive.archiveGeneratedMedia({...input('video'),expectedRatio:'16:9'}),/VIDEO_RATIO_MISMATCH/);
 const video=await archive.archiveGeneratedMedia(videoInput);assert.equal(video.width,64);assert.equal(video.height,64);assert.equal(video.duration_seconds,4);assert.equal(video.verification,'decoded-and-readback');
 await assert.rejects(archive.archiveGeneratedMedia({...videoInput,expectedRatio:'9:16'}),/VIDEO_RATIO_MISMATCH/);
 assert.equal((await archive.archiveGeneratedMedia({...videoInput,expectedRatio:'1:1'})).assetId,video.assetId);
 await assert.rejects(archive.archiveGeneratedMedia({...input('video'),expectedDuration:10}),/VIDEO_DURATION_MISMATCH/);
 await assert.rejects(archive.archiveGeneratedMedia({...input('video'),minSide:720}),/VIDEO_RESOLUTION_MISMATCH/);
 source=source.subarray(0,source.length-50);await assert.rejects(archive.archiveGeneratedMedia(input('video')),/VIDEO_FORMAT_INVALID/);
 console.log('PASS: real PNG decoding and MP4 WASM frame decoding, trusted archive readback/hash, replay reuses stored asset, corrupt/missing/undersized media and persistence failures rejected. Network/database/storage adapters isolated; no provider fee or production data.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
