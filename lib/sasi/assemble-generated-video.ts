import type {FFmpeg} from '@ffmpeg/ffmpeg';
import {probeVideo} from './probe-video';

/** Fetch only persisted supplier results. The caller owns URLs and cancellation. */
export async function assembleGeneratedVideo(urls:string[],ratio:string,signal:AbortSignal):Promise<Blob>{
 if(!urls.length||urls.length>24)throw new Error('ASSEMBLY_LIMIT');
 const {FFmpeg}=await import('@ffmpeg/ffmpeg');const engine:FFmpeg=new FFmpeg();
 const stop=()=>engine.terminate();signal.addEventListener('abort',stop,{once:true});
 const check=()=>{if(signal.aborted)throw new Error('CANCELLED')};
 let bytes=0,seconds=0;
 try{
  check();await engine.load({coreURL:'/media/ffmpeg-0.12.10/ffmpeg-core.js',wasmURL:'/media/ffmpeg-0.12.10/ffmpeg-core.wasm'});
  const [width,height]=ratio==='9:16'?[720,1280]:ratio==='1:1'?[720,720]:[1280,720];
  for(const [i,url] of urls.entries()){
   check();if(!/^\/api\/sasi\/video-file\?taskId=[0-9a-f-]{36}$/i.test(url))throw new Error('INVALID_VIDEO_URL');
   const chunks:Uint8Array[]=[];let size=0,total=Infinity;
   while(size<total){const response=await fetch(url+'&start='+size,{signal,credentials:'same-origin'});if(response.status!==206)throw new Error('VIDEO_DOWNLOAD_FAILED');const match=response.headers.get('content-range')?.match(/^bytes (\d+)-(\d+)\/(\d+)$/);if(!match||Number(match[1])!==size)throw new Error('VIDEO_DOWNLOAD_FAILED');total=Number(match[3]);if(!Number.isSafeInteger(total)||total<=0||total>150*1024*1024)throw new Error('ASSEMBLY_LIMIT');const part=new Uint8Array(await response.arrayBuffer());if(part.length!==Number(match[2])-size+1||!part.length)throw new Error('VIDEO_DOWNLOAD_FAILED');bytes+=part.length;size+=part.length;if(bytes>150*1024*1024)throw new Error('ASSEMBLY_LIMIT');chunks.push(part)}
   const input=new Uint8Array(size);let offset=0;for(const chunk of chunks){input.set(chunk,offset);offset+=chunk.length}
   const name=`source-${i}`;await engine.writeFile(name,input);
   const {duration,audio}=await probeVideo(engine,name);
   if((seconds+=duration)>600)throw new Error('ASSEMBLY_LIMIT');
   if(await engine.exec(['-protocol_whitelist','file,pipe','-i',name,...(!audio?['-f','lavfi','-i','anullsrc=r=48000:cl=stereo']:[]),'-map','0:v:0','-map',audio?'0:a:0':'1:a:0','-vf',`scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=24`,'-c:v','libx264','-preset','ultrafast','-crf','22','-pix_fmt','yuv420p','-c:a','aac','-ar','48000','-ac','2','-t',String(duration),'-shortest',`clip-${i}.mp4`],180000)!==0)throw new Error('ASSEMBLY_FAILED');
   await engine.deleteFile(name);
  }
  check();await engine.writeFile('timeline.txt',urls.map((_,i)=>`file 'clip-${i}.mp4'`).join('\n'));
  if(await engine.exec(['-f','concat','-safe','1','-i','timeline.txt','-c','copy','-metadata','comment=SASI AI-generated video','-movflags','+faststart','film.mp4'],60000)!==0)throw new Error('ASSEMBLY_FAILED');
  const result=await engine.readFile('film.mp4');if(!(result instanceof Uint8Array)||!result.length)throw new Error('ASSEMBLY_FAILED');
  return new Blob([new Uint8Array(result)],{type:'video/mp4'});
 }finally{signal.removeEventListener('abort',stop);engine.terminate()}
}
