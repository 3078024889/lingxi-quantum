"use client";

import {useCallback,useEffect,useRef,useState} from "react";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {uploadText} from "@/lib/upload-ui-i18n";

function normalizeExt(name:string){const i=name.lastIndexOf(".");return i>=0?name.slice(i).toLowerCase():""}
function fileMatchesAccept(file:File,accept:string){
  const rules=accept.split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
  if(!rules.length||rules.includes("*/*"))return true;
  const mime=(file.type||"").toLowerCase(),ext=normalizeExt(file.name);
  return rules.some(rule=>rule.startsWith(".")?ext===rule:rule.endsWith("/*")?mime.startsWith(rule.slice(0,-1)):mime===rule);
}
function fileIdentity(file:File){return`${file.name}\u0000${file.size}\u0000${file.lastModified}`}
type Props={accept?:string;multiple?:boolean;maxFiles?:number;maxSizeMB?:number;files:File[];onChange:(files:File[])=>void;disabled?:boolean;kind?:"file"|"image"|"media"|"pdf"|"subtitle";append?:boolean};
type Preview={key:string;name:string;url:string};

export default function FileDropzone({
  accept="*/*",multiple=false,maxFiles=1,maxSizeMB=40,files,onChange,disabled,kind="file",append=false,
}:Props){
  const{lang}=useLingxiLang();
  const inputRef=useRef<HTMLInputElement>(null);
  const[drag,setDrag]=useState(false);
  const[error,setError]=useState<string|null>(null);
  const[previews,setPreviews]=useState<Preview[]>([]);

  useEffect(()=>{
    if(kind!=="image"){setPreviews([]);return}
    const next=files.slice(0,8).filter(f=>(f.type||"").startsWith("image/")).map(file=>({
      key:fileIdentity(file),name:file.name,url:URL.createObjectURL(file),
    }));
    setPreviews(next);
    return()=>{for(const item of next)URL.revokeObjectURL(item.url)}
  },[files,kind]);

  const apply=useCallback((list:FileList|File[])=>{
    const incoming=Array.from(list);if(!incoming.length)return;
    const maxBytes=maxSizeMB*1024*1024;
    const tooBig=incoming.find(file=>file.size>maxBytes);
    if(tooBig){setError(uploadText(lang,"tooLarge",{name:tooBig.name,size:maxSizeMB}));return}
    const unsupported=incoming.find(file=>!fileMatchesAccept(file,accept));
    if(unsupported){setError(`${unsupported.name} · ${uploadText(lang,"unsupported")}`);return}
    const merged=multiple&&append?[...files,...incoming]:incoming;
    const unique=Array.from(new Map(merged.map(file=>[fileIdentity(file),file])).values());
    if(!multiple&&unique.length>1){setError(lang==="zh"?"此工具一次只处理 1 个文件。":"This tool processes one file at a time.");return}
    if(multiple&&unique.length>maxFiles){setError(lang==="zh"?`此工具一次最多处理 ${maxFiles} 个文件，请减少后重试。`:`This tool accepts at most ${maxFiles} files per batch.`);return}
    setError(null);onChange(multiple?unique:unique.slice(0,1));
  },[accept,append,files,lang,maxFiles,maxSizeMB,multiple,onChange]);

  const promptKey=kind==="image"?"dropImagesOrChoose":kind==="media"?"dropMediaOrChoose":kind==="pdf"?"dropPdfOrChoose":kind==="subtitle"?"dropSubtitleOrChoose":"dropOrChoose";

  return <div>
    <div role="button" tabIndex={disabled?-1:0} aria-disabled={disabled||undefined}
      onKeyDown={e=>{if(!disabled&&(e.key==="Enter"||e.key===" ")){e.preventDefault();inputRef.current?.click()}}}
      onClick={()=>!disabled&&inputRef.current?.click()}
      onDragEnter={e=>{e.preventDefault();if(!disabled)setDrag(true)}}
      onDragOver={e=>{e.preventDefault();if(!disabled)setDrag(true)}}
      onDragLeave={e=>{if(e.currentTarget.contains(e.relatedTarget as Node|null))return;setDrag(false)}}
      onDrop={e=>{e.preventDefault();setDrag(false);if(!disabled)apply(e.dataTransfer.files)}}
      className={`cursor-pointer rounded-2xl border border-dashed px-6 py-9 text-center transition ${drag?"border-[var(--lx-line-strong)] bg-[var(--lx-soft)] ring-4 ring-[var(--lx-soft)]":"border-[var(--lx-line)] bg-[var(--lx-soft)] hover:border-[var(--lx-line-strong)]"} ${disabled?"pointer-events-none opacity-50":""}`}>
      <p className="text-base font-medium text-[var(--lx-ink)]">{drag?uploadText(lang,"dragActive"):uploadText(lang,promptKey)}</p>
      <p className="mt-2 text-xs leading-5 text-[var(--lx-faint)]">
        {uploadText(lang,"maxFile",{size:maxSizeMB})}{multiple?` · ${uploadText(lang,"maxFiles",{count:maxFiles})}`:""}
      </p>
      <input ref={inputRef} type="file" className="hidden" accept={accept} multiple={multiple} disabled={disabled}
        onChange={e=>{if(e.target.files)apply(e.target.files);e.target.value=""}}/>
    </div>

    {error&&<p role="alert" className="mt-3 text-sm text-[var(--lx-danger)]">{error}</p>}

    {previews.length>0&&<div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
      {previews.map(item=><figure key={item.key} className="overflow-hidden rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)]">
        <img src={item.url} alt={item.name} className="aspect-square w-full object-cover"/>
        <figcaption className="truncate px-2 py-1.5 text-[10px] text-[var(--lx-muted)]">{item.name}</figcaption>
      </figure>)}
    </div>}

    {files.length>0&&<ul className="mt-4 space-y-2">
      {files.map(file=><li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] px-4 py-2 text-sm text-[var(--lx-muted)]">
        <span className="truncate">{file.name} · {(file.size/1024/1024).toFixed(2)} MB</span>
        <button type="button" className="shrink-0 text-xs text-[var(--lx-ink)] hover:underline"
          onClick={e=>{e.stopPropagation();onChange(files.filter(item=>item!==file))}}>{uploadText(lang,"remove")}</button>
      </li>)}
    </ul>}
  </div>
}
