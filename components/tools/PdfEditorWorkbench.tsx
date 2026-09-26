"use client";

import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {PDFDocument,rgb,degrees} from "pdf-lib";
import {openPdf,renderPdfPage} from "@/lib/tools/pdf-render-client";
import {pdfExportPrice} from "@/lib/tools/export-pricing";
import PaidExportButton from "@/components/tools/PaidExportButton";

type Overlay={
  id:number;kind:"text"|"cover"|"image";page:number;
  x:number;y:number;w:number;h:number;
  text?:string;size?:number;data?:string;
};
type DragState={id:number;startX:number;startY:number;originX:number;originY:number;rect:DOMRect}|null;

function readData(file:File){return new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error("图片读取失败"));r.readAsDataURL(file)})}
function pagesFrom(s:string,max:number){
  if(!s.trim())return Array.from({length:max},(_,i)=>i+1);
  const out=new Set<number>();
  for(const part of s.split(",")){
    if(part.includes("-")){
      const[a,b]=part.split("-").map(Number);
      for(let i=Math.max(1,a);i<=Math.min(max,b);i++)out.add(i);
    }else{
      const n=Number(part);if(n>=1&&n<=max)out.add(n);
    }
  }
  return [...out].sort((a,b)=>a-b);
}
async function transparentWhite(data:string){
  const im=await new Promise<HTMLImageElement>((res,rej)=>{const x=new Image();x.onload=()=>res(x);x.onerror=()=>rej(new Error("印章图片读取失败"));x.src=data});
  const c=document.createElement("canvas");c.width=im.naturalWidth;c.height=im.naturalHeight;
  const ctx=c.getContext("2d");if(!ctx)throw new Error("当前设备无法处理这张图片");
  ctx.drawImage(im,0,0);
  const d=ctx.getImageData(0,0,c.width,c.height);
  for(let i=0;i<d.data.length;i+=4){const r=d.data[i],g=d.data[i+1],b=d.data[i+2];if(r>235&&g>235&&b>235)d.data[i+3]=0}
  ctx.putImageData(d,0,0);return c.toDataURL("image/png");
}
async function textPng(text:string,size=28){
  const c=document.createElement("canvas"),ctx=c.getContext("2d");if(!ctx)throw new Error("当前设备无法渲染文字");
  ctx.font=`${size}px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif`;
  const m=ctx.measureText(text);c.width=Math.max(32,Math.ceil(m.width+20));c.height=Math.max(40,Math.ceil(size*1.7));
  const x=c.getContext("2d")!;x.font=ctx.font;x.fillStyle="#142033";x.textBaseline="middle";x.fillText(text,10,c.height/2);
  return await new Promise<Uint8Array>((res,rej)=>c.toBlob(async b=>b?res(new Uint8Array(await b.arrayBuffer())):rej(new Error("文字渲染失败")),"image/png"));
}
function blobBytes(bytes:Uint8Array){
  const copy=new Uint8Array(bytes.length);copy.set(bytes);
  return new Blob([copy.buffer],{type:"application/pdf"});
}
function isMiniWebView(){
  try{return new URLSearchParams(location.search).get("mini")==="1"&&/MicroMessenger/i.test(navigator.userAgent||"")}catch{return false}
}
function savePdf(blob:Blob,name:string){
  const url=URL.createObjectURL(blob);
  // WeChat WebView often ignores download=. Open the generated PDF so the user can use the native share/save menu.
  if(isMiniWebView()){
    window.open(url,"_blank");
    setTimeout(()=>URL.revokeObjectURL(url),60_000);
    return;
  }
  const a=document.createElement("a");a.href=url;a.download=name;a.rel="noopener";document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),4000);
}

