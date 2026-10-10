"use client";
import{useEffect,useRef,useState}from"react";
import FileDropzone from"@/components/tools/FileDropzone";
import PaidActionButton from"@/components/tools/PaidActionButton";
import ResultPanel from"@/components/tools/ResultPanel";
import{openPdf,renderPdfPage,canvasToBlob}from"@/lib/tools/pdf-render-client";
import{consumeToolHandoff}from"@/lib/tools/workspace/handoff";
import{positionedTextPagesToXlsx,type PositionedTextToken}from"@/lib/tools/shared/pdf-to-xlsx";
import{useLingxiLang}from"@/lib/lingxi-i18n";
import{toolRuntimeText}from"@/lib/tool-runtime-i18n";
import type{ToolResultFile}from"@/lib/tools/types";

type OcrWord={text?:string;bbox?:{x0?:number;y0?:number;x1?:number;y1?:number}};
type OcrBlock={paragraphs?:Array<{lines?:Array<{words?:OcrWord[]}>}>};
type OcrResult={data:{text:string;blocks?:OcrBlock[]|null}};
type W={recognize:(input:Blob,options?:Record<string,unknown>,output?:Record<string,boolean>)=>Promise<OcrResult>;terminate:()=>Promise<void>};

function blockTokens(blocks:OcrBlock[]|null|undefined):PositionedTextToken[]{
 const out:PositionedTextToken[]=[];
 for(const block of blocks||[])for(const paragraph of block.paragraphs||[])for(const line of paragraph.lines||[])for(const word of line.words||[]){
  const text=String(word.text||"").trim(),b=word.bbox;if(!text||!b)continue;
  const x0=Number(b.x0)||0,y0=Number(b.y0)||0,x1=Number(b.x1)||x0,y1=Number(b.y1)||y0;
  out.push({text,x:x0,y:-y0,width:Math.max(1,x1-x0),height:Math.max(6,y1-y0)});
 }
 return out;
}

