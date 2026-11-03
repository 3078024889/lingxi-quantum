"use client";

import {useEffect,useState} from "react";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {ToolResultFile} from "@/lib/tools/types";

type Words={title:string;before:string;after:string;slider:string;change:string;previous:string;next:string;of:string};
const COPY:Record<LingxiLang,Words>={
 zh:{title:"原图与结果对比",before:"原图",after:"处理后",slider:"拖动比较原图与结果",change:"文件大小变化",previous:"上一张",next:"下一张",of:"共"},
 en:{title:"Before / after",before:"Original",after:"Result",slider:"Compare original and result",change:"File size change",previous:"Previous",next:"Next",of:"of"},
 ja:{title:"処理前と処理後",before:"元画像",after:"処理後",slider:"元画像と結果を比較",change:"ファイルサイズの変化",previous:"前へ",next:"次へ",of:"全"},
 ko:{title:"처리 전후 비교",before:"원본",after:"결과",slider:"원본과 결과 비교",change:"파일 크기 변화",previous:"이전",next:"다음",of:"전체"},
 fr:{title:"Avant / après",before:"Original",after:"Résultat",slider:"Comparer l'original au résultat",change:"Variation de taille",previous:"Précédent",next:"Suivant",of:"sur"},
 de:{title:"Vorher / nachher",before:"Original",after:"Ergebnis",slider:"Original und Ergebnis vergleichen",change:"Dateigrößenänderung",previous:"Zurück",next:"Weiter",of:"von"},
 es:{title:"Antes / después",before:"Original",after:"Resultado",slider:"Comparar original y resultado",change:"Cambio de tamaño",previous:"Anterior",next:"Siguiente",of:"de"},
 pt:{title:"Antes / depois",before:"Original",after:"Resultado",slider:"Comparar original e resultado",change:"Alteração de tamanho",previous:"Anterior",next:"Próxima",of:"de"},
 ar:{title:"قبل / بعد",before:"الأصل",after:"النتيجة",slider:"قارن الصورة الأصلية بالنتيجة",change:"تغير حجم الملف",previous:"السابق",next:"التالي",of:"من"}
};
const kb=(value:number)=>(value/1024).toFixed(1)+" KB";

export default function ImageBeforeAfter({sources,results}:{sources:readonly File[];results:readonly ToolResultFile[]}){
 const{lang}=useLingxiLang();
 const t=COPY[lang]??COPY.en;
 const[index,setIndex]=useState(0);
 const[split,setSplit]=useState(50);
 const[urls,setUrls]=useState<{before:string;after:string}|null>(null);
 const count=Math.min(sources.length,results.length);
 const selected=Math.min(index,Math.max(0,count-1));
 const source=sources[selected],result=results[selected];
 useEffect(()=>{
  if(!source||!result?.blob){setUrls(null);return;}
  const before=URL.createObjectURL(source);
  const after=URL.createObjectURL(result.blob);
  setUrls({before,after});
  return()=>{URL.revokeObjectURL(before);URL.revokeObjectURL(after)};
 },[source,result?.blob]);
 if(!count||!source||!result)return null;
 const change=source.size>0?((result.size-source.size)/source.size)*100:0;
 const changeText=(change>0?"+":"")+change.toFixed(1)+"%";
 return <section data-testid="image-before-after" className="mt-5 max-w-full space-y-3 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4 sm:p-5">
  <div className="flex flex-wrap items-center justify-between gap-2">
   <h3 className="text-base font-semibold text-[var(--lx-ink)]">{t.title}</h3>
   {count>1&&<div className="flex items-center gap-2 text-sm">
    <button type="button" aria-label={t.previous} disabled={selected===0} onClick={()=>{setIndex(i=>Math.max(0,i-1));setSplit(50)}} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">‹</button>
    <span data-testid="image-compare-position">{selected+1} {t.of} {count}</span>
    <button type="button" aria-label={t.next} disabled={selected===count-1} onClick={()=>{setIndex(i=>Math.min(count-1,i+1));setSplit(50)}} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">›</button>
   </div>}
  </div>
  <p className="break-all text-xs text-[var(--lx-muted)]">{source.name}</p>
  <div className="relative h-60 w-full overflow-hidden rounded-xl border border-[var(--lx-line)] bg-[var(--lx-soft)] sm:h-80" dir="ltr">
   {urls&&<>
    <img data-testid="image-compare-after" src={urls.after} alt={t.after} className="absolute inset-0 h-full w-full object-contain"/>
    <div className="absolute inset-0" style={{clipPath:`inset(0 ${100-split}% 0 0)`}}>
     <img data-testid="image-compare-before" src={urls.before} alt={t.before} className="absolute inset-0 h-full w-full object-contain"/>
    </div>
    <div aria-hidden="true" className="pointer-events-none absolute bottom-0 top-0 w-px bg-[var(--lx-ink)]" style={{left:split+"%"}}/>
   </>}
   <span className="absolute left-2 top-2 rounded bg-[var(--lx-panel)]/90 px-2 py-1 text-xs">{t.before}</span>
   <span className="absolute right-2 top-2 rounded bg-[var(--lx-panel)]/90 px-2 py-1 text-xs">{t.after}</span>
  </div>
  <label className="block text-xs text-[var(--lx-muted)]">
   {t.slider}
   <input type="range" data-testid="image-compare-slider" aria-label={t.slider} min={0} max={100} step={1} value={split} onChange={e=>setSplit(Number(e.target.value))} className="mt-2 w-full accent-[var(--lx-ink)]"/>
  </label>
  <dl className="grid grid-cols-3 gap-2 text-sm">
   <div className="rounded-lg bg-[var(--lx-soft)] p-2"><dt className="text-xs text-[var(--lx-muted)]">{t.before}</dt><dd className="mt-1 font-medium tabular-nums">{kb(source.size)}</dd></div>
   <div className="rounded-lg bg-[var(--lx-soft)] p-2"><dt className="text-xs text-[var(--lx-muted)]">{t.after}</dt><dd className="mt-1 font-medium tabular-nums">{kb(result.size)}</dd></div>
   <div className="rounded-lg bg-[var(--lx-soft)] p-2"><dt className="text-xs text-[var(--lx-muted)]">{t.change}</dt><dd data-testid="image-compare-size-change" className="mt-1 font-medium tabular-nums">{changeText}</dd></div>
  </dl>
 </section>;
}
