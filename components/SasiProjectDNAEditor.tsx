"use client";
import {useEffect,useMemo,useState,useRef} from "react";

type Props={projectId:string};
export default function SasiProjectDNAEditor({projectId}:Props){
 const[characters,setCharacters]=useState('[{"name":"主角","appearance":"","wardrobe":[],"negativeConstraints":[]}]');
 const[style,setStyle]=useState('{"color":"","lighting":"","cameraLanguage":"","negativeConstraints":[]}');
 const[versions,setVersions]=useState<any[]>([]),[message,setMessage]=useState("");
 async function load(){if(!projectId)return;const r=await fetch(`/api/sasi/v5/projects/${encodeURIComponent(projectId)}/dna`,{cache:"no-store"});const b=await r.json().catch(()=>({}));if(r.ok)setVersions(b.versions??[])}
 const loadRef=useRef(load);loadRef.current=load;
 useEffect(()=>{void loadRef.current()},[projectId]);
 const valid=useMemo(()=>{try{JSON.parse(characters);JSON.parse(style);return true}catch{return false}},[characters,style]);
 async function save(approve:boolean){
  if(!valid){setMessage("请先检查内容格式。");return}
  setMessage("正在保存…");
  const r=await fetch(`/api/sasi/v5/projects/${encodeURIComponent(projectId)}/dna`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({characters:JSON.parse(characters),style:JSON.parse(style),approve})});
  const b=await r.json().catch(()=>({}));setMessage(r.ok?(approve?"已批准，后续创作会以这一版为准。":"已保存新版本。"):(b.error||"暂时无法保存。"));if(r.ok)void loadRef.current();
 }
 return <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
  <h2 className="text-2xl font-semibold text-[var(--lx-ink)]">人物与作品风格</h2>
  <p className="mt-2 text-sm text-[var(--lx-muted)]">先确定人物和整体风格，后续镜头会沿用已经批准的版本。</p>
  <label className="mt-5 block text-sm text-[var(--lx-muted)]">人物设定</label>
  <textarea className="mt-2 min-h-48 w-full rounded-2xl border bg-transparent p-4 font-mono text-xs" value={characters} onChange={e=>setCharacters(e.target.value)}/>
  <label className="mt-5 block text-sm text-[var(--lx-muted)]">作品风格</label>
  <textarea className="mt-2 min-h-40 w-full rounded-2xl border bg-transparent p-4 font-mono text-xs" value={style} onChange={e=>setStyle(e.target.value)}/>
  <div className="mt-4 flex flex-wrap gap-2"><button disabled={!valid} onClick={()=>void save(false)} className="rounded-xl border px-4 py-2">保存版本</button><button disabled={!valid} onClick={()=>void save(true)} className="rounded-xl bg-[var(--lx-ink)] px-4 py-2 text-[var(--lx-bg)]">批准并用于后续创作</button></div>
  {message&&<p className="mt-3 text-sm text-[var(--lx-muted)]">{message}</p>}
  <p className="mt-4 text-xs text-[var(--lx-muted)]">已有 {versions.length} 个版本。</p>
 </section>
}
