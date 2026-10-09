"use client";
import{PointerEvent,useEffect,useRef,useState}from"react";
import FileDropzone from"@/components/tools/FileDropzone";
import PaidActionButton from"@/components/tools/PaidActionButton";
import{localInpaint,localInpaintMask,type NormalizedBox,type NormalizedPoint,type NormalizedStroke}from"@/lib/tools/autonomous/image-local";
import{saveBlob}from"@/lib/tools/autonomous/download-local";
import{draftFiles,loadPaidTaskDraft,newPaidTaskDraftId,savePaidTaskDraft}from"@/lib/tools/workspace/paid-task-draft";
import{useLingxiLang}from"@/lib/lingxi-i18n";
import{toolRuntimeText}from"@/lib/tool-runtime-i18n";

const initial:NormalizedBox={x:.65,y:.72,w:.28,h:.18};

function BoxSelector({file,box,onChange}:{file:File;box:NormalizedBox;onChange:(b:NormalizedBox)=>void}){
 const ref=useRef<HTMLDivElement>(null),[start,setStart]=useState<{x:number;y:number}|null>(null),[src,setSrc]=useState("");
 useEffect(()=>{const u=URL.createObjectURL(file);setSrc(u);return()=>URL.revokeObjectURL(u)},[file]);
 const point=(e:PointerEvent)=>{const r=ref.current!.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}};
 return <div ref={ref} className="relative mx-auto mt-4 w-fit max-w-full touch-none overflow-hidden rounded-2xl" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);const p=point(e);setStart(p);onChange({...p,w:0,h:0})}} onPointerMove={e=>{if(!start)return;const p=point(e);onChange({x:Math.min(start.x,p.x),y:Math.min(start.y,p.y),w:Math.abs(start.x-p.x),h:Math.abs(start.y-p.y)})}} onPointerUp={()=>setStart(null)} onPointerCancel={()=>setStart(null)}>
  {src&&<img src={src} alt="" className="block max-h-[560px] max-w-full select-none"/>}
  <div className="pointer-events-none absolute border-2 border-rose-500 bg-rose-500/15" style={{left:`${box.x*100}%`,top:`${box.y*100}%`,width:`${box.w*100}%`,height:`${box.h*100}%`}}/>
 </div>
}

