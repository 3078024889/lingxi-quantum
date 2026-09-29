"use client";
import {useEffect,useRef,useState} from "react";
import PaidActionButton from "@/components/tools/PaidActionButton";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import {usePreferredCurrency} from "@/components/CurrencyPreferenceProvider";
import {recognizeFoodImage,type FoodVisionPrediction} from "@/lib/tools/food/image-recognition-local";
import {foodLabel} from "@/lib/tools/food/vision-labels";
import {canonicalQuery} from "@/lib/tools/food/canonical";
import FoodBatchWorkspace from "@/components/tools/FoodBatchWorkspace";

type SearchItem={food_id:number;code:string;name_zh:string;name_en?:string|null;category?:string|null;score:number;source_key?:string|null};
type Selected={food:SearchItem;grams:number};
type ResultItem={food_id:number;code:string;name_zh:string;name_en?:string|null;grams:number;kcal:number;protein_g?:number|null;carbs_g?:number|null;fat_g?:number|null;fiber_g?:number|null;sugar_g?:number|null;sodium_mg?:number|null;source_key?:string|null};
type Insight={tone:"good"|"watch"|"add";key:string;value?:number};
type CalcResult={items:ResultItem[];total:ResultItem&{grams:number};insights?:Insight[];next_actions?:string[];sources?:string[]};
type Price={amount_rmb:number;amount_usd:number};
const COPY:any={
 zh:{title:"拍一顿饭，看懂这一餐。",lead:"认出食物，确认份量，看看这餐有多少热量、营养够不够、下一餐怎么搭。",photo:"上传这一餐",manual:"直接填写",single:"单张",batch:"10 张",find:"找到它",food:"食物名称",weight:"份量（克）",add:"加进这一餐",pay:"开始分析",result:"这一餐",how:"吃得怎么样？",next:"下一餐可以这样搭",inside:"这一餐里有什么",source:"这些数字从哪里来？",sourceLead:"每项结果按食物、份量和可用营养资料计算；没有可靠数据的项目不会编成 0。",no:"暂时没找到。试试更常见的名字或英文名。",choose:"选择照片",checking:"正在看看照片里有什么…",possible:"照片里可能有",confirm:"点一下候选，再确认份量。",protein_good:"蛋白质比较充足",protein_add:"蛋白质还可以再补一点",fiber_good:"膳食纤维不错",fiber_add:"蔬菜、水果或全谷物可以再多一点",sodium_high:"这餐的钠偏高",sugar_high:"这餐的糖偏高",energy_dense:"这一餐能量比较集中",recorded:"这一餐已经记录下来",add_plants:"下一餐多加一份蔬菜或水果",add_protein:"下一餐补一份优质蛋白质",less_salt:"下一餐少一点汤汁、蘸料和高盐食物",less_sugar:"下一餐少一点甜饮和高糖食物",lighter_next:"下一餐可以清淡一些",keep_variety:"继续保持食物多样化",trend:"看看最近吃得怎么样"},
 en:{title:"See what this meal really adds up to.",lead:"Recognize the food, confirm the portions, then see the calories, nutrition balance and what could fit better next.",photo:"Upload this meal",manual:"Enter foods",single:"1 photo",batch:"10 photos",find:"Find it",food:"Food",weight:"Portion (g)",add:"Add to this meal",pay:"Analyze meal",result:"This meal",how:"How does it look?",next:"A useful next meal",inside:"What's in this meal",source:"Where do these numbers come from?",sourceLead:"Results use the food, confirmed portion and available composition data. Missing measurements are never invented as zero.",no:"No match yet. Try a common name or English name.",choose:"Choose photo",checking:"Checking what's in the photo…",possible:"This might be",confirm:"Choose a suggestion, then confirm the portion.",protein_good:"A solid amount of protein",protein_add:"Protein could use a little more",fiber_good:"A good amount of fiber",fiber_add:"Add more vegetables, fruit or whole grains",sodium_high:"Sodium is on the high side",sugar_high:"Sugar is on the high side",energy_dense:"This is an energy-dense meal",recorded:"Meal recorded",add_plants:"Add a serving of vegetables or fruit next meal",add_protein:"Add a quality protein next meal",less_salt:"Go lighter on sauces, soups and salty foods next meal",less_sugar:"Go lighter on sweet drinks and sugary foods next meal",lighter_next:"A lighter next meal may balance the day",keep_variety:"Keep a varied plate",trend:"See recent meals"}
};
function tr(lang:LingxiLang,k:string){return (COPY[lang]||COPY.en)?.[k]||COPY.en[k]||k}
const show=(v:unknown,d=1)=>v!==null&&v!==undefined&&Number.isFinite(Number(v))?Number(v).toFixed(d):"—";
const display=(x:SearchItem|ResultItem,lang:LingxiLang)=>lang==="zh"?x.name_zh:(x.name_en||x.name_zh);
async function searchFood(q:string):Promise<SearchItem[]>{const r=await fetch(`/api/tools/food/search?q=${encodeURIComponent(q)}`,{cache:"no-store"});const d=await r.json().catch(()=>({}));return r.ok&&Array.isArray(d.items)?d.items:[]}

