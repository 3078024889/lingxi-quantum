"use client";

import {useMemo,useState} from "react";
import FileDropzone from "@/components/tools/FileDropzone";
import PaidActionButton from "@/components/tools/PaidActionButton";
import {useLingxiLang} from "@/lib/lingxi-i18n";

type SearchItem={
 food_id:number;code:string;name_zh:string;name_en?:string|null;category?:string|null;
 kcal_per_100g:number;protein_g_per_100g:number;carbs_g_per_100g:number;fat_g_per_100g:number;score:number;
};
type Selected={food:SearchItem;grams:number};
type CalcResult={
 items:Array<{food_id:number;code:string;name_zh:string;name_en?:string|null;grams:number;kcal:number;protein_g:number;carbs_g:number;fat_g:number;fiber_g?:number|null;sodium_mg?:number|null;sugar_g?:number|null}>;
 total:{grams:number;kcal:number;protein_g:number;carbs_g:number;fat_g:number;fiber_g?:number;sodium_mg?:number;sugar_g?:number};
};

export default function FoodCalorieWorkbench(){
 const{lang}=useLingxiLang();const zh=lang==="zh";
 const[files,setFiles]=useState<File[]>([]);
 const[query,setQuery]=useState("");
 const[hits,setHits]=useState<SearchItem[]>([]);
 const[selected,setSelected]=useState<Selected[]>([]);
 const[grams,setGrams]=useState(100);
 const[busy,setBusy]=useState(false);
 const[searching,setSearching]=useState(false);
 const[error,setError]=useState("");
 const[result,setResult]=useState<CalcResult|null>(null);

 const quantity=Math.max(1,files.length||1);

 async function search(){
  const q=query.trim();if(!q)return;
  setSearching(true);setError("");
  try{
   const r=await fetch(`/api/tools/food/search?q=${encodeURIComponent(q)}`,{cache:"no-store"});
   const d=await r.json();
   if(!r.ok)throw new Error(d.error||"FOOD_SEARCH_FAILED");
   setHits(Array.isArray(d.items)?d.items:[]);
  }catch(e){setError(e instanceof Error?e.message:String(e))}
  finally{setSearching(false)}
 }

 function add(food:SearchItem){
  const g=Math.max(1,Math.min(10000,Number(grams)||100));
  setSelected(v=>[...v,{food,grams:g}]);
  setQuery("");setHits([]);setResult(null);
 }

 async function calculate(_quoteId:string){
  if(!selected.length)return;
  setBusy(true);setError("");setResult(null);
  try{
   const r=await fetch("/api/tools/food/calculate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({items:selected.map(x=>({food_id:x.food.food_id,grams:x.grams}))})});
   const d=await r.json();
   if(!r.ok)throw new Error(d.error||"FOOD_CALCULATION_FAILED");
   setResult(d);
  }catch(e){setError(e instanceof Error?e.message:String(e))}
  finally{setBusy(false)}
 }

 const previewNames=useMemo(()=>files.map(f=>f.name).join("、"),[files]);

 return <div className="space-y-5">
  <div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4 text-sm leading-6 text-[var(--lx-muted)]">
   {zh?"这项计算不把照片发送给生成式 AI。营养结果来自食物数据库与确定性计算；照片只留在当前浏览器作为这一餐的参考。":"This calculation does not send photos to generative AI. Nutrition comes from the food database and deterministic calculation; photos stay in this browser only as meal references."}
  </div>

  <FileDropzone accept="image/*" multiple maxFiles={10} maxSizeMB={10} files={files} onChange={f=>{setFiles(f);setResult(null)}} disabled={busy}/>
  {previewNames&&<p className="text-xs text-[var(--lx-faint)]">{zh?"本地参考：":"Local reference: "}{previewNames}</p>}

  <div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
   <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
    <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void search()}} placeholder={zh?"输入食物名称，例如：米饭、鸡胸肉、番茄":"Food name, e.g. rice, chicken breast, tomato"} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-4 py-3 text-sm text-[var(--lx-ink)] outline-none"/>
    <label className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-3 py-2 text-xs text-[var(--lx-faint)]">{zh?"重量（克）":"Weight (g)"}<input type="number" min={1} max={10000} value={grams} onChange={e=>setGrams(Math.max(1,Number(e.target.value)||1))} className="mt-1 w-full bg-transparent text-base text-[var(--lx-ink)] outline-none"/></label>
    <button onClick={()=>void search()} disabled={!query.trim()||searching} className="rounded-xl bg-[var(--lx-ink)] px-5 py-3 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">{searching?(zh?"正在查找…":"Searching…"):(zh?"查找食物":"Find food")}</button>
   </div>

   {hits.length>0&&<div className="mt-4 divide-y divide-[var(--lx-line)] rounded-xl border border-[var(--lx-line)]">
    {hits.map(x=><button key={x.food_id} onClick={()=>add(x)} className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-[var(--lx-soft)]">
     <span><b className="text-sm text-[var(--lx-ink)]">{zh?x.name_zh:(x.name_en||x.name_zh)}</b><span className="ml-2 text-xs text-[var(--lx-faint)]">{x.category||""}</span></span>
     <span className="shrink-0 text-xs text-[var(--lx-muted)]">{Number(x.kcal_per_100g).toFixed(0)} kcal / 100g</span>
    </button>)}
   </div>}
  </div>

  {selected.length>0&&<div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
   <div className="space-y-2">{selected.map((x,i)=><div key={`${x.food.food_id}-${i}`} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--lx-soft)] px-4 py-3 text-sm">
    <span className="text-[var(--lx-ink)]">{zh?x.food.name_zh:(x.food.name_en||x.food.name_zh)} · {x.grams}g</span>
    <button onClick={()=>{setSelected(v=>v.filter((_,j)=>j!==i));setResult(null)}} className="text-[var(--lx-faint)]">{zh?"移除":"Remove"}</button>
   </div>)}</div>
   <div className="mt-4">{busy?<button disabled className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] opacity-50">{zh?"正在计算…":"Calculating…"}</button>:<PaidActionButton toolId="food-calorie" quantity={quantity} metadata={{foods:selected.length,images:files.length,engine:"deterministic-food-db"}} onPaid={calculate} label={zh?"确认本次计算价格":"Confirm calculation price"}/>}</div>
  </div>}

  {result&&<div className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
   <div className="text-sm text-[var(--lx-faint)]">{zh?"这餐合计":"Meal total"}</div>
   <div className="mt-1 text-3xl font-semibold text-[var(--lx-ink)]">{Number(result.total.kcal||0).toFixed(0)} kcal</div>
   <div className="mt-2 text-sm text-[var(--lx-muted)]">{zh?"蛋白质":"Protein"} {Number(result.total.protein_g||0).toFixed(1)}g · {zh?"碳水":"Carbs"} {Number(result.total.carbs_g||0).toFixed(1)}g · {zh?"脂肪":"Fat"} {Number(result.total.fat_g||0).toFixed(1)}g</div>
   <div className="mt-4 space-y-2">{result.items.map((x,i)=><div key={`${x.food_id}-${i}`} className="flex items-center justify-between gap-4 rounded-xl bg-[var(--lx-soft)] px-4 py-3 text-sm"><span>{zh?x.name_zh:(x.name_en||x.name_zh)} · {x.grams}g</span><b>{Number(x.kcal).toFixed(0)} kcal</b></div>)}</div>
  </div>}

  {error&&<p role="alert" className="rounded-xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-4 text-sm text-[var(--lx-danger)]">{error}</p>}
 </div>;
}