export default function PdfEditorWorkbench({signingOnly=false}:{signingOnly?:boolean}){
  const[file,setFile]=useState<File|null>(null);
  const[pages,setPages]=useState(0);
  const[overlays,setOverlays]=useState<Overlay[]>([]);
  const[selectedPage,setSelectedPage]=useState(1);
  const[text,setText]=useState("");
  const[busy,setBusy]=useState(false);
  const[error,setError]=useState("");
  const[pageRange,setPageRange]=useState("");
  const[stamp,setStamp]=useState("");
  const[seamSide,setSeamSide]=useState<"right"|"left"|"top"|"bottom">("right");
  const[pageImage,setPageImage]=useState("");
  const[previewImages,setPreviewImages]=useState<string[]>([]);
  const[previewNote,setPreviewNote]=useState("");
  const[rendering,setRendering]=useState(false);
  const[drag,setDrag]=useState<DragState>(null);
  const stageRef=useRef<HTMLDivElement|null>(null);

  const exportPages=pagesFrom(pageRange,pages).length||pages;
  const price=useMemo(()=>pdfExportPrice(Math.max(1,exportPages)),[exportPages]);
  const visible=overlays.filter(o=>o.page===selectedPage);

  const renderSourcePage=useCallback(async(f:File,pageNumber:number)=>{
    setRendering(true);
    try{
      const pdf=await openPdf(f);
      const rendered=await renderPdfPage(pdf,pageNumber,1.55);
      setPageImage(rendered.canvas.toDataURL("image/jpeg",.9));
    }catch(e){
      setPageImage("");
      setError(e instanceof Error?e.message:"这一页暂时无法显示");
    }finally{setRendering(false)}
  },[]);

  async function load(f:File){
    if(f.type&&f.type!=="application/pdf"){setError("请选择 PDF 文件");return}
    setBusy(true);setError("");setPreviewImages([]);setOverlays([]);
    try{
      const d=await PDFDocument.load(await f.arrayBuffer());
      const count=d.getPageCount();
      setFile(f);setPages(count);setSelectedPage(1);setPageRange(`1-${count}`);
      await renderSourcePage(f,1);
    }catch(e){setFile(null);setPages(0);setPageImage("");setError(e instanceof Error?e.message:"这个 PDF 暂时无法读取")}
    finally{setBusy(false)}
  }

  useEffect(()=>{if(file)void renderSourcePage(file,selectedPage)},[file,selectedPage,renderSourcePage]);

  function patch(id:number,k:Partial<Overlay>){setOverlays(v=>v.map(o=>o.id===id?{...o,...k}:o))}
  function addText(){
    const value=text.trim();if(!value)return;
    setOverlays(v=>[...v,{id:Date.now(),kind:"text",page:selectedPage,x:10,y:12,w:55,h:9,text:value,size:14}]);setText("");
  }
  function addCover(){setOverlays(v=>[...v,{id:Date.now(),kind:"cover",page:selectedPage,x:10,y:12,w:35,h:8}])}
  async function addImage(f:File,asStamp=false){
    setError("");
    try{
      let data=await readData(f);
      if(asStamp)data=await transparentWhite(data);
      if(asStamp)setStamp(data);
      setOverlays(v=>[...v,{id:Date.now(),kind:"image",page:selectedPage,x:68,y:62,w:22,h:22,data}]);
    }catch(e){setError(e instanceof Error?e.message:"图片没有添加成功")}
  }

  async function seam(){
    if(!stamp)return;
    const selected=pagesFrom(pageRange,pages);if(!selected.length)return;
    const img=await new Promise<HTMLImageElement>((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=stamp});
    const pieces:string[]=[];const horizontal=seamSide==="top"||seamSide==="bottom";
    for(let i=0;i<selected.length;i++){
      const c=document.createElement("canvas"),ctx=c.getContext("2d");if(!ctx)continue;
      if(horizontal){
        const sy=Math.floor(img.naturalHeight*i/selected.length),ey=Math.floor(img.naturalHeight*(i+1)/selected.length),sh=Math.max(1,ey-sy);
        c.width=img.naturalWidth;c.height=sh;ctx.drawImage(img,0,sy,img.naturalWidth,sh,0,0,img.naturalWidth,sh);
      }else{
        const sx=Math.floor(img.naturalWidth*i/selected.length),ex=Math.floor(img.naturalWidth*(i+1)/selected.length),sw=Math.max(1,ex-sx);
        c.width=sw;c.height=img.naturalHeight;ctx.drawImage(img,sx,0,sw,img.naturalHeight,0,0,sw,img.naturalHeight);
      }
      pieces.push(c.toDataURL("image/png"));
    }
    setOverlays(v=>[...v,...pieces.map((data,i)=>({
      id:Date.now()+i,kind:"image" as const,page:selected[i],
      x:seamSide==="right"?94:seamSide==="left"?1:24,
      y:seamSide==="bottom"?94:seamSide==="top"?1:22,
      w:horizontal?52:5,h:horizontal?5:56,data,
    }))]);
  }

  async function build(){
    if(!file)throw new Error("请先上传 PDF");
    const doc=await PDFDocument.load(await file.arrayBuffer());
    for(const o of overlays){
      const p=doc.getPage(o.page-1);if(!p)continue;
      const W=p.getWidth(),H=p.getHeight(),x=W*o.x/100,y=H-(H*o.y/100)-(H*o.h/100),w=W*o.w/100,h=H*o.h/100;
      if(o.kind==="cover")p.drawRectangle({x,y,width:w,height:h,color:rgb(1,1,1)});
      else if(o.kind==="text"){
        const png=await doc.embedPng(await textPng(o.text||"",Math.max(18,(o.size||14)*2)));
        const ratio=png.width/png.height,dh=Math.min(h,Math.max(10,w/ratio));
        p.drawImage(png,{x,y:y+(h-dh)/2,width:Math.min(w,dh*ratio),height:dh});
      }else if(o.kind==="image"&&o.data){
        const bytes=Uint8Array.from(atob(o.data.split(",")[1]),c=>c.charCodeAt(0));
        const img=o.data.startsWith("data:image/png")?await doc.embedPng(bytes):await doc.embedJpg(bytes);
        p.drawImage(img,{x,y,width:w,height:h});
      }
    }
    const ids=pagesFrom(pageRange,doc.getPageCount()).map(n=>n-1);
    if(ids.length!==doc.getPageCount()){
      const out=await PDFDocument.create();for(const p of await out.copyPages(doc,ids))out.addPage(p);return new Uint8Array(await out.save());
    }
    return new Uint8Array(await doc.save());
  }

  async function previewNow(){
    setBusy(true);setError("");setPreviewImages([]);setPreviewNote("");
    try{
      const bytes=await build();
      const previewFile=new File([blobBytes(bytes)],"preview.pdf",{type:"application/pdf"});
      const pdf=await openPdf(previewFile);
      const limit=Math.min(pdf.numPages,12);
      const images:string[]=[];
      for(let i=1;i<=limit;i++){
        const page=await renderPdfPage(pdf,i,1.2);
        images.push(page.canvas.toDataURL("image/jpeg",.84));
      }
      setPreviewImages(images);
      setPreviewNote(pdf.numPages>limit?`已显示前 ${limit} 页；导出仍包含你选择的全部 ${pdf.numPages} 页。`:`预览共 ${pdf.numPages} 页。`);
      setTimeout(()=>document.getElementById("lx-pdf-free-preview")?.scrollIntoView({behavior:"smooth",block:"start"}),60);
    }catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setBusy(false)}
  }

  async function exportNow(){
    setBusy(true);setError("");
    try{
      const bytes=await build();
      savePdf(blobBytes(bytes),`lingxifield-${file?.name||"edited.pdf"}`);
    }catch(e){setError(e instanceof Error?e.message:"文件没有生成成功")}
    finally{setBusy(false)}
  }

  async function rotateCurrent(){
    if(!file)return;setBusy(true);
    try{
      const d=await PDFDocument.load(await file.arrayBuffer()),p=d.getPage(selectedPage-1);
      p.setRotation(degrees((p.getRotation().angle+90)%360));
      const bytes=new Uint8Array(await d.save()),nf=new File([blobBytes(bytes)],file.name,{type:"application/pdf"});
      // rotation changes source geometry; keep other pages but reset edits on this page to avoid silent misplacement.
      setOverlays(v=>v.filter(o=>o.page!==selectedPage));setFile(nf);await renderSourcePage(nf,selectedPage);
    }finally{setBusy(false)}
  }

  function startDrag(e:React.PointerEvent,id:number){
    const stage=stageRef.current;if(!stage)return;
    const o=overlays.find(x=>x.id===id);if(!o)return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({id,startX:e.clientX,startY:e.clientY,originX:o.x,originY:o.y,rect:stage.getBoundingClientRect()});
  }
  function moveDrag(e:React.PointerEvent){
    if(!drag)return;
    const dx=(e.clientX-drag.startX)/drag.rect.width*100,dy=(e.clientY-drag.startY)/drag.rect.height*100;
    const o=overlays.find(x=>x.id===drag.id);if(!o)return;
    patch(drag.id,{x:Math.max(0,Math.min(100-o.w,drag.originX+dx)),y:Math.max(0,Math.min(100-o.h,drag.originY+dy))});
  }

  return <div className="space-y-5">
    <label onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files?.[0];if(f)void load(f)}} className="block cursor-pointer rounded-2xl border border-dashed border-[var(--lx-line)] bg-[var(--lx-soft)] p-7 text-center">
      <input type="file" accept="application/pdf" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)void load(f)}}/>
      <b>{busy&&!file?"正在打开 PDF…":"上传 PDF"}</b>
      <p className="mt-1 text-sm text-[var(--lx-muted)]">上传后直接看到页面；编辑和预览免费，导出时再按实际页数确认价格。</p>
    </label>

    {file&&<>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-[var(--lx-soft)] px-3 py-2">{pages} 页</span>
        <button disabled={selectedPage<=1} onClick={()=>setSelectedPage(v=>Math.max(1,v-1))} className="rounded-full border border-[var(--lx-line)] px-3 py-2 disabled:opacity-35">上一页</button>
        <label className="rounded-full border border-[var(--lx-line)] px-3 py-2">第 <input type="number" min={1} max={pages} value={selectedPage} onChange={e=>setSelectedPage(Math.min(pages,Math.max(1,Number(e.target.value)||1)))} className="w-12 bg-transparent text-center"/> 页</label>
        <button disabled={selectedPage>=pages} onClick={()=>setSelectedPage(v=>Math.min(pages,v+1))} className="rounded-full border border-[var(--lx-line)] px-3 py-2 disabled:opacity-35">下一页</button>
        <button onClick={()=>void rotateCurrent()} className="rounded-full border border-[var(--lx-line)] px-3 py-2">旋转当前页</button>
      </div>

      <section className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-3 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div><b>直接在页面上编辑</b><p className="mt-1 text-xs text-[var(--lx-muted)]">图片、文字和遮盖会立即显示。按住编辑元素可以拖动位置。</p></div>
          {rendering&&<span className="text-xs text-[var(--lx-muted)]">正在显示页面…</span>}
        </div>
        <div ref={stageRef} onPointerMove={moveDrag} onPointerUp={()=>setDrag(null)} onPointerCancel={()=>setDrag(null)}
          className="relative mx-auto w-full max-w-[760px] overflow-hidden rounded-xl border border-[var(--lx-line)] bg-white shadow-sm touch-none"
          style={{aspectRatio:pageImage?"auto":"0.707 / 1"}}>
          {pageImage?<img src={pageImage} alt={`PDF 第 ${selectedPage} 页`} className="block h-auto w-full select-none"/>:<div className="aspect-[0.707/1] w-full"/>}
          {visible.map(o=><div key={o.id} onPointerDown={e=>startDrag(e,o.id)}
            className={`absolute overflow-hidden border ${o.kind==="cover"?"border-slate-400 bg-white":o.kind==="text"?"border-blue-400 bg-white/90":"border-amber-400 bg-transparent"} shadow-sm`}
            style={{left:`${o.x}%`,top:`${o.y}%`,width:`${o.w}%`,height:`${o.h}%`,touchAction:"none"}}>
            {o.kind==="image"&&o.data&&<img src={o.data} alt="" className="h-full w-full object-contain pointer-events-none"/>}
            {o.kind==="text"&&<div className="flex h-full items-center px-1 text-[clamp(9px,2.2vw,18px)] leading-tight text-slate-900">{o.text}</div>}
          </div>)}
        </div>
      </section>

      {!signingOnly&&<div className="grid gap-3 rounded-2xl border border-[var(--lx-line)] p-4 md:grid-cols-[1fr_auto_auto]">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="输入要添加的文字" className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-3 py-2.5"/>
        <button onClick={addText} className="rounded-xl bg-[var(--lx-ink)] px-4 py-2 text-sm text-[var(--lx-bg)]">添加文字</button>
        <button onClick={addCover} className="rounded-xl border border-[var(--lx-line)] px-4 py-2 text-sm">添加遮盖</button>
      </div>}

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="cursor-pointer rounded-2xl border border-[var(--lx-line)] p-4 text-sm">
          <input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)void addImage(f)}}/>
          <b>添加图片</b><p className="mt-1 text-[var(--lx-muted)]">选择后马上显示在当前页，可拖动位置。</p>
        </label>
        <label className="cursor-pointer rounded-2xl border border-[var(--lx-line)] p-4 text-sm">
          <input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)void addImage(f,true)}}/>
          <b>签名 / 印章</b><p className="mt-1 text-[var(--lx-muted)]">选择后马上显示，并尝试去掉白底。</p>
        </label>
        <button onClick={()=>setOverlays(v=>v.filter(o=>o.page!==selectedPage))} className="rounded-2xl border border-[var(--lx-line)] p-4 text-left text-sm">
          <b>清空当前页编辑</b><p className="mt-1 text-[var(--lx-muted)]">只清掉当前页新增内容。</p>
        </button>
      </div>

      {stamp&&<div className="rounded-2xl border border-[var(--lx-line)] p-4">
        <div className="flex flex-wrap items-center gap-3"><b className="text-sm">骑缝章</b>
          <select value={seamSide} onChange={e=>setSeamSide(e.target.value as any)} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-3 py-2 text-sm">
            <option value="right">右侧</option><option value="left">左侧</option><option value="top">顶部</option><option value="bottom">底部</option>
          </select>
          <button onClick={()=>void seam()} className="rounded-xl bg-[var(--lx-ink)] px-4 py-2 text-sm text-[var(--lx-bg)]">按选择页切分盖章</button>
        </div>
      </div>}

      {visible.length>0&&<div className="space-y-2">
        <h3 className="text-sm font-semibold">当前页编辑元素</h3>
        {visible.map(o=><div key={o.id} className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--lx-line)] p-3 text-xs sm:grid-cols-[90px_repeat(4,1fr)_auto]">
          <span>{o.kind==="image"?"图片":o.kind==="text"?"文字":"遮盖"}</span>
          {(["x","y","w","h"] as const).map(k=><label key={k}>{k==="x"?"左":k==="y"?"上":k==="w"?"宽":"高"}%
            <input type="number" min={0} max={100} value={Math.round(o[k]*10)/10} onChange={e=>patch(o.id,{[k]:Number(e.target.value)})} className="mt-1 w-full rounded-lg border border-[var(--lx-line)] bg-[var(--lx-bg)] px-2 py-1"/>
          </label>)}
          <button onClick={()=>setOverlays(v=>v.filter(x=>x.id!==o.id))} className="text-rose-600">删除</button>
        </div>)}
      </div>}

      <label className="block text-sm text-[var(--lx-muted)]">导出页码
        <input value={pageRange} onChange={e=>setPageRange(e.target.value)} placeholder="例如 1-10,12" className="mt-1 w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-3 py-2.5 text-[var(--lx-ink)]"/>
        <span className="mt-1 block text-xs text-[var(--lx-faint)]">本次导出 {exportPages} 页 · 预计 ¥{price}，实际付款前会再次确认。</span>
      </label>

      <div className="flex flex-wrap gap-3">
        <button onClick={()=>void previewNow()} disabled={busy} className="rounded-xl border border-[var(--lx-line-strong)] px-5 py-2.5 text-sm disabled:opacity-40">{busy?"正在生成预览…":"免费预览编辑结果"}</button>
        <PaidExportButton toolId={signingOnly?"e-sign-pdf":"pdf-editor"} quantity={Math.max(1,exportPages)} onUnlocked={exportNow} label={`确认价格并导出 · ${exportPages} 页`}/>
      </div>

      <section id="lx-pdf-free-preview" className="scroll-mt-24">
        {previewNote&&<p className="mb-3 text-sm text-[var(--lx-muted)]">{previewNote}</p>}
        {previewImages.length>0&&<div className="space-y-4 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-3 sm:p-5">
          {previewImages.map((src,i)=><figure key={i} className="mx-auto max-w-[760px]"><figcaption className="mb-2 text-xs text-[var(--lx-muted)]">预览第 {i+1} 页</figcaption><img src={src} alt={`编辑结果预览第 ${i+1} 页`} className="w-full rounded-lg border border-[var(--lx-line)] bg-white"/></figure>)}
        </div>}
      </section>

      <p className="text-xs leading-5 text-[var(--lx-muted)]">编辑与预览不收费。导出前会显示本次实际价格；签名和印章属于页面视觉内容，不等同于数字证书签名。</p>
      {error&&<p className="rounded-xl border border-[var(--lx-line)] p-4 text-sm text-[var(--lx-danger)]">{error}</p>}
    </>}
  </div>;
}