export default function PdfOcrWorkbench(){
 const{lang:uiLang}=useLingxiLang(),t=(zh:string,en:string)=>toolRuntimeText(uiLang,zh,en);
 const[files,setFiles]=useState<File[]>([]),[pages,setPages]=useState(0),[ocrLang,setOcrLang]=useState("chi_sim+eng");
 const[text,setText]=useState(""),[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState("");
 const[tableFile,setTableFile]=useState<ToolResultFile|null>(null),[tableNote,setTableNote]=useState(""),[handoffSource,setHandoffSource]=useState("");
 const stop=useRef(false),file=files[0]||null;

 useEffect(()=>{
  let alive=true;const id=new URL(window.location.href).searchParams.get("handoff");if(!id)return;
  void consumeToolHandoff(id).then(payload=>{
   if(!alive||!payload?.files?.length)return;
   setFiles(payload.files.slice(0,1));setHandoffSource(payload.sourceSlug);
   const clean=new URL(window.location.href);clean.searchParams.delete("handoff");
   history.replaceState(history.state,"",clean.pathname+clean.search+clean.hash);
  }).catch(()=>{});
  return()=>{alive=false};
 },[]);

 useEffect(()=>{
  let alive=true;if(!file){setPages(0);return}
  void openPdf(file).then(pdf=>{if(alive)setPages(pdf.numPages);pdf.destroy?.()}).catch(()=>{if(alive)setPages(0)});
  return()=>{alive=false};
 },[file]);

 async function run(limit?:number){
  if(!file)return;
  setBusy(true);setText("");setError("");setTableFile(null);setTableNote("");stop.current=false;
  let worker:W|null=null,pdf:any=null;
  try{
   const{createWorker}=await import("tesseract.js");worker=await createWorker(ocrLang) as unknown as W;
   pdf=await openPdf(file);const end=Math.min(pdf.numPages,limit||pdf.numPages),chunks:string[]=[];
   const structured:Array<{name:string;tokens:PositionedTextToken[]}>= [];
   for(let n=1;n<=end;n++){
    if(stop.current)return;
    setStage(t(`识别第 ${n}/${end} 页`,`Recognizing page ${n}/${end}`));
    const rendered=await renderPdfPage(pdf,n,1.8);
    try{
     const image=await canvasToBlob(rendered.canvas,"image/png",1);
     const recognized=await worker.recognize(image,{},handoffSource==="pdf-to-xlsx"?{text:true,blocks:true}:{text:true});
     chunks.push(`===== Page ${n} =====\n${String(recognized.data.text||"").trim()}`);
     if(handoffSource==="pdf-to-xlsx")structured.push({name:`Page ${n}`,tokens:blockTokens(recognized.data.blocks)});
    }finally{rendered.canvas.width=rendered.canvas.height=1}
   }
   const joined=chunks.join("\n\n");setText(joined);
   if(handoffSource==="pdf-to-xlsx"){
    try{
     const xlsx=await positionedTextPagesToXlsx(file.name,structured);
     setTableFile({name:xlsx.name,blob:xlsx.blob,mime:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",size:xlsx.blob.size});
     setTableNote(t(`已从 OCR 结果整理出 Excel：${xlsx.pages} 个工作表，结构参考度 ${Math.round(xlsx.confidence*100)}%。`,`Excel created from OCR: ${xlsx.pages} worksheet(s), structure score ${Math.round(xlsx.confidence*100)}%.`));
    }catch{
     setTableNote(t("OCR 已完成，但没有找到稳定的重复列结构；先提供识别文字，不会强行生成错位 Excel。","OCR finished, but no stable repeated column structure was found. The recognized text is provided instead of a misleading spreadsheet."));
    }
   }
   setStage(t("完成","Done"));
  }catch{
   setError(t("这次 OCR 没有完成，请确认 PDF 可以正常打开并稍后重试。","OCR could not finish. Check that the PDF opens normally and try again."));
  }finally{
   try{await worker?.terminate()}catch{}try{pdf?.destroy?.()}catch{}setBusy(false);
  }
 }

 const results:ToolResultFile[]=[];
 if(text&&file){
  const blob=new Blob([text],{type:"text/plain;charset=utf-8"});
  results.push({name:`${file.name.replace(/\.pdf$/i,"")||"ocr"}.txt`,blob,mime:"text/plain",size:blob.size});
 }
 if(tableFile)results.unshift(tableFile);

 return <div className="space-y-4">
  <FileDropzone accept="application/pdf,.pdf" files={files} onChange={rows=>{setFiles(rows);setText("");setError("");setTableFile(null);setTableNote("");setHandoffSource("")}} disabled={busy} kind="pdf" maxSizeMB={200}/>
  {handoffSource==="pdf-to-xlsx"&&<p className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-3 text-sm text-[var(--lx-muted)]">{t("这是从 PDF 转 Excel 自动继续过来的扫描件。OCR 后会尝试直接生成 Excel，不需要重新上传。","This scanned PDF was continued from PDF to Excel. After OCR, an Excel file will be created when a stable table structure is found.")}</p>}
  <p className="text-sm text-[var(--lx-muted)]">{t("第 1 页免费识别；完整文档从第 2 页起按现有 OCR 规则计费。","Page 1 can be recognized free. Full-document processing follows the existing OCR pricing from page 2 onward.")}{pages?` · ${pages} ${t("页","pages")}`:""}</p>
  <select value={ocrLang} onChange={e=>setOcrLang(e.target.value)} className="rounded-xl border px-3 py-2"><option value="chi_sim+eng">简体中文 + English</option><option value="chi_tra+eng">繁體中文 + English</option><option value="eng">English</option><option value="jpn+eng">日本語 + English</option><option value="kor+eng">한국어 + English</option></select>
  <div className="flex flex-wrap gap-3">
   {file&&!busy&&<button onClick={()=>void run(1)} className="rounded-xl border px-5 py-2.5 text-sm">{t("免费识别第 1 页","Recognize page 1 free")}</button>}
   {file&&pages===1&&!busy&&<button onClick={()=>void run()} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)]">{t("完整 OCR · 免费","Full OCR · Free")}</button>}
   {file&&pages>1&&<PaidActionButton toolId="pdf-ocr" quantity={pages} metadata={{pages,freePages:1,continuedFrom:handoffSource||null}} onPaid={()=>run()} label={t("查看完整 OCR 价格","See full OCR price")}/>}
   {busy&&<button onClick={()=>stop.current=true} className="rounded-xl border px-4 py-2">{t("取消","Cancel")}</button>}
  </div>
  {stage&&<p className="text-sm text-[var(--lx-muted)]">{stage}</p>}
  {tableNote&&<p className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-3 text-sm text-[var(--lx-muted)]">{tableNote}</p>}
  {text&&<textarea value={text} onChange={e=>setText(e.target.value)} rows={18} className="w-full rounded-2xl border p-4 font-mono text-sm"/>}
  {results.length>0&&<ResultPanel sourceSlug="pdf-ocr" files={results} messageZh={tableFile?"OCR 与 Excel 已生成。":"OCR 文字已生成。"} messageEn={tableFile?"OCR and Excel are ready.":"OCR text is ready."}/>}
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{error}</p>}
 </div>;
}