export default function FoodCalorieWorkbench(){
 const{lang}=useLingxiLang();const{currency}=usePreferredCurrency();const[mode,setMode]=useState<"photo"|"manual"|"batch">("photo"),[price,setPrice]=useState<Price|null>(null);
 useEffect(()=>{void fetch(`/api/tools/pricing?toolId=food-calorie&currency=${currency}`,{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>d&&setPrice(d)).catch(()=>{})},[currency]);
 const one=currency==="CNY"?`¥${Number(price?.amount_rmb??3).toFixed(0)}`:`$${Number(price?.amount_usd??3).toFixed(0)}`;
 async function recognizeBatch(files:File[]){
  const results:Array<{file:File;predictions:FoodVisionPrediction[]}>=[];
  for(const file of files){
   const predictions=(await recognizeFoodImage(file)).filter(x=>x.score>=.05).slice(0,6);
   results.push({file,predictions});
  }
  return results;
 }
 return <div className="space-y-5" data-food-version="v14">
  <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
   <h2 className="text-2xl font-semibold">{tr(lang,"title")}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--lx-muted)]">{tr(lang,"lead")}</p>
   <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-[var(--lx-soft)] px-3 py-1.5 text-sm">{one} / {tr(lang,"single")}</span><span className="rounded-full bg-[var(--lx-soft)] px-3 py-1.5 text-sm">¥3 / 张 · $3 / 张</span></div>
  </section>
  <div className="grid gap-3 sm:grid-cols-3">
   <button onClick={()=>setMode("photo")} className={`rounded-2xl border p-4 text-left ${mode==="photo"?"border-[var(--lx-ink)] bg-[var(--lx-soft)]":"border-[var(--lx-line)]"}`}>{tr(lang,"photo")}</button>
   <button onClick={()=>setMode("manual")} className={`rounded-2xl border p-4 text-left ${mode==="manual"?"border-[var(--lx-ink)] bg-[var(--lx-soft)]":"border-[var(--lx-line)]"}`}>{tr(lang,"manual")}</button>
   <button onClick={()=>setMode("batch")} className={`rounded-2xl border p-4 text-left ${mode==="batch"?"border-[var(--lx-ink)] bg-[var(--lx-soft)]":"border-[var(--lx-line)]"}`}>多张一起看</button>
  </div>
  {mode==="photo"?<PhotoMode lang={lang}/>:mode==="batch"?<FoodBatchWorkspace onRecognize={recognizeBatch}/>:<MealEditor lang={lang}/>}
 </div>
}

function PhotoMode({lang}:{lang:LingxiLang}){
 const[preview,setPreview]=useState(""),[preds,setPreds]=useState<FoodVisionPrediction[]>([]),[suggestion,setSuggestion]=useState<{query:string;id:number}>(),[busy,setBusy]=useState(false);const attempt=useRef(0);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);
 async function inspect(file:File){const id=++attempt.current;if(preview)URL.revokeObjectURL(preview);setPreview(URL.createObjectURL(file));setPreds([]);setBusy(true);try{const out=await recognizeFoodImage(file);if(id===attempt.current)setPreds(out.filter(x=>x.score>=.05).slice(0,6))}finally{if(id===attempt.current)setBusy(false)}}
 return <><section className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
  <input type="file" accept="image/*" aria-label={tr(lang,"choose")} onChange={e=>{const f=e.target.files?.[0];if(f)void inspect(f)}}/>
  {preview&&<img src={preview} alt="" className="mt-4 max-h-72 rounded-xl object-contain"/>}{busy&&<p className="mt-3 text-sm">{tr(lang,"checking")}</p>}
  {preds.length>0&&<div className="mt-4"><b>{tr(lang,"possible")}</b><div className="mt-2 flex flex-wrap gap-2">{preds.map(p=><button key={`${p.source}-${p.label}`} onClick={()=>setSuggestion({query:p.label,id:Date.now()})} className="rounded-full border border-[var(--lx-line)] bg-[var(--lx-soft)] px-3 py-1.5 text-sm">{foodLabel(p.label,lang)} ＋</button>)}</div><p className="mt-3 text-xs text-[var(--lx-muted)]">{tr(lang,"confirm")}</p></div>}
 </section><MealEditor lang={lang} suggestion={suggestion}/></>
}

