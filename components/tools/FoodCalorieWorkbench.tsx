"use client";

import {useEffect,useRef,useState} from "react";
import PaidActionButton from "@/components/tools/PaidActionButton";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {usePreferredCurrency} from "@/components/CurrencyPreferenceProvider";
import {recognizeFoodImage,type FoodVisionPrediction} from "@/lib/tools/food/image-recognition-local";

type SearchItem={food_id:number;code:string;name_zh:string;name_en?:string|null;category?:string|null;score:number};
type Selected={food:SearchItem;grams:number};
type ResultItem={food_id:number;code:string;name_zh:string;name_en?:string|null;grams:number;kcal:number;protein_g?:number|null;carbs_g?:number|null;fat_g?:number|null;fiber_g?:number|null;sugar_g?:number|null;sodium_mg?:number|null;nutrients?:Record<string,number|null>|null;source?:string|null};
type CalcResult={items:ResultItem[];total:ResultItem&{grams:number};source?:string|null};
type Price={amount_rmb:number;amount_usd:number};

const QUICK=["米饭","鸡蛋","鸡胸肉","苹果","香蕉","橙子","牛奶","面包"];
const show=(v:unknown,d=1)=>v!==null&&v!==undefined&&v!==""&&Number.isFinite(Number(v))?Number(v).toFixed(d):"暂无测定值";

async function searchFood(q:string):Promise<SearchItem[]>{
 const r=await fetch(`/api/tools/food/search?q=${encodeURIComponent(q)}`,{cache:"no-store"});
 const d=await r.json().catch(()=>({}));
 return r.ok&&Array.isArray(d.items)?d.items:[];
}

function Result({result,zh}:{result:CalcResult;zh:boolean}){
 return <section className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
  <div className="text-sm text-[var(--lx-faint)]">{zh?"完整营养结果":"Complete nutrition result"}</div>
  <div className="mt-1 text-3xl font-semibold text-[var(--lx-ink)]">{show(result.total.kcal,0)} kcal</div>
  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
   {[[zh?"蛋白质":"Protein",show(result.total.protein_g)+" g"],[zh?"碳水化合物":"Carbohydrate",show(result.total.carbs_g)+" g"],[zh?"脂肪":"Fat",show(result.total.fat_g)+" g"],[zh?"膳食纤维":"Fiber",show(result.total.fiber_g)+" g"],[zh?"糖":"Sugar",show(result.total.sugar_g)+" g"],[zh?"钠":"Sodium",show(result.total.sodium_mg,0)+" mg"]].map(([k,v])=><div key={k} className="rounded-xl bg-[var(--lx-soft)] p-3"><div className="text-xs text-[var(--lx-faint)]">{k}</div><div className="mt-1 font-semibold">{v}</div></div>)}
  </div>
  <div className="mt-5 space-y-2">{result.items.map((x,i)=><div key={`${x.food_id}-${i}`} className="rounded-xl bg-[var(--lx-soft)] px-4 py-3 text-sm"><div className="flex items-center justify-between gap-4"><span>{zh?x.name_zh:(x.name_en||x.name_zh)} · {x.grams}g</span><b>{show(x.kcal,0)} kcal</b></div><div className="mt-1 text-xs text-[var(--lx-muted)]">{zh?"蛋白质":"P"} {show(x.protein_g)}g · {zh?"碳水":"C"} {show(x.carbs_g)}g · {zh?"脂肪":"F"} {show(x.fat_g)}g</div></div>)}</div>
  <p className="mt-5 text-xs leading-5 text-[var(--lx-faint)]">{zh?"不同品种、品牌与烹饪方式会带来差异；没有测定的数据会显示“暂无测定值”，不会用 0 代替。":"Values vary by variety, brand and preparation. Missing measurements are shown as unavailable rather than zero."}</p>
 </section>
}

