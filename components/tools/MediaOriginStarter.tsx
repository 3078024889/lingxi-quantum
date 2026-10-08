"use client";
import {useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
type Mode="image"|"media";
type Result={name:string;size:number;detected:string;notice:string};
function readFour(b:Uint8Array,at:number){return String.fromCharCode(...b.slice(at,at+4))}
async function identify(file:File):Promise<Result>{
  const b=new Uint8Array(await file.slice(0,48).arrayBuffer());
  let detected="未知格式";
  if(b.length>=3&&b[0]===255&&b[1]===216&&b[2]===255)detected="JPEG 图片";
  else if(b.length>=8&&b[0]===137&&readFour(b,1)==="PNG\r")detected="PNG 图片";
  else if(readFour(b,0)==="GIF8")detected="GIF 图片";
  else if(readFour(b,0)==="RIFF"&&readFour(b,8)==="WEBP")detected="WebP 图片";
  else if(readFour(b,0)==="RIFF"&&readFour(b,8)==="WAVE")detected="WAV 音频";
  else if(readFour(b,0)==="OggS")detected="Ogg 媒体";
  else if(readFour(b,0)==="ID3"||(b.length>=2&&b[0]===255&&(b[1]&224)===224))detected="可能为 MP3 音频";
  else if(readFour(b,4)==="ftyp"){const brand=readFour(b,8);detected=["heic","heix","mif1","avif","avis"].includes(brand)?"HEIF/AVIF 图片容器":brand==="qt  "?"MOV 视频容器":"ISO 媒体容器（可能为 MP4/M4A）"}
  else if(b.length>=4&&b[0]===26&&b[1]===69&&b[2]===223&&b[3]===163)detected="Matroska/WebM 容器";
  else if(readFour(b,0)==="RIFF")detected="RIFF 容器（无法确认子类型）";
  return {name:file.name,size:file.size,detected,notice:detected==="未知格式"?"文件头不足以判断具体格式。":"文件头只提供格式线索，不能确定内容是否由 AI 制作、是否被篡改或来源是否真实。"};
}
export default function MediaOriginStarter({mode}:{mode:Mode}){
  const [files,setFiles]=useState<File[]>([]),[results,setResults]=useState<Result[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState("");
  const accept=mode==="image"?"image/*,.jpg,.jpeg,.png,.webp,.heic,.avif":"video/*,audio/*,.mp4,.mov,.webm,.mp3,.wav,.ogg,.m4a";
  async function inspect(){setBusy(true);setError("");setResults([]);try{const all=[] as Result[];for(const f of files){if(!f.size)throw Error(f.name+" 是空文件");if(f.size>250*1024*1024)throw Error(f.name+" 超过250MB");all.push(await identify(f))}setResults(all)}catch(e){setError(e instanceof Error?e.message:"文件读取失败")}finally{setBusy(false)}}
  return <main className="mx-auto max-w-3xl space-y-6 px-5 py-12"><h1 className="text-3xl font-semibold">{mode==="image"?"AI 图片来源初检":"AI 视频音频来源初检"}</h1><p>免费检查文件格式，了解来源凭证。文件头不能识别图片、视频或声音是否由 AI 制作。</p>
    <section className="space-y-4 rounded-2xl border p-5"><h2 className="text-lg font-semibold">选择文件（最多20个）</h2>
      <FileDropzone files={files} onChange={x=>{setFiles(x);setResults([])}} multiple append maxFiles={20} maxSizeMB={250} accept={accept} kind={mode==="image"?"image":"media"}/>
      <button type="button" className="rounded-lg border px-5 py-2 disabled:opacity-50" disabled={!files.length||busy} onClick={()=>void inspect()}>{busy?"正在检查…":"开始免费检查"}</button>
      <p className="text-sm opacity-75">仅在浏览器读取文件头，不上传原始媒体，不消耗额度，也不会收费。</p>{error&&<p role="alert">{error}</p>}
      {results.length>0&&<ul className="space-y-3">{results.map((r,i)=><li key={i} className="rounded-lg border p-4"><p className="break-all font-semibold">{r.name}</p><p>识别线索：{r.detected}</p><p>大小：{(r.size/1048576).toFixed(2)} MB</p><p>{r.notice}</p><p className="font-medium">AI 来源：无法仅凭文件格式判断</p></li>)}</ul>}
    </section><section className="space-y-2 rounded-2xl border p-5"><h2 className="text-lg font-semibold">来源签名核验</h2><p>C2PA 可能提供可验证的签名和编辑履历。没有凭证不等于造假；凭证有效也不等于内容描述的事件真实。</p><a href="https://contentcredentials.org/verify" target="_blank" rel="noopener noreferrer" className="underline">前往 Content Credentials 官方验证 ↗</a><p className="text-sm opacity-75">本站高级签名验证尚未开放，不会向你收取费用。</p></section>
  </main>
}