function MealEditor({lang,suggestion}:{lang:LingxiLang;suggestion?:{query:string;id:number}}){
 const[q,setQ]=useState(""),[grams,setGrams]=useState(100),[hits,setHits]=useState<SearchItem[]>([]),[selected,setSelected]=useState<Selected[]>([]),[error,setError]=useState(""),[result,setResult]=useState<CalcResult|null>(null),[busy,setBusy]=useState(false);
 async function search(q0=q){const x=q0.trim();if(!x)return;const rows=await searchFood(x).catch(()=>[]);setHits(rows);setError(rows.length?"":tr(lang,"no"))}
 useEffect(()=>{if(suggestion?.query){setQ(suggestion.query);void search(suggestion.query)}},[suggestion?.id]);
 function add(food:SearchItem){setSelected(v=>[...v,{food,grams:Math.max(1,Math.min(10000,grams||100))}]);setHits([]);setQ("");setResult(null)}
 async function calc(quoteId:string){setBusy(true);setError("");try{const r=await fetch("/api/tools/food/calculate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({quoteId,photoCount:1,items:selected.map(x=>({food_id:x.food.food_id,grams:x.grams}))})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error();setResult(d)}catch{setError(lang==="zh"?"这次没有算完，请再试一次。":"This analysis did not finish. Please try again.")}finally{setBusy(false)}}
 return <div className="space-y-5">
  <section className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5"><div className="grid gap-3 sm:grid-cols-[1fr_140px_auto]"><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&void search()} placeholder={tr(lang,"food")} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-4 py-3"/><input type="number" min={1} max={10000} value={grams} onChange={e=>setGrams(Number(e.target.value)||1)} aria-label={tr(lang,"weight")} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-4 py-3"/><button onClick={()=>void search()} className="rounded-xl bg-[var(--lx-ink)] px-5 py-3 text-[var(--lx-bg)]">{tr(lang,"find")}</button></div>
  {hits.length>0&&<div className="mt-3 divide-y divide-[var(--lx-line)] rounded-xl border border-[var(--lx-line)]">{hits.map(x=><button key={x.food_id} onClick={()=>add(x)} className="flex w-full justify-between px-4 py-3 text-left"><span><b>{display(x,lang)}</b>{x.category&&<small className="ml-2 text-[var(--lx-muted)]">{x.category}</small>}</span><span>＋</span></button>)}</div>}{error&&<p className="mt-3 text-sm">{error}</p>}</section>
  {selected.length>0&&<section className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5"><div className="space-y-2">{selected.map((x,i)=><div key={i} className="flex justify-between rounded-xl bg-[var(--lx-soft)] px-4 py-3"><span>{display(x.food,lang)} · {x.grams}g</span><button onClick={()=>setSelected(v=>v.filter((_,j)=>j!==i))}>×</button></div>)}</div><div className="mt-5">{busy?<span>…</span>:<PaidActionButton toolId="food-calorie" quantity={1} metadata={{mode:"meal-analysis",foods:selected.length}} onPaid={calc} label={tr(lang,"pay")}/>}</div></section>}
  {result&&<Result result={result} lang={lang}/>}
 </div>
}

function Result({result,lang}:{result:CalcResult;lang:LingxiLang}){
 const t=result.total;return <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
  <div className="text-sm text-[var(--lx-muted)]">{tr(lang,"result")}</div><div className="mt-1 text-4xl font-semibold">{show(t.kcal,0)} kcal</div>
  <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{[["蛋白质 / Protein",t.protein_g,"g"],["碳水 / Carbs",t.carbs_g,"g"],["脂肪 / Fat",t.fat_g,"g"],["纤维 / Fiber",t.fiber_g,"g"],["糖 / Sugar",t.sugar_g,"g"],["钠 / Sodium",t.sodium_mg,"mg"]].map(([k,v,u])=><div key={String(k)} className="rounded-xl bg-[var(--lx-soft)] p-3"><small className="text-[var(--lx-muted)]">{k}</small><div className="mt-1 font-semibold">{show(v)} {u}</div></div>)}</div>
  <h3 className="mt-6 text-lg font-semibold">{tr(lang,"how")}</h3><div className="mt-2 grid gap-2 sm:grid-cols-2">{(result.insights||[]).map((x,i)=><div key={i} className="rounded-xl bg-[var(--lx-soft)] p-3">{tr(lang,x.key)}</div>)}</div>
  <h3 className="mt-6 text-lg font-semibold">{tr(lang,"next")}</h3><div className="mt-2 space-y-2">{(result.next_actions||[]).map((x,i)=><p key={i}>• {tr(lang,x)}</p>)}</div>
  <h3 className="mt-6 text-lg font-semibold">{tr(lang,"inside")}</h3><div className="mt-2 space-y-2">{result.items.map((x,i)=><div key={`${x.food_id}-${i}`} className="flex justify-between rounded-xl bg-[var(--lx-soft)] px-4 py-3"><span>{display(x,lang)} · {x.grams}g</span><b>{show(x.kcal,0)} kcal</b></div>)}</div>
  <details className="mt-6 rounded-xl border border-[var(--lx-line)] p-4"><summary className="cursor-pointer font-semibold">{tr(lang,"source")}</summary><p className="mt-2 text-sm leading-6 text-[var(--lx-muted)]">{tr(lang,"sourceLead")}</p>{result.sources?.length?<p className="mt-2 text-xs">{result.sources.join(" · ")}</p>:null}</details>
 </section>
}
