"use client";

import {useEffect,useRef,useState} from "react";
import PaidActionButton from "@/components/tools/PaidActionButton";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import {usePreferredCurrency} from "@/components/CurrencyPreferenceProvider";
import {recognizeFoodImage,foodVisionCapabilities,type FoodVisionPrediction} from "@/lib/tools/food/image-recognition-local";
import {foodLabel} from "@/lib/tools/food/vision-labels";
import {foodUi} from "@/lib/tools/food/ui-i18n";

type SearchItem={food_id:number;code:string;name_zh:string;name_en?:string|null;category?:string|null;score:number};
type Selected={food:SearchItem;grams:number};
type ResultItem={food_id:number;code:string;name_zh:string;name_en?:string|null;grams:number;kcal:number;protein_g?:number|null;carbs_g?:number|null;fat_g?:number|null;fiber_g?:number|null;sugar_g?:number|null;sodium_mg?:number|null;nutrients?:Record<string,number|null>|null;source?:string|null};
type CalcResult={items:ResultItem[];total:ResultItem&{grams:number};source?:string|null};
type Price={amount_rmb:number;amount_usd:number};

const QUICK_ZH=["米饭","鸡蛋","鸡胸肉","苹果","香蕉","橙子","牛奶","面包"];
const QUICK_EN=["rice","egg","chicken breast","apple","banana","orange","milk","bread"];
const show=(v:unknown,lang:LingxiLang,d=1)=>v!==null&&v!==undefined&&v!==""&&Number.isFinite(Number(v))?Number(v).toFixed(d):foodUi(lang,"missing");
const displayName=(x:{name_zh:string;name_en?:string|null},lang:LingxiLang)=>lang==="zh"?x.name_zh:(x.name_en||x.name_zh);

async function searchFood(q:string):Promise<SearchItem[]>{
 const r=await fetch(`/api/tools/food/search?q=${encodeURIComponent(q)}`,{cache:"no-store"});
 const d=await r.json().catch(()=>({}));
 return r.ok&&Array.isArray(d.items)?d.items:[];
}

function Result({result,lang}:{result:CalcResult;lang:LingxiLang}){
 const t=(k:Parameters<typeof foodUi>[1])=>foodUi(lang,k);
 return <section className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
  <div className="text-sm text-[var(--lx-faint)]">{t("fullResult")}</div>
  <div className="mt-1 text-3xl font-semibold text-[var(--lx-ink)]">{show(result.total.kcal,lang,0)} kcal</div>
  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
   {[[t("protein"),show(result.total.protein_g,lang)+" g"],[t("carbs"),show(result.total.carbs_g,lang)+" g"],[t("fat"),show(result.total.fat_g,lang)+" g"],[t("fiber"),show(result.total.fiber_g,lang)+" g"],[t("sugar"),show(result.total.sugar_g,lang)+" g"],[t("sodium"),show(result.total.sodium_mg,lang,0)+" mg"]].map(([k,v])=><div key={k} className="rounded-xl bg-[var(--lx-soft)] p-3"><div className="text-xs text-[var(--lx-faint)]">{k}</div><div className="mt-1 font-semibold">{v}</div></div>)}
  </div>
  <div className="mt-5 space-y-2">{result.items.map((x,i)=><div key={`${x.food_id}-${i}`} className="rounded-xl bg-[var(--lx-soft)] px-4 py-3 text-sm"><div className="flex items-center justify-between gap-4"><span>{displayName(x,lang)} · {x.grams}{t("grams")}</span><b>{show(x.kcal,lang,0)} kcal</b></div><div className="mt-1 text-xs text-[var(--lx-muted)]">{t("protein")} {show(x.protein_g,lang)}g · {t("carbs")} {show(x.carbs_g,lang)}g · {t("fat")} {show(x.fat_g,lang)}g</div></div>)}</div>
  <p className="mt-5 text-xs leading-5 text-[var(--lx-faint)]">{t("varianceNote")}</p>
 </section>
}

