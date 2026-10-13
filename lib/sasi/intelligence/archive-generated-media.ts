import 'server-only';
import {createHash} from 'node:crypto';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import sharp from 'sharp';
import {createAdminClient} from '@/lib/supabase/admin';
import {fetchPublicMedia} from '@/lib/security/public-media-fetch';
import {runCommand} from '@/lib/tools/engine/server/command';
import {readMp4DurationSeconds} from '@/lib/sasi/mp4-duration';
import {presignSasiArtifact,sasiArtifactBucket,sasiArtifactR2Ready} from '@/lib/sasi-kernel/artifact-store/r2';

let active=0;
export function generatedArchiveReady(){return sasiArtifactR2Ready()||Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY&&process.env.NEXT_PUBLIC_SUPABASE_URL)}
function inspectContainer(bytes:Buffer){
 if(bytes.length<12||bytes.toString('ascii',4,8)!=='ftyp')throw Error('VIDEO_FORMAT_INVALID');
 let boxes=0,moov=false,mdat=false,width=0,height=0;
 function scan(start:number,end:number,depth:number){
  if(depth>8)throw Error('VIDEO_FORMAT_INVALID');
  for(let at=start;at<end;){
   if(at+8>end||++boxes>20000)throw Error('VIDEO_FORMAT_INVALID');
   let size=bytes.readUInt32BE(at),head=8;const type=bytes.toString('ascii',at+4,at+8);
   if(size===1){if(at+16>end)throw Error('VIDEO_FORMAT_INVALID');size=bytes.readUInt32BE(at+8)*4294967296+bytes.readUInt32BE(at+12);head=16}
   if(size===0)size=end-at;
   if(!Number.isSafeInteger(size)||size<head||at+size>end)throw Error('VIDEO_FORMAT_INVALID');
   if(type==='moov')moov=true;if(type==='mdat'&&size>head)mdat=true;
   if(type==='tkhd'){const offset=at+head+(bytes[at+head]===1?88:76);if(offset+8>at+size)throw Error('VIDEO_FORMAT_INVALID');const w=bytes.readUInt32BE(offset)/65536,h=bytes.readUInt32BE(offset+4)/65536;if(w&&h){width=Math.max(width,w);height=Math.max(height,h)}}
   if(['moov','trak','mdia','minf','stbl','dinf','edts'].includes(type))scan(at+head,at+size,depth+1);
   at+=size;
  }
 }
 scan(0,bytes.length,0);const duration=readMp4DurationSeconds(bytes);
 if(!moov||!mdat||!width||!height||width*height>32_000_000||width>8192||height>8192||!duration||duration>120)throw Error('VIDEO_FORMAT_INVALID');
 return{width,height,duration};
}
function checkVideoSpecification(video:{width:number;height:number;duration:number},input:{expectedDuration?:number;minSide?:number;expectedRatio?:string}){
 if(input.expectedDuration&&Math.abs(video.duration-input.expectedDuration)>Math.max(.5,input.expectedDuration*.1))throw Error('VIDEO_DURATION_MISMATCH');
 if(Math.min(video.width,video.height)<(input.minSide||1))throw Error('VIDEO_RESOLUTION_MISMATCH');
 if(input.expectedRatio){
  const ratio=({'16:9':16/9,'9:16':9/16,'1:1':1} as Record<string,number>)[input.expectedRatio];
  if(!ratio||Math.abs(video.width/video.height-ratio)/ratio>.02)throw Error('VIDEO_RATIO_MISMATCH');
 }
}
export async function archiveGeneratedMedia(input:{userId:string;taskId:string;projectId?:string|null;kind:'image'|'video';url:string;expectedDuration?:number;minSide?:number;expectedRatio?:string;minImageSide?:number;originalDownload?:()=>Promise<{response:Response}>}){
 if(!generatedArchiveReady())throw Error('GENERATION_STORAGE_UNAVAILABLE');
 if(active)throw Error('GENERATION_ARCHIVE_BUSY');active++;
 try{
  const admin=createAdminClient();
  const existing=await admin.from('sasi_generated_assets').select('*').eq('user_id',input.userId).eq('source_task_id',input.taskId).eq('kind',input.kind).eq('status','ready').maybeSingle();
  if(existing.error)throw Error('GENERATION_ARCHIVE_LOOKUP_FAILED');
  if(existing.data){
   const asset=existing.data;let readback:Buffer;
   if(asset.storage_provider==='r2'){const response=await fetchPublicMedia(presignSasiArtifact(asset.object_key),{kind:input.kind,allowHtml:false,deadline:Date.now()+30000,maxBytes:asset.byte_size});readback=Buffer.from(await response.response.arrayBuffer())}
   else{const stored=await admin.storage.from(asset.bucket).download(asset.object_key);if(stored.error||!stored.data||stored.data.size!==asset.byte_size)throw Error('GENERATION_ARCHIVE_VERIFY_FAILED');readback=Buffer.from(await stored.data.arrayBuffer())}
   if(readback.length!==asset.byte_size||createHash('sha256').update(readback).digest('hex')!==asset.sha256)throw Error('GENERATION_ARCHIVE_VERIFY_FAILED');
   if(input.kind==='video')checkVideoSpecification(inspectContainer(readback),input);
   return{...asset,assetId:asset.id};
  }
  const download=input.originalDownload?await input.originalDownload():await fetchPublicMedia(input.url,{kind:input.kind,allowHtml:false,deadline:Date.now()+30000,maxBytes:input.kind==='image'?20*1024*1024:100*1024*1024});
  const bytes=Buffer.from(await download.response.arrayBuffer());let width:number,height:number,duration:number|null=null,extension:string,mime:string;
  if(input.kind==='image'){
   try{const image=sharp(bytes,{failOn:'error',limitInputPixels:24_000_000});const metadata=await image.metadata();await image.stats();
    if(!['png','jpeg','webp'].includes(metadata.format||'')||!metadata.width||!metadata.height||(metadata.pages||1)!==1||Math.max(metadata.width,metadata.height)<(input.minImageSide||1))throw Error('IMAGE_DECODE_INVALID');
    width=metadata.width;height=metadata.height;extension=metadata.format==='jpeg'?'jpg':metadata.format!;mime=metadata.format==='jpeg'?'image/jpeg':'image/'+metadata.format;
   }catch{throw Error('IMAGE_DECODE_INVALID')}
  }else{
   const container=inspectContainer(bytes);duration=container.duration;
   checkVideoSpecification(container,input);
   const dir=await mkdtemp(join(tmpdir(),'sasi-decode-'));
   try{const file=join(dir,'input.mp4');await writeFile(file,bytes);const result=await runCommand(process.execPath,['--max-old-space-size=256',join(process.cwd(),'scripts/runtime/verify-generated-video.cjs'),file],{timeoutMs:45000,maxOutputBytes:64*1024});const decoded=JSON.parse(result.stdout.trim());if(decoded.decoded!==true||decoded.width!==container.width||decoded.height!==container.height)throw Error('VIDEO_DECODE_INVALID');width=decoded.width;height=decoded.height;}finally{await rm(dir,{recursive:true,force:true})}
   extension='mp4';mime='video/mp4';
  }
  const sha256=createHash('sha256').update(bytes).digest('hex');const key=`sasi/${input.userId}/${input.projectId||'generated'}/${input.taskId}/${sha256}.${extension}`;
  const storageProvider=sasiArtifactR2Ready()?'r2':'supabase',bucket=storageProvider==='r2'?sasiArtifactBucket():'sasi-generated';let readback:Buffer;
  if(storageProvider==='r2'){
   const upload=await fetch(presignSasiArtifact(key,300,'PUT'),{method:'PUT',headers:{'Content-Type':mime,'If-None-Match':'*'},body:new Uint8Array(bytes),redirect:'error',signal:AbortSignal.timeout(30000)});
   await upload.body?.cancel();if(!upload.ok&&upload.status!==412)throw Error('GENERATION_ARCHIVE_WRITE_FAILED');
   const stored=await fetchPublicMedia(presignSasiArtifact(key),{kind:input.kind,allowHtml:false,deadline:Date.now()+30000,maxBytes:bytes.length});readback=Buffer.from(await stored.response.arrayBuffer());
  }else{
   const upload=await admin.storage.from(bucket).upload(key,bytes,{contentType:mime,upsert:true});if(upload.error)throw Error('GENERATION_ARCHIVE_WRITE_FAILED');
   const stored=await admin.storage.from(bucket).download(key);if(stored.error||!stored.data||stored.data.size!==bytes.length)throw Error('GENERATION_ARCHIVE_VERIFY_FAILED');readback=Buffer.from(await stored.data.arrayBuffer());
  }
  if(readback.length!==bytes.length||createHash('sha256').update(readback).digest('hex')!==sha256)throw Error('GENERATION_ARCHIVE_VERIFY_FAILED');
  const asset={user_id:input.userId,project_id:input.projectId||null,source_task_id:input.taskId,kind:input.kind,object_key:key,bucket,storage_provider:storageProvider,sha256,byte_size:bytes.length,mime_type:mime,width:width!,height:height!,duration_seconds:duration,verification:'decoded-and-readback',status:'ready'};
  const saved=await admin.from('sasi_generated_assets').insert(asset).select('*').single();
  if(saved.error?.code==='23505'){
   const canonical=await admin.from('sasi_generated_assets').select('*').eq('user_id',input.userId).eq('source_task_id',input.taskId).eq('kind',input.kind).eq('status','ready').maybeSingle();
   if(canonical.error||!canonical.data||canonical.data.object_key!==key||canonical.data.sha256!==sha256)throw Error('GENERATION_ARCHIVE_CONFLICT');
   return{...canonical.data,assetId:canonical.data.id};
  }
  if(saved.error||!saved.data)throw Error('GENERATION_ARCHIVE_SAVE_FAILED');
  return{...saved.data,assetId:saved.data.id};
 }finally{active--}
}
