"use client";
import{useEffect,useState}from"react";
import FileDropzone from"@/components/tools/FileDropzone";
import{saveBlob}from"@/lib/tools/autonomous/download-local";
import{ID_PHOTO_PRESETS,presetById}from"@/lib/tools/id-photo/presets";
import{processIdPhoto}from"@/lib/tools/id-photo/browser-processor";
type R={url:string;hdUrl:string;blob:Blob;hdBlob:Blob;width:number;height:number;hdWidth:number;hdHeight:number;faceDetected:boolean;mattingApplied:boolean;quality:string;warnings:string[];rotation:number};
export default function IdPhotoAiWorkbench(){
 const[files,setFiles]=useState<File[]>([]),[preset,setPreset]=useState("cn-1inch"),[background,setBackground]=useState("white"),[zoom,setZoom]=useState(1.15),[x,setX]=useState(0),[y,setY]=useState(0),[busy,setBusy]=useState(false),[result,setResult]=useState<R|null>(null),[error,setError]=useState("");
 useEffect(()=>()=>{if(result){URL.revokeObjectURL(result.url);URL.revokeObjectURL(result.hdUrl)}},[result]);
 async function run(){if(!files[0])return;setBusy(true);setError("");try{
  if(result){URL.revokeObjectURL(result.url);URL.revokeObjectURL(result.hdUrl)}
  const r=await processIdPhoto(files[0],{background,preset:presetById(preset),zoom,offsetX:x,offsetY:y,matting:true});
  setResult({...r,url:URL.createObjectURL(r.blob),hdUrl:URL.createObjectURL(r.hdBlob)});
 }catch(e:any){const c=String(e?.message||"");setError(c.includes("PHOTO_TOO_SMALL")?"照片分辨率太低，建议换一张更清晰的原图。":c.includes("FACE_ANGLE_TOO_LARGE")?"头部倾斜较大，建议换一张面向镜头、头部更端正的照片。":"这张照片暂时没有处理完成，请换一张清晰的正面照片再试。")}finally{setBusy(false)}}
 return <div className="space-y-5">
  <div className="rounded-2xl bg-[var(--lx-soft)] px-4 py-3 text-sm leading-6 text-[var(--lx-muted)]">建议使用清晰、面向镜头、头部基本端正的照片。轻微倾斜会自动扶正，角度过大时会提醒你重新选择。</div>
  <FileDropzone accept="image/*" multiple={false} maxFiles={1} maxSizeMB={15} files={files} onChange={z=>{setFiles(z.slice(0,1));setResult(null)}} disabled={busy} kind="image"/>
  <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-sm">尺寸<select value={preset} onChange={e=>setPreset(e.target.value)} className="w-full rounded-xl border border-[var(--lx-line)] bg-transparent p-3">{ID_PHOTO_PRESETS.map(z=><option key={z.id} value={z.id}>{z.label}</option>)}</select></label><label className="space-y-1 text-sm">人物大小<input type="range" min=".85" max="1.8" step=".03" value={zoom} onChange={e=>setZoom(Number(e.target.value))} className="w-full"/></label><label className="space-y-1 text-sm">左右位置<input type="range" min="-1" max="1" step=".02" value={x} onChange={e=>setX(Number(e.target.value))} className="w-full"/></label><label className="space-y-1 text-sm">上下位置<input type="range" min="-1" max="1" step=".02" value={y} onChange={e=>setY(Number(e.target.value))} className="w-full"/></label></div>
  <div className="flex flex-wrap gap-2">{[["white","白底"],["blue","蓝底"],["red","红底"],["gray","灰底"]].map(([v,n])=><button type="button" key={v} onClick={()=>setBackground(v)} className={`rounded-full px-4 py-2 text-sm ${background===v?"bg-[var(--lx-ink)] text-[var(--lx-bg)]":"border border-[var(--lx-line)]"}`}>{n}</button>)}</div>
  {files[0]&&<button type="button" onClick={run} disabled={busy} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm font-medium text-[var(--lx-bg)]">{busy?"正在整理照片…":"生成证件照"}</button>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{error}</p>}
  {result&&<div className="rounded-2xl border border-[var(--lx-line)] p-4"><img src={result.url} alt="证件照结果" className="mx-auto max-h-[560px] rounded-xl"/><div className="mt-3"><b className="text-sm text-[var(--lx-ink)]">证件照已生成</b><p className="mt-1 text-sm text-[var(--lx-muted)]">需要的话，可以继续调整人物大小和位置。</p></div><div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>saveBlob(result.hdBlob,"lingxifield-id-photo-hd.png")} className="rounded-xl bg-[var(--lx-ink)] px-4 py-2 text-sm text-[var(--lx-bg)]">保存高清照片</button><button onClick={()=>saveBlob(result.blob,"lingxifield-id-photo.png")} className="rounded-xl border border-[var(--lx-line)] px-4 py-2 text-sm">保存标准照片</button><button onClick={()=>setResult(null)} className="rounded-xl border border-[var(--lx-line)] px-4 py-2 text-sm">重新调整</button></div></div>}
  <p className="text-xs leading-5 text-[var(--lx-faint)]">照片在你的浏览器中处理，不会为了“扶正”而重新生成五官。正式提交前，请确认尺寸与照片要求符合目标机构的最新规定。</p>
 </div>
}