export default function FoodCalorieWorkbench(){
 const{lang}=useLingxiLang();const{currency}=usePreferredCurrency();const[mode,setMode]=useState<"name"|"image">("name"),[price,setPrice]=useState<Price|null>(null);
 const t=(k:Parameters<typeof foodUi>[1])=>foodUi(lang,k);
 useEffect(()=>{void fetch(`/api/tools/pricing?toolId=food-calorie&currency=${currency}`,{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>d&&setPrice(d)).catch(()=>{})},[currency]);

 const manualPrice=currency==="CNY"?`¥${Number(price?.amount_rmb??1).toFixed(2)}`:`$${Number(price?.amount_usd??0.5).toFixed(2)}`;

 return <div className="space-y-5" data-food-version="v1600">
  <div className="grid gap-3 sm:grid-cols-2">
   <button onClick={()=>setMode("name")} className={`rounded-2xl border p-5 text-left ${mode==="name"?"border-[var(--lx-ink)] bg-[var(--lx-soft)]":"border-[var(--lx-line)] bg-[var(--lx-panel)]"}`}><div className="font-semibold">{t("nameMode")}</div><div className="mt-1 text-sm text-[var(--lx-muted)]">{manualPrice} / {t("perCalc")}</div></button>
   <button onClick={()=>setMode("image")} className={`rounded-2xl border p-5 text-left ${mode==="image"?"border-[var(--lx-ink)] bg-[var(--lx-soft)]":"border-[var(--lx-line)] bg-[var(--lx-panel)]"}`}><div className="font-semibold">{t("imageMode")}</div><div className="mt-1 text-sm text-[var(--lx-muted)]">{t("imageModeLead")}</div></button>
  </div>
  {mode==="name"?<NameMode lang={lang}/>:<ImageMode lang={lang}/>}
 </div>;
}

function NameMode({lang,suggestion}:{lang:LingxiLang;suggestion?:{query:string;id:number}}){
 const t=(k:Parameters<typeof foodUi>[1])=>foodUi(lang,k);
 const[query,setQuery]=useState(""),[grams,setGrams]=useState(100),[hits,setHits]=useState<SearchItem[]>([]),[selected,setSelected]=useState<Selected[]>([]);
 const[searching,setSearching]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<CalcResult|null>(null);
 useEffect(()=>{if(suggestion){setQuery(suggestion.query);setHits([]);setResult(null);if(suggestion.query.trim())void search(suggestion.query)}},[suggestion?.id]);
 async function search(q0=query){const q=q0.trim();if(!q)return;setSearching(true);setError("");const items=await searchFood(q).catch(()=>[]);setHits(items);if(!items.length)setError(t("noFood"));setSearching(false)}
 function add(food:SearchItem){setSelected(v=>[...v,{food,grams:Math.max(1,Math.min(10000,Number(grams)||100))}]);setHits([]);setQuery("");setResult(null)}
 async function calculate(quoteId:string){setBusy(true);setError("");try{const r=await fetch("/api/tools/food/calculate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({quoteId,items:selected.map(x=>({food_id:x.food.food_id,grams:x.grams}))})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error();setResult(d)}catch{setError(t("calcFailed"))}finally{setBusy(false)}}
 const quick=lang==="zh"?QUICK_ZH:QUICK_EN;
 return <>
  <section className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
   <h2 className="text-lg font-semibold">{t("enterFoodWeight")}</h2>
   <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px_auto]"><input aria-label={t("foodName")} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void search()}} placeholder={t("foodPlaceholder")} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-4 py-3"/><input aria-label={t("weight")} type="number" min={1} max={10000} value={grams} onChange={e=>setGrams(Number(e.target.value)||1)} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-4 py-3"/><button onClick={()=>void search()} className="rounded-xl bg-[var(--lx-ink)] px-5 py-3 text-[var(--lx-bg)]">{searching?t("searching"):t("findFood")}</button></div>
   <div className="mt-3 flex flex-wrap gap-2">{quick.map(x=><button key={x} onClick={()=>{setQuery(x);void search(x)}} className="rounded-full border border-[var(--lx-line)] px-3 py-1.5 text-xs">{x}</button>)}</div>
   {hits.length>0&&<div className="mt-4 divide-y divide-[var(--lx-line)] rounded-xl border border-[var(--lx-line)]">{hits.map(x=><button key={x.food_id} onClick={()=>add(x)} className="flex w-full justify-between gap-4 px-4 py-3 text-left"><span className="min-w-0"><b className="block truncate">{displayName(x,lang)}</b>{lang!=="zh"&&x.name_zh&&<small className="text-[var(--lx-muted)]">{x.name_zh}</small>}</span><span>＋</span></button>)}</div>}
  </section>
  {selected.length>0&&<section className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5"><div className="space-y-2">{selected.map((x,i)=><div key={i} className="flex justify-between rounded-xl bg-[var(--lx-soft)] px-4 py-3"><span>{displayName(x.food,lang)} · {x.grams}{t("grams")}</span><button onClick={()=>setSelected(v=>v.filter((_,j)=>j!==i))}>{t("remove")}</button></div>)}</div><div className="mt-5">{busy?<span>{t("generating")}</span>:<PaidActionButton toolId="food-calorie" quantity={1} metadata={{mode:"name-weight",foods:selected.length}} onPaid={calculate} label={t("payGenerate")}/>}</div></section>}
  {result&&<Result result={result} lang={lang}/>}
  {error&&<p className="rounded-xl border border-[var(--lx-line)] p-4 text-sm">{error}</p>}
 </>;
}

function ImageMode({lang}:{lang:LingxiLang}){
 const t=(k:Parameters<typeof foodUi>[1])=>foodUi(lang,k);
 const[preview,setPreview]=useState("");
 const[suggestion,setSuggestion]=useState<{query:string;id:number}>();
 const[preds,setPreds]=useState<FoodVisionPrediction[]>([]),[checking,setChecking]=useState(false),[error,setError]=useState(""),[broad,setBroad]=useState(false);
 const attempt=useRef(0);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);
 async function inspect(file:File){
  const id=++attempt.current;if(preview)URL.revokeObjectURL(preview);setPreview(URL.createObjectURL(file));setPreds([]);setSuggestion(undefined);setError("");setChecking(true);
  try{
   const caps=await foodVisionCapabilities();setBroad(caps.broadZeroShot);
   const out=await recognizeFoodImage(file);if(id!==attempt.current)return;setPreds(out);
   const reliable=out.filter(p=>p.score>=0.08).slice(0,5);
   if(!reliable.length)setError(t("imageNoSuggestions"));
  }catch{if(id===attempt.current)setError(t("imageUnavailable"))}
  finally{if(id===attempt.current)setChecking(false)}
 }
 return <>
  <section className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
   <h2 className="text-lg font-semibold">{t("confirmPhoto")}</h2>
   <p className="mt-2 text-sm leading-6">{t("photoLead")}</p>
   <input aria-label={t("choosePhoto")} type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)void inspect(f)}} className="mt-4 block w-full text-sm"/>
   {preview&&<img src={preview} alt={t("previewAlt")} className="mt-4 max-h-72 rounded-xl object-contain"/>}
   {checking&&<p className="mt-3" role="status">{t("classifying")}</p>}
   {preds.length>0&&<div className="mt-4"><div className="flex items-center gap-2"><h3>{t("photoSuggestions")}</h3><span className="rounded-full bg-[var(--lx-soft)] px-2 py-1 text-[10px] text-[var(--lx-muted)]">{t("sourceLocal")}{broad?" · CLIP + Food101":" · Food101"}</span></div><div className="mt-2 flex flex-wrap gap-2">{preds.filter(p=>p.score>=0.05).slice(0,5).map(p=><button key={`${p.source}-${p.label}`} onClick={()=>setSuggestion({query:foodLabel(p.label,lang),id:Date.now()})} className="rounded-full border border-[var(--lx-line)] bg-[var(--lx-soft)] px-3 py-1.5 text-sm">{foodLabel(p.label,lang)} ＋</button>)}<button onClick={()=>setSuggestion({query:"",id:Date.now()})} className="rounded-full border border-[var(--lx-line)] px-3 py-1.5 text-sm">{t("noneThese")}</button></div></div>}
   <p className="mt-4 text-sm">{t("confirmSeparately")}</p>
   <p className="mt-2 text-xs text-[var(--lx-muted)]">{t("imageSmartHint")}</p>
   {error&&<p className="mt-3" role="alert">{error}</p>}
  </section>
  <NameMode key={preview} lang={lang} suggestion={suggestion}/>
 </>;
}