function BrushSelector({file,strokes,onChange}:{file:File;strokes:NormalizedStroke[];onChange:(rows:NormalizedStroke[])=>void}){
 const ref=useRef<HTMLDivElement>(null),active=useRef<number|null>(null),[src,setSrc]=useState(""),[brush,setBrush]=useState(22);
 useEffect(()=>{const u=URL.createObjectURL(file);setSrc(u);return()=>URL.revokeObjectURL(u)},[file]);
 const point=(e:PointerEvent):NormalizedPoint=>{const r=ref.current!.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}};
 function addPoint(e:PointerEvent){if(active.current!==e.pointerId)return;const p=point(e);onChange(strokes.map((s,i)=>i===strokes.length-1?{...s,points:[...s.points,p]}:s))}
 return <div className="space-y-3">
  <div ref={ref} className="relative mx-auto mt-4 w-fit max-w-full touch-none overflow-hidden rounded-2xl border" onPointerDown={e=>{if(active.current!==null)return;active.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);onChange([...strokes,{radius:brush/1000,points:[point(e)]}])}} onPointerMove={addPoint} onPointerUp={e=>{addPoint(e);active.current=null}} onPointerCancel={()=>{active.current=null}}>
   {src&&<img src={src} alt="" className="block max-h-[560px] max-w-full select-none"/>}
   <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
    {strokes.map((stroke,i)=><polyline key={i} points={stroke.points.map(p=>`${p.x*1000},${p.y*1000}`).join(" ")} fill="none" stroke="rgba(244,63,94,.55)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={Math.max(4,stroke.radius*2000)}/>)}
   </svg>
  </div>
  <div className="flex flex-wrap items-center gap-3">
   <label className="text-sm">画笔大小 <input aria-label="Brush size" type="range" min="6" max="60" value={brush} onChange={e=>setBrush(Number(e.target.value))}/></label>
   <button type="button" disabled={!strokes.length} onClick={()=>onChange(strokes.slice(0,-1))} className="rounded-xl border px-3 py-2 text-sm">撤销一笔</button>
   <button type="button" disabled={!strokes.length} onClick={()=>onChange([])} className="rounded-xl border px-3 py-2 text-sm">清空选区</button>
  </div>
 </div>
}

export default function ImageWatermarkWorkbench({batch=false}:{batch?:boolean}){
 const{lang}=useLingxiLang(),t=(zh:string,en:string)=>toolRuntimeText(lang,zh,en);
 const toolId=batch?"batch-image-watermark-remover":"image-watermark-remover";
 const[files,setFiles]=useState<File[]>([]),[box,setBox]=useState(initial),[strokes,setStrokes]=useState<NormalizedStroke[]>([]);
 const[mode,setMode]=useState<"brush"|"box">(batch?"box":"brush"),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const[results,setResults]=useState<Array<{name:string;blob:Blob;url:string}>>([]),[draftId,setDraftId]=useState(""),[draftReady,setDraftReady]=useState(false);

 useEffect(()=>{const id=new URLSearchParams(location.search).get("resumeDraft")||"";if(!id){setDraftReady(true);return}void(async()=>{const d=await loadPaidTaskDraft<any>(id),f=draftFiles(d);if(d?.toolId===toolId){setDraftId(id);setFiles(f);if(d.state?.box)setBox(d.state.box);if(Array.isArray(d.state?.strokes))setStrokes(d.state.strokes);if(d.state?.mode==="brush"||d.state?.mode==="box")setMode(batch?"box":d.state.mode)}setDraftReady(true)})()},[toolId,batch]);
 useEffect(()=>{if(!draftReady||!files.length)return;const id=draftId||newPaidTaskDraftId();if(!draftId)setDraftId(id);const tm=setTimeout(()=>void savePaidTaskDraft({id,toolId,files,state:{box,strokes,mode,batch}}),120);return()=>clearTimeout(tm)},[files,box,strokes,mode,batch,draftId,draftReady,toolId]);
 useEffect(()=>()=>{for(const r of results)URL.revokeObjectURL(r.url)},[results]);

 const selectionReady=mode==="brush"?strokes.some(s=>s.points.length>0):box.w>=.01&&box.h>=.01;
 async function run(){
  if(!selectionReady)return;setBusy(true);setError("");
  try{
   for(const r of results)URL.revokeObjectURL(r.url);
   const out=[] as Array<{name:string;blob:Blob;url:string}>;
   for(const file of files){
    const blob=mode==="brush"?await localInpaintMask(file,strokes):await localInpaint(file,box);
    out.push({name:file.name,blob,url:URL.createObjectURL(blob)});
   }
   setResults(out);
  }catch{
   setError(t("这次没有完成修复。请缩小选区，或分几次处理复杂区域。","Cleanup could not finish. Use a smaller selection or repair complex areas in several passes."));
  }finally{setBusy(false)}
 }

 return <div className="space-y-4">
  <FileDropzone accept="image/*" multiple={batch} maxFiles={batch?20:1} maxSizeMB={30} files={files} onChange={rows=>{setFiles(rows);setResults([]);setDraftId("");setStrokes([])}} disabled={busy} kind="image"/>
  {files[0]&&<>
   {!batch&&<div className="flex flex-wrap gap-2"><button type="button" onClick={()=>setMode("brush")} className={`rounded-xl border px-4 py-2 text-sm ${mode==="brush"?"bg-[var(--lx-soft)]":""}`}>{t("精细画笔","Precision brush")}</button><button type="button" onClick={()=>setMode("box")} className={`rounded-xl border px-4 py-2 text-sm ${mode==="box"?"bg-[var(--lx-soft)]":""}`}>{t("快速框选","Quick box")}</button></div>}
   <p className="text-sm text-[var(--lx-muted)]">{mode==="brush"?t("用画笔只涂住水印本身，可撤销或分多笔选择；选区越准确，修复越自然。","Paint only over the watermark. Smaller, precise masks usually produce cleaner repairs."):t(batch?"在第一张图上框出水印区域，相同位置会用于整批图片。":"拖动框出要移除的区域；适合纯色或简单背景。",batch?"Draw the watermark area on the first image; the same position is used for the batch.":"Draw a box around the area to remove; best for simple backgrounds.")}</p>
   {mode==="brush"?<BrushSelector file={files[0]} strokes={strokes} onChange={setStrokes}/>:<BoxSelector file={files[0]} box={box} onChange={setBox}/>}
  </>}
  {files.length>0&&selectionReady&&draftReady&&<PaidActionButton toolId={toolId} quantity={files.length} draftId={draftId} draftReady={draftReady} metadata={{mode:"local",selectionMode:mode,box,strokes:mode==="brush"?strokes.length:0}} onPaid={run} label={t("查看本次价格","See price")}/>}
  {busy&&<p className="text-sm text-[var(--lx-muted)]">{t("正在根据选区修复画面…","Repairing the selected area…")}</p>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{error}</p>}
  {results.length>0&&<div className="grid gap-4 sm:grid-cols-2">{results.map((r,i)=><div key={r.name+i} className="rounded-2xl border p-3"><img src={r.url} alt={t("处理结果","Result")} className="w-full rounded-xl"/><button type="button" onClick={()=>saveBlob(r.blob,`clean-${r.name.replace(/\.[^.]+$/,".png")}`)} className="mt-3 rounded-xl bg-[var(--lx-ink)] px-4 py-2 text-sm text-[var(--lx-bg)]">{t("保存结果","Save result")}</button></div>)}</div>}
 </div>;
}
