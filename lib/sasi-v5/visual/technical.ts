import "server-only";
import sharp from "sharp";
import {mkdtemp,writeFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {commandFor,runCommand} from "@/lib/tools/engine/server/command";

export type ImageTechnicalEvidence={
  width:number;height:number;megapixels:number;entropy:number;sharpness:number;channels:number;
  technicalScore:number;reasons:string[];
};
export type VideoTechnicalEvidence={
  duration:number;width:number;height:number;fps:number;hasVideo:boolean;hasAudio:boolean;
  technicalScore:number;reasons:string[];
};

const bounded=(v:number)=>Math.max(0,Math.min(1,v));

export async function inspectImageBytes(bytes:Uint8Array):Promise<ImageTechnicalEvidence>{
  const image=sharp(bytes,{failOn:"error"});
  const [meta,stats]=await Promise.all([image.metadata(),image.stats()]);
  const width=meta.width??0,height=meta.height??0,megapixels=(width*height)/1_000_000;
  const entropy=Number(stats.entropy??0),sharpness=Number(stats.sharpness??0),channels=stats.channels.length;
  const reasons:string[]=[];
  if(width<512||height<512)reasons.push("IMAGE_RESOLUTION_LOW");
  if(entropy<2.2)reasons.push("IMAGE_LOW_INFORMATION");
  if(sharpness<1.2)reasons.push("IMAGE_SOFT");
  const score=bounded(
    Math.min(1,megapixels/2)*.35+
    Math.min(1,entropy/6)*.30+
    Math.min(1,sharpness/6)*.30+
    (channels>=3?.05:0)
  );
  return{width,height,megapixels,entropy,sharpness,channels,technicalScore:score,reasons};
}

function parseRate(value:string|undefined){
  if(!value)return 0;
  const [a,b]=value.split("/").map(Number);
  return Number.isFinite(a)&&Number.isFinite(b)&&b!==0?a/b:0;
}

export async function inspectVideoBytes(bytes:Uint8Array):Promise<VideoTechnicalEvidence>{
  const dir=await mkdtemp(join(tmpdir(),"sasi-v5-video-"));
  const file=join(dir,"input.mp4");
  try{
    await writeFile(file,bytes);
    const ffprobe=commandFor("LINGXI_FFPROBE_BIN","ffprobe");
    const result=await runCommand(ffprobe,[
      "-v","error","-show_entries",
      "format=duration:stream=index,codec_type,width,height,avg_frame_rate",
      "-of","json",file
    ],{timeoutMs:30_000,maxOutputBytes:512*1024});
    const parsed=JSON.parse(result.stdout||"{}") as any;
    const streams=Array.isArray(parsed.streams)?parsed.streams:[];
    const video=streams.find((s:any)=>s.codec_type==="video");
    const audio=streams.find((s:any)=>s.codec_type==="audio");
    const duration=Number(parsed.format?.duration??0);
    const width=Number(video?.width??0),height=Number(video?.height??0),fps=parseRate(video?.avg_frame_rate);
    const reasons:string[]=[];
    if(!video)reasons.push("VIDEO_STREAM_MISSING");
    if(duration<=0)reasons.push("VIDEO_DURATION_INVALID");
    if(width<640||height<640)reasons.push("VIDEO_RESOLUTION_LOW");
    if(fps>0&&fps<20)reasons.push("VIDEO_FPS_LOW");
    const score=bounded((video?.codec_type==="video"?.35:0)+(duration>0?.20:0)+(Math.min(1,(width*height)/(1280*720))*.30)+(fps>=20?.10:0)+(audio?.codec_type==="audio"?.05:0));
    return{duration,width,height,fps,hasVideo:Boolean(video),hasAudio:Boolean(audio),technicalScore:score,reasons};
  }finally{await rm(dir,{recursive:true,force:true}).catch(()=>{})}
}
