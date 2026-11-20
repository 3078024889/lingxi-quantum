"use client";
import{useEffect,useRef,useState,type PointerEvent}from"react";import ToolUiText,{useToolUiCopy} from "@/components/tools/ToolUiText";
import FileDropzone from"@/components/tools/FileDropzone";import PaidExportButton from"@/components/tools/PaidExportButton";import{downloadBlob}from"@/lib/tools/shared/download";import{ID_PHOTO_PRESETS,presetById}from"@/lib/tools/id-photo/presets";import{processIdPhoto}from"@/lib/tools/id-photo/browser-processor";import{deletePaidTaskDraft,loadPaidTaskDraft,newPaidTaskDraftId,savePaidTaskDraft}from"@/lib/tools/workspace/paid-task-draft";
import {deliveryText} from "@/lib/tools/commerce/delivery-copy";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import ResultFileActions from './ResultFileActions';
type PreviewSettings={preset:string;background:string;zoom:number;x:number;y:number};
type PortraitDrag={pointer:number;x:number;y:number;width:number;height:number;offsetX:number;offsetY:number};
type R={url:string;hdUrl:string;blob:Blob;hdBlob:Blob;width:number;height:number;hdWidth:number;hdHeight:number;faceDetected:boolean;mattingApplied:boolean;quality:string;warnings:string[];rotation:number};
export default function IdPhotoAiWorkbench(){
 const toolUiCopy=useToolUiCopy();

 const {lang}=useLingxiLang();const [delivered,setDelivered]=useState<Blob|null>(null);
 const[files,setFiles]=useState<File[]>([]),[preset,setPreset]=useState("cn-1inch"),[background,setBackground]=useState("white"),[zoom,setZoom]=useState(1.15),[x,setX]=useState(0),[y,setY]=useState(0),[busy,setBusy]=useState(false),[result,setResult]=useState<R|null>(null),[error,setError]=useState(""),[draftId,setDraftId]=useState("");
 const [previewSettings,setPreviewSettings]=useState<PreviewSettings|null>(null);
 const portraitDrag=useRef<PortraitDrag|null>(null);
 const previewCurrent=previewSettings?.preset===preset&&previewSettings.background===background&&
  previewSettings.zoom===zoom&&previewSettings.x===x&&previewSettings.y===y;
 useEffect(()=>()=>{if(result){URL.revokeObjectURL(result.url);URL.revokeObjectURL(result.hdUrl)}},[result]);
 async function build(file:File,opts={preset,background,zoom,x,y}){const r=await processIdPhoto(file,{background:opts.background,preset:presetById(opts.preset),zoom:opts.zoom,offsetX:opts.x,offsetY:opts.y,matting:true});setResult({...r,url:URL.createObjectURL(r.blob),hdUrl:URL.createObjectURL(r.hdBlob)});setPreviewSettings(opts);return r}
 async function run(next:PreviewSettings={preset,background,zoom,x,y}){if(!files[0]||busy)return;setBusy(true);setError("");try{const id=draftId||newPaidTaskDraftId();setDraftId(id);await build(files[0],next);await savePaidTaskDraft({id,toolId:"id-photo-ai",file:files[0],fileName:files[0].name,fileType:files[0].type,state:next})}catch(e:any){const c=String(e?.message||"");setError(c.includes("PHOTO_TOO_SMALL")?"照片分辨率太低，建议换一张更清晰的原图。":c.includes("FACE_ANGLE_TOO_LARGE")?"头部倾斜较大，建议换一张面向镜头、头部更端正的照片。":"这张照片暂时没有处理完成，请换一张清晰的正面照片再试。")}finally{setBusy(false)}}
 useEffect(()=>{const id=new URLSearchParams(location.search).get("resumeDraft")||"";if(!id)return;void(async()=>{const d=await loadPaidTaskDraft<any>(id);if(!d?.file)return;const file=new File([d.file],d.fileName||"photo",{type:d.fileType||"image/png"}),st=d.state||{};setDraftId(id);setFiles([file]);setPreset(st.preset||"cn-1inch");setBackground(st.background||"white");setZoom(Number(st.zoom||1.15));setX(Number(st.x||0));setY(Number(st.y||0));setBusy(true);try{await build(file,{preset:st.preset||"cn-1inch",background:st.background||"white",zoom:Number(st.zoom||1.15),x:Number(st.x||0),y:Number(st.y||0)})}finally{setBusy(false)}})()},[]);
 function startPortraitDrag(event:PointerEvent<HTMLImageElement>){
  if(busy||!previewCurrent||!event.isPrimary||event.button!==0)return;
  const bounds=event.currentTarget.getBoundingClientRect();
  portraitDrag.current={pointer:event.pointerId,x:event.clientX,y:event.clientY,
   width:bounds.width,height:bounds.height,offsetX:x,offsetY:y};
  event.currentTarget.setPointerCapture(event.pointerId);
 }
 function finishPortraitDrag(event:PointerEvent<HTMLImageElement>){
  const start=portraitDrag.current;
  if(!start||start.pointer!==event.pointerId)return;
  portraitDrag.current=null;
  const dx=event.clientX-start.x,dy=event.clientY-start.y;
  if(Math.hypot(dx,dy)<4)return;
  const limit=(value:number)=>Math.max(-1,Math.min(1,value));
  const nextX=limit(start.offsetX-dx/(start.width*.32));
  const nextY=limit(start.offsetY-dy/(start.height*.32));
  if(nextX===x&&nextY===y)return;
  setX(nextX);
  setY(nextY);
  void run({preset,background,zoom,x:nextX,y:nextY});
 }
 async function paidSave(){if(!result)throw new Error("PHOTO_RESULT_MISSING");setDelivered(result.hdBlob);await downloadBlob(result.hdBlob,"lingxifield-id-photo-hd.png")} async function finishPaidSave(){const old=draftId;if(result){URL.revokeObjectURL(result.url);URL.revokeObjectURL(result.hdUrl)}setFiles([]);setResult(null);setDraftId("");if(old)await deletePaidTaskDraft(old)}
 return <div className="space-y-5">{delivered&&<section role="status" className="rounded-2xl border p-4 space-y-3"><p>{deliveryText(lang,"ready")}</p><ResultFileActions blob={delivered} name="lingxifield-id-photo-hd.png"/><button className="rounded-xl border px-4 py-3" onClick={()=>setDelivered(null)}>{deliveryText(lang,"fresh")}</button></section>}<div className="rounded-2xl bg-[var(--lx-soft)] px-4 py-3 text-sm leading-6 text-[var(--lx-muted)]"><ToolUiText text="生成、换底色、尺寸和位置调整可以先免费预览；确认满意后再导出高清照片。" /></div>
  <FileDropzone accept="image/*" multiple={false} maxFiles={1} maxSizeMB={15} files={files} onChange={z=>{setFiles(z.slice(0,1));setResult(null);setDraftId("")}} disabled={busy} kind="image"/>
  <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-sm"><ToolUiText text="尺寸" /><select value={preset} onChange={e=>setPreset(e.target.value)} className="w-full rounded-xl border border-[var(--lx-line)] bg-transparent p-3">{ID_PHOTO_PRESETS.map(z=><option key={z.id} value={z.id}><ToolUiText text={z.label}/></option>)}</select></label><label className="space-y-1 text-sm"><ToolUiText text="人物大小" /><input type="range" min=".85" max="1.8" step=".03" value={zoom} onChange={e=>setZoom(Number(e.target.value))} className="w-full"/></label><label className="space-y-1 text-sm"><ToolUiText text="左右位置" /><input type="range" min="-1" max="1" step=".02" value={x} onChange={e=>setX(Number(e.target.value))} className="w-full"/></label><label className="space-y-1 text-sm"><ToolUiText text="上下位置" /><input type="range" min="-1" max="1" step=".02" value={y} onChange={e=>setY(Number(e.target.value))} className="w-full"/></label></div>
  <div className="flex flex-wrap gap-2">{[["white","白底"],["blue","蓝底"],["red","红底"],["gray","灰底"]].map(([v,n])=><button type="button" key={v} onClick={()=>setBackground(v)} className={`rounded-full px-4 py-2 text-sm ${background===v?"bg-[var(--lx-ink)] text-[var(--lx-bg)]":"border border-[var(--lx-line)]"}`}><ToolUiText text={n}/></button>)}</div>
  {files[0]&&<button type="button" onClick={()=>void run()} disabled={busy} className="rounded-xl border border-[var(--lx-line)] px-5 py-2.5 text-sm font-medium"><ToolUiText text={busy?"正在整理照片…":"免费生成预览"} /></button>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{error}</p>}
  {result&&<div className="rounded-2xl border border-[var(--lx-line)] p-4"><img src={result.url} alt={toolUiCopy("证件照结果")} draggable={false}
   data-testid="id-photo-position-preview" onPointerDown={startPortraitDrag} onPointerUp={finishPortraitDrag}
   onLostPointerCapture={()=>{portraitDrag.current=null}}
   className="mx-auto max-h-[560px] max-w-full select-none rounded-xl"
   style={{cursor:previewCurrent&&!busy?"grab":"default",touchAction:previewCurrent&&!busy?"none":"pan-y"}}
  /><div className="mt-3"><b className="text-sm"><ToolUiText text="证件照预览已生成" /></b><p className="mt-1 text-sm text-[var(--lx-muted)]">{previewCurrent
    ?lang==="zh"?"直接拖动照片移动人物。":"Drag the photo to reposition the subject."
    :lang==="zh"?"设置已调整，请重新生成预览。":"Settings changed. Generate the preview again."}</p></div><div className="mt-3"><PaidExportButton toolId="id-photo-ai" disabled={busy||!previewCurrent} quantity={1} draftId={draftId} metadata={{kind:"id-photo-hd"}} onUnlocked={paidSave} onCompleted={finishPaidSave} label="确认价格并保存高清照片"/></div></div>}
  <p className="text-xs leading-5 text-[var(--lx-faint)]"><ToolUiText text="照片在浏览器中处理。正式提交前，请确认尺寸与照片要求符合目标机构的最新规定。" /></p></div>
}
