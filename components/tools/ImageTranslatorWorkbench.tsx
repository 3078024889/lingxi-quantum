"use client";
import{useEffect,useState}from"react";
import FileDropzone from"@/components/tools/FileDropzone";
import PaidActionButton from"@/components/tools/PaidActionButton";
import ResultPanel from"@/components/tools/ResultPanel";
import type{ToolResultFile}from"@/lib/tools/types";
import{draftFiles,loadPaidTaskDraft,newPaidTaskDraftId,savePaidTaskDraft}from"@/lib/tools/workspace/paid-task-draft";
const LANGS=[["zh","中文"],["en","English"],["ja","日本語"],["ko","한국어"],["fr","Français"],["de","Deutsch"],["es","Español"],["pt","Português"],["ar","العربية"]] as const;

async function translate(text:string,source:string,target:string,quoteId:string){
 if(source===target)return text;
 const r=await fetch("/api/tools/media/translate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text,source,target,quoteId})});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(String(d.error||"TRANSLATE_FAILED"));return String(d.translated||"");
}
function blobOf(c:HTMLCanvasElement){return new Promise<Blob>((resolve,reject)=>c.toBlob(x=>x?resolve(x):reject(new Error("IMAGE_EXPORT_FAILED")),"image/png"))}
function sample(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number){
 const pts=[[x-2,y-2],[x+w+2,y-2],[x-2,y+h+2],[x+w+2,y+h+2]].map(([px,py])=>ctx.getImageData(Math.max(0,Math.min(ctx.canvas.width-1,px)),Math.max(0,Math.min(ctx.canvas.height-1,py)),1,1).data);
 return[0,1,2].map(c=>Math.round(pts.reduce((s,p)=>s+p[c],0)/pts.length));
}
function linesFromBlocks(blocks:any[]){
 const out:any[]=[];
 for(const b of blocks||[])for(const p of b.paragraphs||[])for(const l of p.lines||[])if(l?.text?.trim()&&l?.bbox)out.push({text:String(l.text).trim(),bbox:l.bbox});
 return out;
}
export default function ImageTranslatorWorkbench(){
 const[files,setFiles]=useState<File[]>([]),[source,setSource]=useState("zh"),[target,setTarget]=useState("en"),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState(""),[outputs,setOutputs]=useState<ToolResultFile[]>([]),[draftId,setDraftId]=useState(""),[draftReady,setDraftReady]=useState(false);
 useEffect(()=>{const id=new URLSearchParams(location.search).get("resumeDraft")||"";if(!id){setDraftReady(true);return}void(async()=>{const d=await loadPaidTaskDraft<any>(id),f=draftFiles(d);if(d?.toolId==="image-translator"){setDraftId(id);setFiles(f);setSource(d.state?.source||"zh");setTarget(d.state?.target||"en")}setDraftReady(true)})()},[]);
 useEffect(()=>{if(!draftReady||!files.length)return;const id=draftId||newPaidTaskDraftId();if(!draftId)setDraftId(id);const tm=setTimeout(()=>void savePaidTaskDraft({id,toolId:"image-translator",files,state:{source,target}}),120);return()=>clearTimeout(tm)},[files,source,target,draftId,draftReady]);
 async function run(quoteId:string){
  setBusy(true);setOutputs([]);setError("");
  let worker:any=null;
  try{
   const{createWorker}=await import("tesseract.js");
   const map:Record<string,string>={zh:"chi_sim+eng",en:"eng",ja:"jpn+eng",ko:"kor+eng",fr:"fra+eng",de:"deu+eng",es:"spa+eng",pt:"por+eng",ar:"ara+eng"};
   worker=await createWorker(map[source]||"eng");
   const all:ToolResultFile[]=[];
   for(let i=0;i<files.length;i++){
    const f=files[i];setStage(`${i+1}/${files.length} · 正在识别文字…`);
    const r=await worker.recognize(f,{}, {text:true,blocks:true});
    const lines=linesFromBlocks(r.data.blocks||[]);
    if(!lines.length)throw new Error(`NO_TEXT_FOUND:${f.name}`);
    const bmp=await createImageBitmap(f),c=document.createElement("canvas");c.width=bmp.width;c.height=bmp.height;const ctx=c.getContext("2d")!;ctx.drawImage(bmp,0,0);bmp.close?.();
    for(let j=0;j<lines.length;j++){
      const line=lines[j],b=line.bbox,x=Math.max(0,Math.floor(b.x0)),y=Math.max(0,Math.floor(b.y0)),w=Math.max(4,Math.ceil(b.x1-b.x0)),h=Math.max(4,Math.ceil(b.y1-b.y0));
      setStage(`${i+1}/${files.length} · 正在翻译 ${j+1}/${lines.length}`);
      const tx=await translate(line.text,source,target,quoteId);
      const bg=sample(ctx,x,y,w,h);ctx.fillStyle=`rgb(${bg[0]},${bg[1]},${bg[2]})`;ctx.fillRect(x,y,w,h);
      const lum=(bg[0]*.299+bg[1]*.587+bg[2]*.114);ctx.fillStyle=lum>150?"#111":"#fff";
      let size=Math.max(10,Math.floor(h*.72));ctx.font=`${size}px system-ui, sans-serif`;
      while(size>9&&ctx.measureText(tx).width>w*1.08){size-=1;ctx.font=`${size}px system-ui, sans-serif`}
      ctx.textBaseline="middle";ctx.fillText(tx,x,y+h/2,Math.max(8,w));
    }
    const blob=await blobOf(c);all.push({name:f.name.replace(/\.[^.]+$/,"")+`-${target}.png`,blob,mime:"image/png",size:blob.size});
   }
   setOutputs(all);setStage("处理完成");
  }catch(e){setError(e instanceof Error?e.message:String(e));setStage("")}
  finally{try{await worker?.terminate()}catch{}setBusy(false)}
 }
 return <div className="space-y-4">
  <FileDropzone accept="image/*,.jpg,.jpeg,.png,.webp,.heic" multiple maxFiles={20} maxSizeMB={30} files={files} onChange={f=>{setFiles(f);setOutputs([]);setError("")}} disabled={busy} kind="image"/>
  <div className="grid gap-3 sm:grid-cols-2">
   <label className="text-sm">图片原文<select value={source} onChange={e=>setSource(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2">{LANGS.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>
   <label className="text-sm">翻译为<select value={target} onChange={e=>setTarget(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2">{LANGS.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>
  </div>
  {files.length>0&&!busy&&<PaidActionButton toolId="image-translator" quantity={files.length} draftId={draftId} draftReady={draftReady} metadata={{files:files.length,source,target}} onPaid={run} label={files.length>1?`查看 ${files.length} 张图片翻译价格`:"查看本次图片翻译价格"}/>}
  {busy&&<p className="text-sm text-[var(--lx-muted)]">{stage}</p>}
  <p className="text-xs leading-5 text-[var(--lx-faint)]">先识别图片里的文字，再翻译并尽量按原文字区域覆盖。复杂艺术字、弧形字或低清图片可能需要手动微调。</p>
  {error&&<p role="alert" className="rounded-xl border border-[var(--lx-danger)] p-4 text-sm text-[var(--lx-danger)]">{error}</p>}
  {outputs.length>0&&<ResultPanel sourceSlug="image-translator" files={outputs} messageZh="图片翻译完成，可以保存或继续处理。" messageEn="Image translation is ready."/>}
 </div>
}
