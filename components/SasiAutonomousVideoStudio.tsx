"use client";

import { useEffect, useRef, useState } from "react";
import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { drawProceduralSceneBackground } from "@/lib/sasi-kernel/capabilities/video/procedural-frame";

type Ratio = "9:16" | "16:9" | "1:1";
type TimelineScene = {
  id:string;
  text:string;
  durationSec:number;
  character:string;
  place:string;
  framing:string;
  camera:string;
  startSec:number;
  endSec:number;
  transition:string;
  mood?:string;
  action?:string;
  props?:string[];
  visualIntent?:string;
};
type Timeline = {
  ratio:Ratio;
  fps:number;
  width:number;
  height:number;
  totalDurationSec:number;
  scenes:TimelineScene[];
};
type Output = { url:string; mime:string; filename:string; blob:Blob } | null;

function clickDownload(url:string,name:string) {
  const a=document.createElement("a");
  a.href=url;
  a.download=name;
  a.rel="noopener";
  a.style.display="none";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function saveBlob(blob:Blob,name:string){
  const url=URL.createObjectURL(blob);
  clickDownload(url,name);
  window.setTimeout(()=>URL.revokeObjectURL(url),15000);
}

function wrapText(ctx:CanvasRenderingContext2D,text:string,maxWidth:number){
  const lines:string[]=[];
  let current="";
  for(const unit of [...text]){
    const next=current+unit;
    if(ctx.measureText(next).width>maxWidth&&current){lines.push(current);current=unit}
    else current=next;
  }
  if(current)lines.push(current);
  return lines.slice(0,9);
}

async function imageBitmapFor(file:File|undefined){
  if(!file)return null;
  try{return await createImageBitmap(file)}catch{return null}
}

function drawFrame(
  canvas:HTMLCanvasElement,
  scene:TimelineScene,
  progress:number,
  image:ImageBitmap|null,
){
  const ctx=canvas.getContext("2d");
  if(!ctx)throw new Error("当前设备无法建立画面。");
  const {width,height}=canvas;
  ctx.clearRect(0,0,width,height);
  ctx.fillStyle="#0b0b0f";
  ctx.fillRect(0,0,width,height);

  if(image){
    const zoom=1+progress*.08;
    const scale=Math.max(width/image.width,height/image.height)*zoom;
    const dw=image.width*scale,dh=image.height*scale;
    const drift=(progress-.5)*width*.035;
    ctx.globalAlpha=.82;
    ctx.drawImage(image,(width-dw)/2+drift,(height-dh)/2,dw,dh);
    ctx.globalAlpha=1;
  }else{
    drawProceduralSceneBackground(ctx,width,height,scene,progress);
  }

  const shade=ctx.createLinearGradient(0,height*.2,0,height);
  shade.addColorStop(0,"rgba(0,0,0,0)");
  shade.addColorStop(.58,"rgba(0,0,0,.08)");
  shade.addColorStop(1,"rgba(0,0,0,.86)");
  ctx.fillStyle=shade;
  ctx.fillRect(0,0,width,height);

  const margin=Math.round(width*.07);
  ctx.fillStyle="rgba(231,194,112,.92)";
  ctx.font=`600 ${Math.max(16,Math.round(width*.021))}px system-ui,sans-serif`;
  ctx.fillText(`LINGXIFIELD · SASI`,margin,margin+5);

  const font=Math.max(30,Math.round(width*.047));
  ctx.font=`600 ${font}px system-ui,-apple-system,"Segoe UI",sans-serif`;
  ctx.fillStyle="#fff";
  ctx.textBaseline="top";
  const lines=wrapText(ctx,scene.text,width-margin*2);
  const lineHeight=Math.round(font*1.42);
  let y=Math.max(height*.61,height-margin-lines.length*lineHeight-58);
  for(const line of lines){ctx.fillText(line,margin,y);y+=lineHeight}

  ctx.fillStyle="rgba(255,255,255,.72)";
  ctx.font=`500 ${Math.max(15,Math.round(width*.019))}px system-ui,sans-serif`;
  const meta=[scene.place,scene.framing,scene.camera].filter(Boolean).join(" · ");
  ctx.fillText(meta,margin,Math.min(height-margin-34,y+14));

  ctx.fillStyle="rgba(255,255,255,.14)";
  ctx.fillRect(margin,height-margin,width-margin*2,5);
  ctx.fillStyle="rgba(231,194,112,.92)";
  ctx.fillRect(margin,height-margin,(width-margin*2)*Math.max(0,Math.min(1,progress)),5);
}

async function canvasPng(canvas:HTMLCanvasElement){
  return await new Promise<Uint8Array>((resolve,reject)=>
    canvas.toBlob(async blob=>
      blob?resolve(new Uint8Array(await blob.arrayBuffer())):reject(new Error("画面生成失败。"))
    ,"image/png"),
  );
}

function artifact<T>(body:any,name:string):T|null{
  const value=(body?.artifacts||[]).find((x:any)=>x?.name===name)?.value;
  return value==null?null:value as T;
}

function isAppleMobile(){
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
}

export default function SasiAutonomousVideoStudio(){
  const [script,setScript]=useState(
    "深夜，城市最后一班地铁缓缓进站。\n\n女孩抬头看见对面站台上，站着一个和自己一模一样的人。\n\n车门关闭前，那个人举起手里的旧照片。",
  );
  const [ratio,setRatio]=useState<Ratio>("9:16");
  const [images,setImages]=useState<File[]>([]);
  const [plan,setPlan]=useState<Timeline|null>(null);
  const [srt,setSrt]=useState("");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [output,setOutput]=useState<Output>(null);
  const ffmpegRef=useRef<FFmpeg|null>(null);
  const runId=useRef(0);
  const mounted=useRef(true);

  useEffect(()=>()=>{mounted.current=false;runId.current++;ffmpegRef.current?.terminate();ffmpegRef.current=null},[]);
  useEffect(()=>()=>{if(output?.url)URL.revokeObjectURL(output.url)},[output?.url]);

  async function createPlan(){
    const response=await fetch("/api/sasi/autonomous",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({kind:"video",action:"plan",input:{script,ratio}}),
    });
    const body=await response.json().catch(()=>({}));
    if(!response.ok||!body.ok)throw new Error(body.error?.message||body.error||"镜头方案没有整理完成。");
    const timeline=artifact<Timeline>(body,"timeline.json");
    const subtitles=artifact<string>(body,"subtitles.srt")||"";
    if(!timeline?.scenes?.length)throw new Error("没有生成可用镜头。");
    if(mounted.current){setPlan(timeline);setSrt(subtitles)}
    return {timeline,subtitles};
  }

  async function planOnly(){
    if(busy||!script.trim())return;
    setBusy(true);
    setMessage("正在理解故事，整理人物、场景和镜头…");
    try{
      const {timeline}=await createPlan();
      setMessage(`已整理 ${timeline.scenes.length} 个镜头。你可以继续补充图片，也可以直接生成视频草片。`);
    }catch(error){
      setMessage(error instanceof Error?error.message:"这次没有整理完成。");
    }finally{setBusy(false)}
  }

  function exportProject(){
    if(!plan)return;
    saveBlob(
      new Blob([JSON.stringify({version:2,timeline:plan},null,2)],{type:"application/json"}),
      "lingxifield-sasi-project.json",
    );
  }

  function exportSrt(){
    if(!srt)return;
    saveBlob(new Blob([srt],{type:"text/plain;charset=utf-8"}),"lingxifield-sasi-subtitles.srt");
  }

  async function ffmpegAssetsReady(){
    for(const url of ["/media/ffmpeg-0.12.10/ffmpeg-core.js","/media/ffmpeg-0.12.10/ffmpeg-core.wasm"]){
      try{
        const r=await fetch(url,{method:"HEAD",cache:"no-store"});
        if(!r.ok&&r.status!==405)return false;
      }catch{return false}
    }
    return true;
  }

  async function renderMp4(timeline:Timeline,token:number){
    if(!(await ffmpegAssetsReady()))throw new Error("MP4_PREPARE_UNAVAILABLE");
    const {FFmpeg}=await import("@ffmpeg/ffmpeg");
    const ffmpeg=new FFmpeg();
    ffmpegRef.current=ffmpeg;
    await ffmpeg.load({
      coreURL:"/media/ffmpeg-0.12.10/ffmpeg-core.js",
      wasmURL:"/media/ffmpeg-0.12.10/ffmpeg-core.wasm",
    });

    const canvas=document.createElement("canvas");
    canvas.width=timeline.width;
    canvas.height=timeline.height;
    const bitmaps=await Promise.all(
      timeline.scenes.map((_,i)=>imageBitmapFor(images.length?images[i%images.length]:undefined)),
    );

    try{
      for(let i=0;i<timeline.scenes.length;i++){
        if(runId.current!==token)throw new Error("CANCELLED");
        const scene=timeline.scenes[i];
        if(mounted.current)setMessage(`正在制作第 ${i+1} / ${timeline.scenes.length} 个镜头…`);
        drawFrame(canvas,scene,.5,bitmaps[i]);
        await ffmpeg.writeFile(`frame-${i}.png`,await canvasPng(canvas));

        let encoded=false;
        for(const codec of ["libx264","mpeg4"]){
          try{
            await ffmpeg.deleteFile(`clip-${i}.mp4`).catch(()=>{});
            const args=[
              "-loop","1","-i",`frame-${i}.png`,
              "-t",String(scene.durationSec),
              "-vf",`scale=${timeline.width}:${timeline.height},fps=24,format=yuv420p`,
              "-an","-c:v",codec,
              ...(codec==="libx264"?["-preset","ultrafast","-crf","23"]:["-q:v","5"]),
              `clip-${i}.mp4`,
            ];
            const exit=await ffmpeg.exec(args,120000);
            if(exit===0){encoded=true;break}
          }catch{}
        }
        if(!encoded)throw new Error("MP4_ENCODE_UNAVAILABLE");
      }

      await ffmpeg.writeFile(
        "timeline.txt",
        timeline.scenes.map((_,i)=>`file 'clip-${i}.mp4'`).join("\n"),
      );
      const concat=await ffmpeg.exec([
        "-f","concat","-safe","0","-i","timeline.txt",
        "-c","copy","-movflags","+faststart","lingxifield-sasi-film.mp4",
      ],120000);
      if(concat!==0)throw new Error("MP4_JOIN_UNAVAILABLE");
      const result=await ffmpeg.readFile("lingxifield-sasi-film.mp4");
      if(!(result instanceof Uint8Array)||!result.length)throw new Error("EMPTY_VIDEO");
      return new Blob([new Uint8Array(result)],{type:"video/mp4"});
    }finally{
      bitmaps.forEach(bitmap=>bitmap?.close());
    }
  }

  async function renderWebm(timeline:Timeline,token:number){
    if(typeof MediaRecorder==="undefined")throw new Error("当前设备暂时无法直接生成视频，请换最新版浏览器后再试。");
    const canvas=document.createElement("canvas");
    canvas.width=timeline.width;
    canvas.height=timeline.height;
    const stream=canvas.captureStream(15);
    const mime=MediaRecorder.isTypeSupported("video/webm;codecs=vp9")?"video/webm;codecs=vp9":"video/webm";
    const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:3_000_000});
    const chunks:BlobPart[]=[];
    recorder.ondataavailable=e=>e.data.size&&chunks.push(e.data);
    const stopped=new Promise<void>(resolve=>recorder.onstop=()=>resolve());
    const bitmaps=await Promise.all(
      timeline.scenes.map((_,i)=>imageBitmapFor(images.length?images[i%images.length]:undefined)),
    );
    recorder.start(500);
    try{
      for(let i=0;i<timeline.scenes.length;i++){
        const scene=timeline.scenes[i],started=performance.now(),duration=Math.max(1600,scene.durationSec*1000);
        if(mounted.current)setMessage(`正在制作第 ${i+1} / ${timeline.scenes.length} 个镜头…`);
        while(performance.now()-started<duration){
          if(runId.current!==token){
            recorder.stop();await stopped;throw new Error("CANCELLED");
          }
          drawFrame(canvas,scene,(performance.now()-started)/duration,bitmaps[i]);
          await new Promise(resolve=>setTimeout(resolve,66));
        }
      }
      recorder.stop();
      await stopped;
      return new Blob(chunks,{type:mime});
    }finally{
      stream.getTracks().forEach(track=>track.stop());
      bitmaps.forEach(bitmap=>bitmap?.close());
    }
  }

  async function render(){
    if(busy||!script.trim())return;
    const token=++runId.current;
    setBusy(true);
    if(output?.url)URL.revokeObjectURL(output.url);
    setOutput(null);
    setMessage("正在把故事整理成可播放的视频…");
    try{
      const current=plan&&plan.ratio===ratio?{timeline:plan,subtitles:srt}:await createPlan();
      let blob:Blob;
      let filename:string;
      try{
        blob=await renderMp4(current.timeline,token);
        filename="lingxifield-sasi-film.mp4";
      }catch(error){
        if(runId.current!==token)throw error;
        ffmpegRef.current?.terminate();
        ffmpegRef.current=null;
        blob=await renderWebm(current.timeline,token);
        filename="lingxifield-sasi-film.webm";
      }
      if(runId.current!==token)throw new Error("CANCELLED");
      const url=URL.createObjectURL(blob);
      if(mounted.current){
        setOutput({url,mime:blob.type,filename,blob});
        setMessage(`视频草片已经完成，共 ${current.timeline.scenes.length} 个镜头。`);
      }
    }catch(error){
      if(mounted.current){
        setMessage(
          runId.current!==token||String(error).includes("CANCELLED")
            ?"已经停止，原内容不会改变。"
            :error instanceof Error?error.message:"这次没有生成完成，请重新尝试。",
        );
      }
    }finally{
      ffmpegRef.current?.terminate();
      ffmpegRef.current=null;
      if(mounted.current)setBusy(false);
    }
  }

  async function saveVideo(){
    if(!output)return;
    setMessage("正在准备保存视频…");
    try{
      const file=new File([output.blob],output.filename,{type:output.mime||"video/mp4"});
      const nav=navigator as Navigator & {
        canShare?: (data:ShareData)=>boolean;
        share?: (data:ShareData)=>Promise<void>;
      };
      if(nav.share&&nav.canShare?.({files:[file]})){
        await nav.share({files:[file],title:"灵犀场 SASI 视频"});
        setMessage("已交给系统保存或分享。");
        return;
      }
    }catch(error){
      if(error instanceof DOMException&&error.name==="AbortError"){
        setMessage("已取消保存。");
        return;
      }
    }

    try{
      clickDownload(output.url,output.filename);
      setMessage(
        isAppleMobile()
          ?"如果没有直接保存，请点“打开视频”，再使用系统菜单保存。"
          :"已开始保存视频。",
      );
    }catch{
      setMessage("当前页面无法直接保存，请点“打开视频”后使用系统菜单保存。");
    }
  }

  function openVideo(){
    if(!output)return;
    const opened=window.open(output.url,"_blank","noopener,noreferrer");
    if(!opened){
      window.location.href=output.url;
    }
    setMessage("视频已打开，可使用设备自带的保存方式。");
  }

  function stop(){
    runId.current++;
    ffmpegRef.current?.terminate();
    ffmpegRef.current=null;
    setBusy(false);
    setMessage("已经停止，原内容不会改变。");
  }

  return <section className="mx-auto max-w-5xl px-5 py-10">
    <div className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 md:p-8">
      <p className="text-sm font-medium text-[var(--lx-accent)]">SASI · 短剧创作</p>
      <h1 className="mt-2 text-3xl font-semibold text-[var(--lx-ink)]">把故事变成镜头、字幕和可播放的视频。</h1>
      <p className="mt-3 max-w-3xl leading-7 text-[var(--lx-muted)]">
        写下故事，SASI 会先理解人物、场景、动作和情绪，再安排镜头与节奏。你也可以加入自己的图片，让草片更接近想要的画面。
      </p>

      <label className="mt-7 block text-sm font-medium text-[var(--lx-ink)]">故事或剧本</label>
      <textarea
        className="mt-2 min-h-56 w-full rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 leading-7 text-[var(--lx-ink)] outline-none"
        value={script}
        onChange={e=>{setScript(e.target.value);setPlan(null)}}
        maxLength={16000}
        placeholder="写下故事、人物和关键情节。"
      />

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="rounded-2xl border border-[var(--lx-line)] p-4 text-sm text-[var(--lx-muted)]">
          成片画幅
          <select
            className="mt-2 block w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-3 text-[var(--lx-ink)]"
            value={ratio}
            onChange={e=>{setRatio(e.target.value as Ratio);setPlan(null)}}
          >
            <option value="9:16">9:16 竖屏</option>
            <option value="16:9">16:9 横屏</option>
            <option value="1:1">1:1 方形</option>
          </select>
        </label>
        <label className="rounded-2xl border border-[var(--lx-line)] p-4 text-sm text-[var(--lx-muted)]">
          参考图片 · 可选
          <input
            className="mt-2 block w-full"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={busy}
            onChange={e=>setImages(Array.from(e.target.files??[]).slice(0,24))}
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button className="rounded-full border border-[var(--lx-line)] px-5 py-3 text-sm" onClick={()=>void planOnly()} disabled={busy||!script.trim()}>
          先看镜头方案
        </button>
        <button className="rounded-full bg-[var(--lx-ink)] px-6 py-3 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40" onClick={()=>void render()} disabled={busy||!script.trim()}>
          {busy?"正在制作…":"生成视频草片"}
        </button>
        {busy&&<button className="rounded-full border border-[var(--lx-line)] px-5 py-3 text-sm" onClick={stop}>停止</button>}
      </div>

      {message&&<p role="status" className="mt-4 text-sm leading-6 text-[var(--lx-muted)]">{message}</p>}

      {plan&&<div className="mt-6 rounded-2xl bg-[var(--lx-soft)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <b className="text-[var(--lx-ink)]">{plan.scenes.length} 个镜头 · 约 {plan.totalDurationSec.toFixed(1)} 秒</b>
          <div className="flex gap-2">
            <button onClick={exportProject} className="rounded-full border border-[var(--lx-line)] px-3 py-1.5 text-xs">保存创作方案</button>
            <button onClick={exportSrt} className="rounded-full border border-[var(--lx-line)] px-3 py-1.5 text-xs">保存字幕</button>
          </div>
        </div>
        <div className="mt-3 max-h-80 space-y-3 overflow-auto text-sm text-[var(--lx-muted)]">
          {plan.scenes.map((scene,i)=><div key={scene.id} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-3">
            <p className="font-medium text-[var(--lx-ink)]">{i+1}. {scene.text}</p>
            <p className="mt-1">{[scene.place,scene.framing,scene.camera,scene.mood].filter(Boolean).join(" · ")}</p>
            {scene.visualIntent&&<p className="mt-1 text-[var(--lx-faint)]">{scene.visualIntent}</p>}
          </div>)}
        </div>
      </div>}

      {output&&<div className="mt-6">
        <video className="max-h-[72vh] w-full rounded-2xl bg-black" src={output.url} controls playsInline preload="metadata"/>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={()=>void saveVideo()} className="rounded-full bg-[var(--lx-ink)] px-6 py-3 text-sm font-medium text-[var(--lx-bg)]">
            保存视频
          </button>
          <button onClick={openVideo} className="rounded-full border border-[var(--lx-line)] px-5 py-3 text-sm text-[var(--lx-ink)]">
            打开视频
          </button>
          <span className="text-xs text-[var(--lx-faint)]">{output.mime.includes("mp4")?"MP4":"WebM"}</span>
        </div>
      </div>}
    </div>
  </section>;
}
