"use client";
import {useEffect,useRef,useState} from "react";
import PaidActionButton from "@/components/tools/PaidActionButton";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import {recognizeFoodImage} from "@/lib/tools/food/image-recognition-local";
import {foodLabel} from "@/lib/tools/food/vision-labels";
import {foodText} from "@/lib/tools/food/workbench-copy";
import {extraText} from "@/lib/tools/food/workbench-extra-copy";
import {mealInsight} from "@/lib/tools/food/meal-insights";
import {createFoodImageSession} from "@/lib/tools/food/session-client";
import {portionValue,type FoodChoice,type MealResult} from "@/lib/tools/food/meal-calculation";
import {foodBillingText} from '@/lib/tools/food/billing-copy';
const t=(l:LingxiLang,k:string)=>extraText(l,k)||foodText(l,k);
const field="min-w-0 rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-3 py-3";
const button="rounded-xl border border-[var(--lx-line)] px-4 py-3 text-sm disabled:opacity-40";
const primary=button+" bg-[var(--lx-ink)] text-[var(--lx-bg)]";
type Selection={food:FoodChoice;grams:string};
const name=(f:FoodChoice,l:LingxiLang)=>f.displayNames?.[l]||(l==="zh"?f.name_zh:(f.name_en||f.name_zh));
async function search(q:string,signal?:AbortSignal):Promise<FoodChoice[]>{
 const r=await fetch(`/api/tools/food/search?q=${encodeURIComponent(q)}`,{signal});
 if(!r.ok)throw new Error('SEARCH_FAILED');const d=await r.json();return Array.isArray(d.items)?d.items:[];
}
// Browser WASM models share a session: don't run twenty inferences at once.
let visionQueue:Promise<unknown>=Promise.resolve();
function queuedVision(file:File,active:()=>boolean){const work=visionQueue.then(()=>active()?recognizeFoodImage(file):[]);visionQueue=work.catch(()=>[]);return work;}
export default function FoodCalorieWorkbench(){
 const {lang}=useLingxiLang();const[mode,setMode]=useState<'single'|'batch'|'custom'>('single');const[files,setFiles]=useState<File[]>([]);const[revision,setRevision]=useState(0);const[error,setError]=useState('');
 function load(input:File[]){if(input.length>20||input.some(f=>!f.type.startsWith('image/')||f.size>15*1024*1024)){setError(t(lang,'fileError'));return;}setError('');setFiles(input.slice(0,mode==='single'?1:20));setRevision(n=>n+1);}
 return <section dir={lang==='ar'?'rtl':'ltr'} className="space-y-5"><p className="text-sm leading-7 text-[var(--lx-muted)]">{foodBillingText(lang,'pricing')}</p><RecoveredFoodAnalysis lang={lang}/><nav aria-label={t(lang,'custom')} className="grid grid-cols-3 gap-2">{(['single','batch','custom'] as const).map((m,i)=><button type="button" key={m} aria-pressed={mode===m} className={mode===m?primary:button} onClick={()=>{setMode(m);setFiles([]);setRevision(n=>n+1);setError('')}}>{t(lang,['upload','batch','custom'][i])}</button>)}</nav>
 {mode!=='custom'&&<label onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();load(Array.from(e.dataTransfer.files))}} className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[var(--lx-line)] bg-[var(--lx-soft)] p-6 text-center"><span aria-hidden="true" className="text-3xl">＋</span><b>{t(lang,'drop')}</b><span className="text-sm text-[var(--lx-muted)]">{t(lang,'confirmed')}</span><input aria-label={t(lang,'upload')} type="file" accept="image/*" multiple={mode==='batch'} className="max-w-full text-sm" onChange={e=>{load(Array.from(e.target.files||[]));e.target.value=''}}/></label>}
 {error&&<p role="alert">{error}</p>}{(mode==='custom'||files.length>0)&&<MealWorkspace key={`${mode}-${revision}`} lang={lang} files={files} manual={mode==='custom'}/>}
 </section>;
}
type Prepared={id:string;quantity:number;mode:'image'|'custom';freeEligible:boolean;completed?:boolean};
const savedAnalysis='lingxifield:food-analysis:v19';
function MealWorkspace({lang,files,manual}:{lang:LingxiLang;files:File[];manual:boolean}){
 const[groups,setGroups]=useState<Selection[][]>(()=>Array.from({length:Math.max(1,files.length)},()=>[]));
 const[prepared,setPrepared]=useState<Prepared|null>(null),[busy,setBusy]=useState(false),[msg,setMsg]=useState('');
 const requestId=useRef('');
 const all=groups.flat(),valid=all.length>0&&all.length<=30&&all.every(x=>portionValue(x.grams)!==null)&&groups.every(x=>x.length>0);
 function change(i:number,next:Selection[]){requestId.current='';setGroups(xs=>xs.map((x,j)=>j===i?next:x));setMsg('');}
 async function prepare(){
  if(!valid||busy)return;setBusy(true);setMsg('');
  try{
   const session=manual?null:await createFoodImageSession(files);
   // Retrying the same immutable request is safe; image sessions are recreated only before preparation.
   const id=crypto.randomUUID();requestId.current=id;
   const r=await fetch('/api/tools/food/analysis',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requestId:id,mode:manual?'custom':'image',sessionId:session?.sessionId,groups:groups.map(g=>g.map(x=>({food_id:x.food.food_id,grams:portionValue(x.grams),...(x.food.food_id===0?{label:x.food.name_zh,per100:x.food.per100}:{})})))})});
   const d=await r.json();if(!r.ok)throw new Error(d.error);
   try{localStorage.setItem(savedAnalysis,d.id)}catch{}
   setPrepared(d);
  }catch{setMsg(t(lang,'failed'))}finally{setBusy(false)}
 }
 return <div className="space-y-5"><div className={files.length>1?'grid gap-4 xl:grid-cols-2':'space-y-4'}>{groups.map((selected,i)=><article key={i} className="min-w-0 rounded-3xl border border-[var(--lx-line)] p-4 sm:p-5"><FoodEntry lang={lang} file={files[i]} selected={selected} setSelected={next=>change(i,next)} disabled={busy||!!prepared}/></article>)}</div>
 {prepared?<><AnalysisCheckout key={prepared.id} lang={lang} prepared={prepared}/><button type="button" className={button} onClick={()=>setPrepared(null)}>{foodBillingText(lang,'edit')}</button></>:all.length>0&&<button type="button" className={primary} disabled={!valid||busy} onClick={()=>void prepare()}>{t(lang,busy?'working':'view')}</button>}
 {msg&&<p role="alert">{msg}</p>}</div>;
}
function RecoveredFoodAnalysis({lang}:{lang:LingxiLang}){
 const[prepared,setPrepared]=useState<Prepared|null>(null);
 useEffect(()=>{let active=true;let id=new URLSearchParams(location.search).get('resumeDraft');try{id=id||localStorage.getItem(savedAnalysis)}catch{}if(!id)return;void fetch(`/api/tools/food/analysis/${encodeURIComponent(id)}`,{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{if(active&&d)setPrepared(d)}).catch(()=>{});return()=>{active=false}},[]);
 return prepared?<section className="space-y-3 rounded-2xl border border-[var(--lx-line)] p-4"><h3>{foodBillingText(lang,'saved')}</h3><AnalysisCheckout lang={lang} prepared={prepared}/></section>:null;
}
function AnalysisCheckout({lang,prepared}:{lang:LingxiLang;prepared:Prepared}){
 const[legacy,setLegacy]=useState<{id:string;mode:string;maxQuantity:number;currency:string;amount:number}[]>([]);
 useEffect(()=>{let live=true;void fetch('/api/tools/food/legacy-orders',{cache:'no-store'}).then(r=>r.ok?r.json():{items:[]}).then(d=>{if(live)setLegacy(d.items||[])}).catch(()=>{});return()=>{live=false}},[]);
 const[free,setFree]=useState<boolean|null>(null),[result,setResult]=useState<MealResult|null>(null),[busy,setBusy]=useState(false),[msg,setMsg]=useState('');
 const lastQuote=useRef<string|undefined>(undefined);
 async function calculate(quoteId?:string){
  setBusy(true);setMsg('');if(quoteId)lastQuote.current=quoteId;
  try{
   const r=await fetch(`/api/tools/food/analysis/${prepared.id}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({quoteId})});const d=await r.json();
   if(!r.ok){if(d.freeUsed){setFree(false);setMsg(foodBillingText(lang,'used'))}else {if(d.error==='PAYMENT_REQUIRED')setFree(false);setMsg(foodBillingText(lang,d.error==='REQUEST_EXPIRED'?'expired':'unavailable'));}throw new Error('ANALYSIS_FAILED');}
   setResult(d);setFree(false);
  }catch(e){setMsg(current=>current||foodBillingText(lang,'unavailable'));throw e;}finally{setBusy(false)}
 }
 useEffect(()=>{let live=true;void fetch('/api/tools/food/free-status',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{if(live)setFree(d?.available===true)}).catch(()=>{if(live)setFree(false)});return()=>{live=false}},[]);
 return <div className="space-y-4" aria-live="polite">{result?<ResultCard lang={lang} result={result}/>:<>
 {legacy.filter(q=>q.mode===prepared.mode&&q.maxQuantity>=prepared.quantity).map(q=><button type="button" key={q.id} className={button} disabled={busy} onClick={()=>void calculate(q.id).catch(()=>{})}>{foodBillingText(lang,'legacy')} · {q.currency==='USD'?'$':'¥'}{q.amount.toFixed(2)}</button>)}
 {prepared.completed?<button type="button" className={primary} disabled={busy} onClick={()=>void calculate().catch(()=>{})}>{foodBillingText(lang,'retry')}</button>:free===null?<p>{t(lang,'working')}</p>:free&&prepared.freeEligible?<button type="button" className={primary} disabled={busy} onClick={()=>void calculate().catch(()=>{})}>{t(lang,busy?'working':'view')} · {foodBillingText(lang,'freeNow')}</button>:<PaidActionButton toolId="food-calorie" quantity={prepared.quantity} metadata={{foodRequestId:prepared.id,mode:prepared.mode}} draftId={prepared.id} onPaid={calculate} label={foodBillingText(lang,'ready')}/>}
 {msg&&<p role="alert">{msg}</p>}{lastQuote.current&&msg&&<button type="button" className={button} disabled={busy} onClick={()=>void calculate(lastQuote.current).catch(()=>{})}>{foodBillingText(lang,'retry')}</button>}
 </>}</div>;
}
function FoodEntry({lang,file,selected,setSelected,disabled}:{lang:LingxiLang;file?:File;selected:Selection[];setSelected:(v:Selection[])=>void;disabled:boolean}){
 const[q,setQ]=useState(''),[grams,setGrams]=useState('100'),[hits,setHits]=useState<FoodChoice[]>([]),[message,setMessage]=useState(''),[searching,setSearching]=useState(false),[preview,setPreview]=useState(''),[predictions,setPredictions]=useState<string[]>([]),[recognizing,setRecognizing]=useState(Boolean(file));const request=useRef<AbortController|null>(null);
 useEffect(()=>{if(!file)return;let live=true;const url=URL.createObjectURL(file);setPreview(url);setRecognizing(true);void queuedVision(file,()=>live).then(xs=>{if(live)setPredictions(xs.filter(x=>x.score>=.08).slice(0,8).map(x=>x.label))}).catch(()=>{if(live)setPredictions([])}).finally(()=>{if(live)setRecognizing(false)});return()=>{live=false;URL.revokeObjectURL(url)}},[file]);
 useEffect(()=>()=>request.current?.abort(),[]);
 async function find(value=q){request.current?.abort();if(!value.trim()){setHits([]);return;}const controller=new AbortController();request.current=controller;setSearching(true);setMessage('');try{const list=await search(value,controller.signal);if(!controller.signal.aborted){setHits(list);setMessage(list.length?'':t(lang,'noMatch'))}}catch{if(!controller.signal.aborted){setHits([]);setMessage(t(lang,'failed'))}}finally{if(!controller.signal.aborted)setSearching(false)}}
 function add(food:FoodChoice){if(portionValue(grams)===null){setMessage(t(lang,'amountError'));return;}if(selected.length>=30)return;setSelected([...selected,{food,grams}]);setHits([]);setQ('');setMessage('')}
 return <div className="space-y-4">{file&&<><img src={preview||undefined} alt={file.name} className="max-h-72 w-full rounded-2xl object-contain bg-[var(--lx-soft)]"/><p role="status" className="text-sm text-[var(--lx-muted)]">{t(lang,recognizing?'checking':predictions.length?'confirmed':'visionFail')}</p><div className="flex flex-wrap gap-2">{predictions.map(p=><button type="button" key={p} className={button} disabled={disabled} onClick={()=>{setQ(p);void find(p)}}>{foodLabel(p,lang)}</button>)}</div></>}
 <form onSubmit={e=>{e.preventDefault();void find()}} className="space-y-2"><label className="block text-sm font-medium">{t(lang,'search')}<input value={q} maxLength={120} onChange={e=>{setQ(e.target.value);request.current?.abort();setSearching(false);setHits([]);setMessage('')}} placeholder={t(lang,'input')} className={field+' mt-2 w-full'} disabled={disabled}/></label><p className="text-xs text-[var(--lx-muted)]">{t(lang,'searchHint')}</p><div className="flex items-end gap-2"><label className="min-w-0 flex-1 text-xs">{t(lang,'portion')}<input type="text" inputMode="decimal" autoComplete="off" value={grams} onChange={e=>setGrams(e.target.value)} className={field+' mt-1 w-full'} disabled={disabled}/></label><button className={button} disabled={searching||disabled||!q.trim()}>{t(lang,searching?'working':'search')}</button></div></form>
 {message&&<p role="status" className="text-sm leading-6">{message}</p>}{hits.length>0&&<ul className="max-h-80 overflow-y-auto rounded-xl border border-[var(--lx-line)]">{hits.map(food=><li key={food.food_id}><button type="button" disabled={disabled} onClick={()=>add(food)} className="flex w-full items-center justify-between gap-3 border-b border-[var(--lx-line)] p-3 text-start hover:bg-[var(--lx-soft)]"><span className="min-w-0"><span className="block text-sm">{name(food,lang)}</span><small className="text-[var(--lx-muted)]">{food.source}{food.per100?.kcal!=null?` · ${food.per100.kcal} kcal / 100 g`:''}</small></span><span aria-label={t(lang,'add')}>＋</span></button></li>)}</ul>}
 <LabelEntry lang={lang} add={add} disabled={disabled}/>
 {selected.length>0&&<div className="rounded-2xl bg-[var(--lx-soft)] p-3"><h3 className="font-semibold">{t(lang,'meal')}</h3>{selected.map((x,i)=><div key={i} className="mt-3 border-t border-[var(--lx-line)] pt-3"><p className="text-sm leading-6">{name(x.food,lang)}</p><div className="mt-2 flex flex-wrap items-center gap-2"><label className="flex items-center gap-2"><input aria-label={`${name(x.food,lang)} · ${t(lang,'portion')}`} className={field+' w-24'} type="text" inputMode="decimal" value={x.grams} disabled={disabled} onChange={e=>setSelected(selected.map((v,j)=>j===i?{...v,grams:e.target.value}:v))}/><span>g</span></label><button type="button" disabled={disabled} className="text-sm underline underline-offset-4" onClick={()=>setSelected(selected.filter((_,j)=>i!==j))}>{t(lang,'remove')}</button></div>{x.food.portions?.length?<div className="mt-2 flex flex-wrap gap-2">{x.food.portions.slice(0,3).map((p,j)=><button type="button" disabled={disabled} key={j} className="rounded-full border border-[var(--lx-line)] px-2 py-1 text-xs" onClick={()=>setSelected(selected.map((v,k)=>k===i?{...v,grams:String(p.grams)}:v))}>{p.label} · {p.grams} g</button>)}</div>:null}</div>)}</div>}
 </div>;
}
function LabelEntry({lang,add,disabled}:{lang:LingxiLang;add:(f:FoodChoice)=>void;disabled:boolean}){
 const[label,setLabel]=useState('');const[values,setValues]=useState(['','','','']);const[error,setError]=useState(false);
 function submit(){const nums=values.map(x=>x.trim()===''?NaN:Number(x.replace(',','.')));if(!label.trim()||nums.some(n=>!Number.isFinite(n)||n<0)||nums[0]>900||nums.slice(1).some(n=>n>100)){setError(true);return;}add({food_id:0,name_zh:label.trim(),name_en:label.trim(),manualOnly:true,source:t(lang,'labelSource'),per100:{kcal:nums[0],protein_g:nums[1],carbs_g:nums[2],fat_g:nums[3]}});setError(false)}
 return <details className="text-sm"><summary className="cursor-pointer underline underline-offset-4">{t(lang,'labelEntry')}</summary><div className="mt-3 space-y-3 rounded-xl border border-[var(--lx-line)] p-3"><label className="block">{t(lang,'input')}<input className={field+' mt-1 w-full'} value={label} maxLength={100} onChange={e=>setLabel(e.target.value)} disabled={disabled}/></label><p>{t(lang,'per100')}</p><div className="grid grid-cols-2 gap-2">{['energy','protein','carbs','fat'].map((key,i)=><label key={key} className="text-xs">{t(lang,key)} ({i===0?'kcal':'g'})<input className={field+' mt-1 w-full'} inputMode="decimal" value={values[i]} disabled={disabled} onChange={e=>setValues(xs=>xs.map((x,j)=>i===j?e.target.value:x))}/></label>)}</div>{error&&<p role="alert">{t(lang,'failed')}</p>}<button type="button" className={button} disabled={disabled} onClick={submit}>{t(lang,'add')}</button></div></details>;
}
function ResultCard({lang,result}:{lang:LingxiLang;result:MealResult}){
 const x=result.total,ins=mealInsight(x),format=(n:unknown,d=1)=>typeof n==='number'&&Number.isFinite(n)?new Intl.NumberFormat(lang,{maximumFractionDigits:d}).format(n):'—';
 return <section className="space-y-5 rounded-3xl border border-[var(--lx-line)] p-5 sm:p-7"><div><p className="text-sm text-[var(--lx-muted)]">{t(lang,'result')}</p><p className="mt-2 text-4xl font-semibold">{format(x.kcal,0)} <span className="text-base font-normal">kcal</span></p></div><h3 className="font-semibold">{t(lang,'nutrition')}</h3><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{(['protein','carbs','fat','fiber','sugar','sodium'] as const).map(k=><div key={k} className="rounded-2xl bg-[var(--lx-soft)] p-4"><p className="text-xs text-[var(--lx-muted)]">{t(lang,k)}</p><p className="mt-2 text-xl font-semibold">{format(x[`${k}_${k==='sodium'?'mg':'g'}` as keyof typeof x])} <small>{k==='sodium'?'mg':'g'}</small></p></div>)}</div><p className="text-xs text-[var(--lx-muted)]">{t(lang,'unknown')}</p>
 <div className="rounded-2xl bg-[var(--lx-soft)] p-5"><h3 className="font-semibold">{t(lang,'next')}</h3><p className="mt-3 leading-7">{t(lang,ins.summaryKey)} {t(lang,ins.nextMealKey)}</p><p className="mt-3 leading-7">{t(lang,'mealIdea')}</p><p className="mt-3 text-xs leading-6 text-[var(--lx-muted)]">{t(lang,'adviceNote')}</p></div>
 <h3 className="font-semibold">{t(lang,'foods')}</h3><ul className="space-y-3">{result.items.map((v,i)=><li key={i} className="flex flex-wrap justify-between gap-2 border-b border-[var(--lx-line)] pb-3 text-sm"><span className="min-w-0">{name(v,lang)}</span><span>{format(v.grams)} g · {format(v.kcal,0)} kcal</span></li>)}</ul><details><summary className="cursor-pointer text-sm">{t(lang,'source')}</summary><ul className="mt-3 space-y-2 text-xs text-[var(--lx-muted)]">{result.items.map((v,i)=><li key={i}>{v.source_url?<a href={v.source_url} target="_blank" rel="noreferrer" className="underline">{name(v,lang)} · {v.source}</a>:<span>{name(v,lang)} · {v.source||result.sources?.join(' · ')}</span>}</li>)}</ul></details></section>;
}
