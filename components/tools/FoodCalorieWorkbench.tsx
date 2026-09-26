"use client";

import {useState} from "react";
import PaidActionButton from "@/components/tools/PaidActionButton";
import {useLingxiLang} from "@/lib/lingxi-i18n";

type SearchItem={food_id:number;code:string;name_zh:string;name_en?:string|null;category?:string|null;kcal_per_100g:number;protein_g_per_100g:number;carbs_g_per_100g:number;fat_g_per_100g:number;score:number;};
type Selected={food:SearchItem;grams:number};
type CalcResult={items:Array<{food_id:number;code:string;name_zh:string;name_en?:string|null;grams:number;kcal:number;protein_g:number;carbs_g:number;fat_g:number}>;total:{grams:number;kcal:number;protein_g:number;carbs_g:number;fat_g:number};};

const QUICK=["米饭","鸡蛋","鸡胸肉","苹果","香蕉","橙子","牛奶","面包"];

export default function FoodCalorieWorkbench(){
 const{lang}=useLingxiLang();const zh=lang==="zh";
 const[query,setQuery]=useState(""),[grams,setGrams]=useState(100);
 const[hits,setHits]=useState<SearchItem[]>([]),[selected,setSelected]=useState<Selected[]>([]);
 const[searching,setSearching]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<CalcResult|null>(null);

 async function search(q0=query){
  const q=q0.trim();if(!q)return;
  setSearching(true);setError("");setHits([]);
  try{
   const r=await fetch(`/api/tools/food/search?q=${encodeURIComponent(q)}`,{cache:"no-store"});
   const d=await r.json().catch(()=>({}));
   if(!r.ok)throw new Error("SEARCH_FAILED");
   const items=Array.isArray(d.items)?d.items:[];
   setHits(items);
   if(!items.length)setError(zh?"没有找到这个食物，换个更常见的名称试试。":"No matching food found. Try a simpler name.");
  }catch{setError(zh?"暂时没有查到结果，请稍后再试。":"No result right now. Try again shortly.")}
  finally{setSearching(false)}
 }
 function add(food:SearchItem){
  const g=Math.max(1,Math.min(10000,Number(grams)||100));
  setSelected(v=>[...v,{food,grams:g}]);setQuery("");setHits([]);setResult(null);setError("");
 }
 async function calculate(quoteId:string){
  if(!selected.length)return;
  setBusy(true);setError("");setResult(null);
  try{
   const r=await fetch("/api/tools/food/calculate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({quoteId,items:selected.map(x=>({food_id:x.food.food_id,grams:x.grams}))})});
   const d=await r.json().catch(()=>({}));
   if(!r.ok)throw new Error(String(d.error||"CALCULATION_FAILED"));
   setResult(d);
  }catch(e){
   const code=e instanceof Error?e.message:"";
   setError(code.includes("PAYMENT")||code.includes("GRANT")?(zh?"付款还没有确认，请完成支付后再计算。":"Payment has not been confirmed yet."):(zh?"这次没有计算成功，请重试。":"Calculation did not finish. Try again."));
  }finally{setBusy(false)}
 }

 return <div className="space-y-5">
  <section className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
   <h2 className="text-lg font-semibold text-[var(--lx-ink)]">{zh?"添加这一餐的食物":"Add foods in this meal"}</h2>
   <p className="mt-2 text-sm leading-6 text-[var(--lx-muted)]">{zh?"可以一次输入多个名称，用空格、逗号或顿号分开。":"Enter one or several food names separated by spaces or commas."}</p>
   <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px_auto]">
    <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void search()}} placeholder={zh?"例如：米饭 鸡蛋 青菜":"e.g. rice egg broccoli"} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-4 py-3 text-sm text-[var(--lx-ink)] outline-none"/>
    <label className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-3 py-2 text-xs text-[var(--lx-faint)]">{zh?"份量（克）":"Amount (g)"}<input type="number" min={1} max={10000} value={grams} onChange={e=>setGrams(Math.max(1,Number(e.target.value)||1))} className="mt-1 w-full bg-transparent text-base text-[var(--lx-ink)] outline-none"/></label>
    <button onClick={()=>void search()} disabled={!query.trim()||searching} className="rounded-xl bg-[var(--lx-ink)] px-5 py-3 text-sm font-medium text-[var(--lx-bg)] disabled:opacity-40">{searching?(zh?"正在查找…":"Searching…"):(zh?"查找":"Search")}</button>
   </div>
   <div className="mt-3 flex flex-wrap gap-2">{QUICK.map(x=><button key={x} onClick={()=>{setQuery(x);void search(x)}} className="rounded-full border border-[var(--lx-line)] px-3 py-1.5 text-xs text-[var(--lx-muted)]">{x}</button>)}</div>

   {hits.length>0&&<div className="mt-4 divide-y divide-[var(--lx-line)] rounded-xl border border-[var(--lx-line)]">
    {hits.map(x=><button key={x.food_id} onClick={()=>add(x)} className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-[var(--lx-soft)]">
     <span><b className="text-sm text-[var(--lx-ink)]">{zh?x.name_zh:(x.name_en||x.name_zh)}</b>{x.category&&<span className="ml-2 text-xs text-[var(--lx-faint)]">{x.category}</span>}</span>
     <span className="shrink-0 text-xs text-[var(--lx-muted)]">{Number(x.kcal_per_100g).toFixed(0)} kcal / 100g</span>
    </button>)}
   </div>}
  </section>

  {selected.length>0&&<section className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
   <h2 className="text-lg font-semibold text-[var(--lx-ink)]">{zh?"本餐食物":"Meal items"}</h2>
   <div className="mt-3 space-y-2">{selected.map((x,i)=><div key={`${x.food.food_id}-${i}`} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--lx-soft)] px-4 py-3 text-sm">
    <span className="text-[var(--lx-ink)]">{zh?x.food.name_zh:(x.food.name_en||x.food.name_zh)} · {x.grams}g</span>
    <button onClick={()=>{setSelected(v=>v.filter((_,j)=>j!==i));setResult(null)}} className="text-[var(--lx-faint)]">{zh?"移除":"Remove"}</button>
   </div>)}</div>
   <div className="mt-5">{busy?<button disabled className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)] opacity-50">{zh?"正在计算这一餐…":"Calculating meal…"}</button>:<PaidActionButton toolId="food-calorie" quantity={1} metadata={{foods:selected.length}} onPaid={calculate} label={zh?"查看价格并计算":"See price & calculate"}/>}</div>
  </section>}

  {result&&<section className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
   <div className="text-sm text-[var(--lx-faint)]">{zh?"本餐合计":"Meal total"}</div>
   <div className="mt-1 text-3xl font-semibold text-[var(--lx-ink)]">{Number(result.total.kcal||0).toFixed(0)} kcal</div>
   <div className="mt-2 text-sm text-[var(--lx-muted)]">{zh?"蛋白质":"Protein"} {Number(result.total.protein_g||0).toFixed(1)}g · {zh?"碳水":"Carbs"} {Number(result.total.carbs_g||0).toFixed(1)}g · {zh?"脂肪":"Fat"} {Number(result.total.fat_g||0).toFixed(1)}g</div>
   <div className="mt-4 space-y-2">{result.items.map((x,i)=><div key={`${x.food_id}-${i}`} className="flex items-center justify-between gap-4 rounded-xl bg-[var(--lx-soft)] px-4 py-3 text-sm"><span>{zh?x.name_zh:(x.name_en||x.name_zh)} · {x.grams}g</span><b>{Number(x.kcal).toFixed(0)} kcal</b></div>)}</div>
  </section>}

  {error&&<p role="alert" className="rounded-xl border border-[var(--lx-danger)] bg-[var(--lx-panel)] p-4 text-sm text-[var(--lx-danger)]">{error}</p>}
 </div>;
}
