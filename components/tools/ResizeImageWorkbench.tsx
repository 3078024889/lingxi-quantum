"use client";
import EditableNumberInput from "@/components/ui/EditableNumberInput";

import{useEffect,useMemo,useRef,useState,type PointerEvent}from"react";
import{useObjectUrl}from"@/lib/tools/shared/use-object-url";
import FileDropzone from"@/components/tools/FileDropzone";
import ResultPanel from"@/components/tools/ResultPanel";
import{useLingxiLang,type LingxiLang}from"@/lib/lingxi-i18n";
import{toolRuntimeText}from"@/lib/tool-runtime-i18n";
import type{ToolMeta,ToolResultFile}from"@/lib/tools/types";
import{IMAGE_RATIO_PRESETS,IMAGE_SIZE_PRESETS,linkedImageDimensions,ratioForSize}from"@/lib/tools/shared/image-presets";
import{extensionForResizeMime,resizeImagePro,type ResizeFitMode,type ResizeOutputMime}from"@/lib/tools/shared/image-resize-pro";
type Props={tool:ToolMeta};type Source={width:number;height:number};
type DragStart={pointer:number;x:number;y:number;fx:number;fy:number;overflowX:number;overflowY:number};
const DIRECT_DRAG:Record<LingxiLang,[string,string,string]>={
 zh:["直接拖动图片，调整保留的画面。","精细调整（可选）","图片在本机浏览器中处理，生成后确认再保存。"],
 en:["Drag the image to choose what stays in frame.","Fine-tune position (optional)","Your images are processed locally in this browser. Review before saving."],
 ja:["画像をドラッグして切り抜き位置を調整します。","位置を微調整（任意）","画像はこのブラウザ内で処理されます。確認してから保存してください。"],
 ko:["이미지를 드래그하여 남길 영역을 조정하세요.","위치 미세 조정(선택)","이미지는 이 브라우저에서 로컬로 처리됩니다. 확인 후 저장하세요."],
 fr:["Faites glisser l’image pour choisir le cadrage.","Ajuster précisément (facultatif)","Les images sont traitées localement dans ce navigateur. Vérifiez avant d’enregistrer."],
 de:["Bild ziehen, um den Ausschnitt zu wählen.","Position feinjustieren (optional)","Bilder werden lokal im Browser verarbeitet. Vor dem Speichern prüfen."],
 es:["Arrastra la imagen para elegir el encuadre.","Ajustar posición (opcional)","Las imágenes se procesan en este navegador. Revisa antes de guardar."],
 pt:["Arraste a imagem para escolher o enquadramento.","Ajustar posição (opcional)","As imagens são processadas neste navegador. Confira antes de salvar."],
 ar:["اسحب الصورة لاختيار الجزء الظاهر.","ضبط الموضع بدقة (اختياري)","تُعالج الصور محليًا في المتصفح. راجعها قبل الحفظ."]
};const extName=(n:string,e:string)=>`${n.replace(/\.[^.]+$/,"")}.${e}`;
export default function ResizeImageWorkbench({tool}:Props){
 const{lang}=useLingxiLang(),t=(z:string,e:string)=>toolRuntimeText(lang,z,e);
 const[files,setFiles]=useState<File[]>([]),[source,setSource]=useState<Source|null>(null),[width,setWidth]=useState(1200),[height,setHeight]=useState(900),[ratio,setRatio]=useState("4:3"),[fit,setFit]=useState<ResizeFitMode>("smart"),[fx,setFx]=useState(50),[fy,setFy]=useState(50),[bg,setBg]=useState("#ffffff"),[output,setOutput]=useState<ResizeOutputMime>("image/jpeg"),[quality,setQuality]=useState(.92),[upscale,setUpscale]=useState(true),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState(""),[results,setResults]=useState<ToolResultFile[]>([]),[methods,setMethods]=useState<string[]>([]);
 const sourceFile=files[0],previewUrl=useObjectUrl(sourceFile),ratioRef=useRef(ratio);
 const previewDrag=useRef<DragStart|null>(null),settingsVersion=useRef(0),filesVersion=useRef(0);
 ratioRef.current=ratio;
 // A previously generated file must never masquerade as output for changed settings.
 useEffect(()=>{settingsVersion.current++;setResults([]);setMethods([])},[width,height,ratio,fit,fx,fy,bg,output,quality,upscale]);
 useEffect(()=>{let live=true;if(!sourceFile){setSource(null);return}createImageBitmap(sourceFile).then(b=>{if(live){setSource({width:b.width,height:b.height});const r=IMAGE_RATIO_PRESETS.find(x=>x.id===ratioRef.current)?.ratio;if(r){const w=Math.min(2400,b.width);setWidth(w);setHeight(Math.max(1,Math.round(w/r)))}}b.close?.()}).catch(()=>{});return()=>{live=false}},[sourceFile]);
 const ratioValue=IMAGE_RATIO_PRESETS.find(x=>x.id===ratio)?.ratio;
 function chooseRatio(id:string){setRatio(id);const r=IMAGE_RATIO_PRESETS.find(x=>x.id===id)?.ratio;if(r){const d=linkedImageDimensions('width',width,r);setWidth(d.width);setHeight(d.height)}}
 function w(v:number){if(ratioValue){const d=linkedImageDimensions('width',v,ratioValue);setWidth(d.width);setHeight(d.height)}else setWidth(Math.max(1,Math.min(16384,v||1)))}
 function h(v:number){if(ratioValue){const d=linkedImageDimensions('height',v,ratioValue);setWidth(d.width);setHeight(d.height)}else setHeight(Math.max(1,Math.min(16384,v||1)))}
 function startDrag(e:PointerEvent<HTMLDivElement>){
  if(fit!=="cover"||!source||!previewUrl||busy||!e.isPrimary||e.button!==0)return;
  const box=e.currentTarget.getBoundingClientRect();
  const zoom=Math.max(box.width/source.width,box.height/source.height);
  previewDrag.current={pointer:e.pointerId,x:e.clientX,y:e.clientY,fx,fy,
   overflowX:Math.max(0,source.width*zoom-box.width),overflowY:Math.max(0,source.height*zoom-box.height)};
  e.currentTarget.setPointerCapture(e.pointerId);
  e.preventDefault();
 }
 function moveDrag(e:PointerEvent<HTMLDivElement>){
  const d=previewDrag.current;if(!d||d.pointer!==e.pointerId||fit!=="cover"||busy)return;
  const clamp=(v:number)=>Math.max(0,Math.min(100,Math.round(v)));
  if(d.overflowX>0.5)setFx(clamp(d.fx-(e.clientX-d.x)*100/d.overflowX));
  if(d.overflowY>0.5)setFy(clamp(d.fy-(e.clientY-d.y)*100/d.overflowY));
 }
 function finishDrag(e:PointerEvent<HTMLDivElement>){
  const d=previewDrag.current;if(!d||d.pointer!==e.pointerId)return;
  previewDrag.current=null;
  if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
 }
 async function run(){if(!files.length||busy)return;
  const startSettings=settingsVersion.current,startFiles=filesVersion.current;
  setBusy(true);setError("");setResults([]);setMethods([]);try{const out:ToolResultFile[]=[],ms:string[]=[];for(let i=0;i<files.length;i++){const f=files[i];setStage(`${t("处理中","Processing")} ${i+1}/${files.length} · ${f.name}`);const r=await resizeImagePro(f,{width,height,fit,focusX:fx,focusY:fy,background:bg,output,quality,allowUpscale:upscale});out.push({name:extName(f.name,extensionForResizeMime(output)),blob:r.blob,mime:output,size:r.blob.size});ms.push(r.cropMethod||fit)}if(startSettings===settingsVersion.current&&startFiles===filesVersion.current){setResults(out);setMethods(ms)}setStage("")}catch(e){setError(e instanceof Error&&/^IMAGE_DIMENSIONS_/.test(e.message)?t("尺寸过大或无效，请降低宽度或高度。","Dimensions are too large or invalid. Reduce the width or height."):e instanceof Error?e.message:String(e));setStage("")}finally{setBusy(false)}}
 const preview=useMemo(()=>{
  const base={objectFit:fit==="stretch"?"fill":fit==="contain"?"contain":"cover",objectPosition:`${fx}% ${fy}%`,backgroundColor:bg} as const;
  if(upscale||!source)return base;
  const sw=source.width,sh=source.height;
  let dw=width,dh=height;
  if(fit==='stretch'){dw=Math.min(width,sw);dh=Math.min(height,sh)}
  else if(fit==='contain'){const scale=Math.min(width/sw,height/sh,1);dw=sw*scale;dh=sh*scale}
  else{const scale=Math.max(width/sw,height/sh);if(scale>1){dw=width/scale;dh=height/scale}}
  return {...base,width:`${dw/width*100}%`,height:`${dh/height*100}%`,position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)'} as const;
 },[fit,fx,fy,bg,source,width,height,upscale]);
 return <div className="space-y-5">
  <FileDropzone accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" multiple append maxFiles={20} maxSizeMB={80} files={files} onChange={f=>{filesVersion.current++;setFiles(f);setResults([]);setError("")}} disabled={busy} kind="image"/>
  {files.length>0&&<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]"><div className="space-y-5">
   <section className="rounded-xl border border-white/10 p-4"><div className="mb-3 flex flex-wrap justify-between gap-2"><div><h3 className="font-medium text-bone">{t("先选比例","Choose aspect ratio")}</h3><p className="mt-1 text-xs text-bone-dim">{t("比例决定画面形状；像素决定最终分辨率。","Ratio controls shape; pixels control resolution.")}</p></div>{source&&<span className="text-xs text-bone-dim">{t("原图","Source")} {source.width}×{source.height}</span>}</div><div className="flex flex-wrap gap-2">{IMAGE_RATIO_PRESETS.map(p=><button key={p.id} onClick={()=>chooseRatio(p.id)} disabled={busy} type="button" className={`rounded-full border px-3 py-1.5 text-xs ${ratio===p.id?"border-lattice bg-lattice/15 text-bone":"border-white/10 text-bone-dim"}`}>{lang==="zh"?p.labelZh:p.labelEn}</button>)}</div></section>
   <section className="rounded-xl border border-white/10 p-4"><h3 className="font-medium text-bone">{t("常用尺寸","Common sizes")}</h3><div className="mt-3 flex flex-wrap gap-2">{IMAGE_SIZE_PRESETS.map(p=><button key={p.id} onClick={()=>{setWidth(p.width);setHeight(p.height);setRatio(ratioForSize(p.width,p.height))}} disabled={busy} type="button" className="rounded-lg border border-white/10 px-3 py-2 text-left text-xs text-bone-dim hover:border-lattice/50"><span className="block text-[10px] opacity-60">{lang==="zh"?p.groupZh:p.groupEn}</span>{p.label}</button>)}</div></section>
   <section className="rounded-xl border border-white/10 p-4"><div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]"><label className="text-sm text-bone-dim">{t("宽度 px","Width px")}<EditableNumberInput disabled={busy} type="number" value={width} onChange={e=>w(Number(e.target.value))} className="bg-void mt-1 w-full rounded-lg border border-white/15 px-3 py-2 text-bone"/></label><button disabled={busy} type="button" onClick={()=>{const a=width;setWidth(height);setHeight(a);setRatio(ratioForSize(height,a))}} className="mt-6 h-10 rounded-lg border border-white/10 px-3 text-bone-dim">↔</button><label className="text-sm text-bone-dim">{t("高度 px","Height px")}<EditableNumberInput disabled={busy} type="number" value={height} onChange={e=>h(Number(e.target.value))} className="bg-void mt-1 w-full rounded-lg border border-white/15 px-3 py-2 text-bone"/></label></div></section>
   <section className="rounded-xl border border-white/10 p-4"><h3 className="font-medium text-bone">{t("怎样适配新比例","How should it fit?")}</h3><div className="mt-3 grid gap-2 md:grid-cols-4">{([["smart",t("智能裁切","Smart crop"),t("逐张分析主体；可用时优先保护人脸","Analyzes each image; protects faces when available")],["cover",t("手动裁切","Manual crop"),t("保持比例，用焦点决定保留位置","Keeps ratio; focus controls the crop")],["contain",t("完整留白","Fit + padding"),t("不裁图片，空处补背景","No crop; pads empty space")],["stretch",t("拉伸填满","Stretch"),t("不裁切，但可能变形","No crop; may distort")]] as const).map(([id,a,b])=><button key={id} type="button" onClick={()=>setFit(id)} disabled={busy} className={`rounded-lg border p-3 text-left ${fit===id?"border-lattice bg-lattice/10":"border-white/10"}`}><span className="block text-sm text-bone">{a}</span><span className="mt-1 block text-xs leading-5 text-bone-dim">{b}</span></button>)}</div>
   {fit==="cover"&&<details data-testid="resize-focus-fine-tune" className="mt-4 text-sm text-bone-dim"><summary className="cursor-pointer">{DIRECT_DRAG[lang][1]}</summary><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-sm">{t("左右焦点","Horizontal focus")} {fx}%<input disabled={busy} className="mt-2 w-full" type="range" min={0} max={100} value={fx} onChange={e=>setFx(Number(e.target.value))}/></label><label className="text-sm">{t("上下焦点","Vertical focus")} {fy}%<input disabled={busy} className="mt-2 w-full" type="range" min={0} max={100} value={fy} onChange={e=>setFy(Number(e.target.value))}/></label></div></details>}
   {fit==="smart"&&<p className="mt-3 rounded-lg bg-[var(--lx-soft)] p-3 text-xs leading-5 text-bone-dim">{t("智能裁切不是固定居中：会分析边缘、细节、颜色与肤色倾向；浏览器支持原生人脸检测时再把人脸加入保护权重。批量时每张图单独计算。","Smart crop is not fixed-center: it scores edges, detail, color and skin-tone cues; native face detection is added when the browser provides it. Each batch image is analyzed separately.")}</p>}
   {fit==="contain"&&<label className="mt-4 flex items-center gap-3 text-sm text-bone-dim">{t("补边颜色","Padding color")}<input disabled={busy} type="color" value={bg} onChange={e=>setBg(e.target.value)}/><span className="font-mono text-xs">{bg}</span></label>}</section>
   <section className="rounded-xl border border-white/10 p-4"><div className="grid gap-4 sm:grid-cols-3"><label className="text-sm text-bone-dim">{t("输出格式","Output format")}<select disabled={busy} value={output} onChange={e=>setOutput(e.target.value as ResizeOutputMime)} className="bg-void mt-1 w-full rounded-lg border border-white/15 px-3 py-2 text-bone"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label>{output!=="image/png"&&<label className="text-sm text-bone-dim">{t("质量","Quality")} {Math.round(quality*100)}%<input disabled={busy} className="mt-3 w-full" type="range" min={.4} max={1} step={.01} value={quality} onChange={e=>setQuality(Number(e.target.value))}/></label>}<label className="mt-6 flex items-center gap-2 text-sm text-bone-dim"><input disabled={busy} type="checkbox" checked={upscale} onChange={e=>setUpscale(e.target.checked)}/>{t("允许放大","Allow enlargement")}</label></div></section>
  </div><aside className="space-y-3"><div className="rounded-xl border border-white/10 p-3"><div className="mb-2 flex justify-between text-xs text-bone-dim"><span>{t("构图预览","Composition preview")}</span><span>{width}×{height}</span></div><div data-testid="resize-drag-preview" data-fit={fit} data-focus-x={fx} data-focus-y={fy} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={()=>{previewDrag.current=null}} className="relative mx-auto overflow-hidden rounded-lg border border-white/10" style={{backgroundColor:bg,aspectRatio:`${width}/${height}`,maxHeight:440,touchAction:fit==="cover"?"none":"pan-y pinch-zoom",cursor:fit==="cover"?"grab":"auto"}}>{previewUrl&&<img src={previewUrl} alt="" draggable={false} className="pointer-events-none h-full w-full select-none" style={preview}/>}</div><p className="mt-2 text-xs leading-5 text-bone-dim">{fit==="smart"?t("最终智能裁切在处理时逐张计算；这里显示目标比例。","The final smart crop is computed per image when processing; this shows the target ratio."):fit==="cover"?DIRECT_DRAG[lang][0]:fit==="contain"?t("整图保留并补边。","Keeps the full image with padding."):t("整图拉伸到目标宽高。","Stretches to the target size.")}</p><p className="mt-2 text-xs leading-5 text-bone-dim">{DIRECT_DRAG[lang][2]}</p></div></aside></div>}
  {files.length>0&&<div className="flex flex-wrap items-center gap-3"><button disabled={busy} onClick={run} className="rounded-xl bg-lattice px-5 py-3 text-sm font-medium text-void-deep disabled:opacity-40">{busy?t("处理中…","Processing…"):t(`处理 ${files.length} 张图片`,`Process ${files.length} image(s)`)}</button><button disabled={busy} onClick={()=>{filesVersion.current++;setFiles([]);setResults([])}} className="rounded-xl border border-white/10 px-4 py-3 text-sm text-bone-dim">{t("清空","Clear")}</button>{stage&&<span className="text-xs text-bone-dim">{stage}</span>}</div>}
  {!!results.length&&<ResultPanel sourceSlug={tool.slug} files={results} messageZh={`已按 ${width}×${height} 处理 ${results.length} 张图片。`} messageEn={`Processed ${results.length} image(s) at ${width}×${height}.`} details={{files:results.length,width,height,ratio,fit,format:output,cropMethods:[...new Set(methods)].join(",")}}/>}{error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{error}</p>}
 </div>
}