export default function FoodCalorieWorkbench(){
 const{lang}=useLingxiLang();const zh=lang==="zh";const{currency}=usePreferredCurrency();
 const[mode,setMode]=useState<"name"|"image">("name"),[price,setPrice]=useState<Price|null>(null);
 useEffect(()=>{void fetch(`/api/tools/pricing?toolId=food-calorie&currency=${currency}`,{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>d&&setPrice(d)).catch(()=>{})},[currency]);

 const manualPrice=currency==="CNY"?`¥${Number(price?.amount_rmb??1).toFixed(2)}`:`$${Number(price?.amount_usd??0.5).toFixed(2)}`;
 const imagePrice=currency==="CNY"?`¥${Number((price?.amount_rmb??1)*2).toFixed(2)}`:`$${Number((price?.amount_usd??0.5)*2).toFixed(2)}`;

 return <div className="space-y-5">
  <div className="grid gap-3 sm:grid-cols-2">
   <button onClick={()=>setMode("name")} className={`rounded-2xl border p-5 text-left ${mode==="name"?"border-[var(--lx-ink)] bg-[var(--lx-soft)]":"border-[var(--lx-line)] bg-[var(--lx-panel)]"}`}><div className="font-semibold">{zh?"输入食物名称 + 重量":"Food name + weight"}</div><div className="mt-1 text-sm text-[var(--lx-muted)]">{manualPrice} / {zh?"次":"calculation"}</div></button>
   <button onClick={()=>setMode("image")} className={`rounded-2xl border p-5 text-left ${mode==="image"?"border-[var(--lx-ink)] bg-[var(--lx-soft)]":"border-[var(--lx-line)] bg-[var(--lx-panel)]"}`}><div className="font-semibold">{zh?"上传图片识别食物":"Recognize food from a photo"}</div><div className="mt-1 text-sm text-[var(--lx-muted)]">{zh?"免费查看分类建议，确认食物后按名称计算价格结算":"Free classification suggestions; confirmed foods use name-mode pricing"}</div></button>
  </div>
  {mode==="name"?<NameMode zh={zh}/>:<ImageMode zh={zh}/>}
 </div>;
}

function NameMode({zh}:{zh:boolean}){
 const[query,setQuery]=useState(""),[grams,setGrams]=useState(100),[hits,setHits]=useState<SearchItem[]>([]),[selected,setSelected]=useState<Selected[]>([]);
 const[searching,setSearching]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<CalcResult|null>(null);
 async function search(q0=query){const q=q0.trim();if(!q)return;setSearching(true);setError("");const items=await searchFood(q).catch(()=>[]);setHits(items);if(!items.length)setError(zh?"没有找到这个食物，换个更常见的名称试试。":"No matching food found.");setSearching(false)}
 function add(food:SearchItem){setSelected(v=>[...v,{food,grams:Math.max(1,Math.min(10000,Number(grams)||100))}]);setHits([]);setQuery("");setResult(null)}
 async function calculate(quoteId:string){setBusy(true);setError("");try{const r=await fetch("/api/tools/food/calculate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({quoteId,items:selected.map(x=>({food_id:x.food.food_id,grams:x.grams}))})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error();setResult(d)}catch{setError(zh?"这次没有计算成功，请重试。":"Calculation did not finish.")}finally{setBusy(false)}}
 return <>
  <section className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
   <h2 className="text-lg font-semibold">{zh?"输入食物和实际重量":"Enter foods and actual weight"}</h2>
   <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px_auto]"><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void search()}} placeholder={zh?"例如：帝王蟹、米饭、面包":"e.g. king crab, rice, bread"} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-4 py-3"/><input type="number" min={1} max={10000} value={grams} onChange={e=>setGrams(Number(e.target.value)||1)} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-4 py-3"/><button onClick={()=>void search()} className="rounded-xl bg-[var(--lx-ink)] px-5 py-3 text-[var(--lx-bg)]">{searching?(zh?"查找中…":"Searching…"):(zh?"查找食物":"Find food")}</button></div>
   <div className="mt-3 flex flex-wrap gap-2">{QUICK.map(x=><button key={x} onClick={()=>{setQuery(x);void search(x)}} className="rounded-full border border-[var(--lx-line)] px-3 py-1.5 text-xs">{x}</button>)}</div>
   {hits.length>0&&<div className="mt-4 divide-y divide-[var(--lx-line)] rounded-xl border border-[var(--lx-line)]">{hits.map(x=><button key={x.food_id} onClick={()=>add(x)} className="flex w-full justify-between px-4 py-3 text-left"><span>{zh?x.name_zh:(x.name_en||x.name_zh)}</span><span>＋</span></button>)}</div>}
  </section>
  {selected.length>0&&<section className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5"><div className="space-y-2">{selected.map((x,i)=><div key={i} className="flex justify-between rounded-xl bg-[var(--lx-soft)] px-4 py-3"><span>{zh?x.food.name_zh:(x.food.name_en||x.food.name_zh)} · {x.grams}g</span><button onClick={()=>setSelected(v=>v.filter((_,j)=>j!==i))}>{zh?"移除":"Remove"}</button></div>)}</div><div className="mt-5">{busy?<span>{zh?"正在生成完整结果…":"Generating…"}</span>:<PaidActionButton toolId="food-calorie" quantity={1} metadata={{mode:"name-weight",foods:selected.length}} onPaid={calculate} label={zh?"支付后生成完整营养结果":"Pay & generate full nutrition result"}/>}</div></section>}
  {result&&<Result result={result} zh={zh}/>}
  {error&&<p className="rounded-xl border border-[var(--lx-line)] p-4 text-sm">{error}</p>}
 </>;
}

function ImageMode({zh}:{zh:boolean}){
 const[preview,setPreview]=useState("");
 const[preds,setPreds]=useState<FoodVisionPrediction[]>([]),[checking,setChecking]=useState(false),[error,setError]=useState("");
 const attempt=useRef(0);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);
 async function inspect(file:File){
  const id=++attempt.current; setPreview(URL.createObjectURL(file)); setPreds([]);setError("");setChecking(true);
  try{const out=await recognizeFoodImage(file);if(id!==attempt.current)return;setPreds(out);if(!out.length)setError(zh?"未获得分类建议，请手动填写食物。":"No suggestions. Please enter foods manually.");}
  catch{if(id===attempt.current)setError(zh?"图片分类暂不可用，请手动填写食物。":"Image classification unavailable. Please enter foods manually.");}
  finally{if(id===attempt.current)setChecking(false)}
 }
 return <>
  <section className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
   <h2 className="text-lg font-semibold">{zh?"看图确认食物，再计算营养":"Confirm foods before calculating nutrition"}</h2>
   <p className="mt-2 text-sm leading-6">{zh?"这是设备本地运行的 Food-101 食物分类模型，只能在有限类别中给出建议，不能可靠拆分水果拼盘、混合菜或判断重量。分数不代表识别正确率。":"Food-101 runs locally and suggests a limited set of classes. It cannot reliably separate platters or mixed dishes, or measure weight. Scores are not accuracy guarantees."}</p>
   <input aria-label={zh?"选择食物照片":"Choose food photo"} type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)void inspect(f)}} className="mt-4 block w-full text-sm"/>
   {preview&&<img src={preview} alt={zh?"待确认的食物照片":"Food to confirm"} className="mt-4 max-h-72 rounded-xl object-contain"/>}
   {checking&&<p role="status">{zh?"正在生成分类建议…":"Classifying…"}</p>}
   {preds.length>0&&<div className="mt-4"><h3>{zh?"分类建议（请自行核对）":"Classification suggestions — please verify"}</h3><div className="mt-2 flex flex-wrap gap-2">{preds.map(p=><span key={p.label} className="rounded-full bg-[var(--lx-soft)] px-3 py-1.5 text-sm">{p.label} · {zh?"模型分数":"score"} {Math.round(p.score*100)}%</span>)}</div></div>}
   <p className="mt-4 text-sm">{zh?"请在下方分别添加你确认的食物与实际重量。图片建议不会自动变成营养结果；例如水果拼盘应逐项添加水果。":"Add each confirmed food and its measured weight below. Suggestions never automatically become nutrition results."}</p>
   {error&&<p role="alert">{error}</p>}
  </section>
  <NameMode zh={zh}/>
 </>;
}
