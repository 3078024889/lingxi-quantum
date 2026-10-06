import type {FFmpeg} from '@ffmpeg/ffmpeg';

/** core 0.12.10 may leave ret=-1 after successful ffprobe. Validate fresh output. */
export async function probeVideo(engine:Pick<FFmpeg,'ffprobe'|'readFile'|'deleteFile'>,source:string){
 const output='probe.json';await engine.deleteFile(output).catch(()=>{});
 const status=await engine.ffprobe(['-v','error','-show_entries','stream=codec_type:format=duration','-of','json',source,'-o',output]);
 if(status!==0&&status!==-1)throw new Error('INVALID_VIDEO');
 const result=JSON.parse(String(await engine.readFile(output,'utf8'))),duration=Number(result.format?.duration);
 if(!Array.isArray(result.streams)||!result.streams.some((s:{codec_type?:string})=>s.codec_type==='video')||!Number.isFinite(duration)||duration<=0)throw new Error('INVALID_VIDEO');
 return {duration,audio:result.streams.some((s:{codec_type?:string})=>s.codec_type==='audio')};
}
