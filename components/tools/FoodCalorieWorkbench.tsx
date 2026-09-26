"use client";

import {useEffect,useMemo,useState} from "react";
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
const show=(v:unknown,d=1)=>Number.isFinite(Number(v))?Number(v).toFixed(d):"暂无测定值";

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
   <button onClick={()=>setMode("image")} className={`rounded-2xl border p-5 text-left ${mode==="image"?"border-[var(--lx-ink)] bg-[var(--lx-soft)]":"border-[var(--lx-line)] bg-[var(--lx-panel)]"}`}><div className="font-semibold">{zh?"上传图片识别食物":"Recognize food from a photo"}</div><div className="mt-1 text-sm text-[var(--lx-muted)]">{imagePrice} / {zh?"张":"image"}</div></button>
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
 const[file,setFile]=useState<File|null>(null),[preview,setPreview]=useState(""),[grams,setGrams]=useState(100);
 const[preds,setPreds]=useState<FoodVisionPrediction[]>([]),[ready,setReady]=useState(false),[checking,setChecking]=useState(false),[paidQuote,setPaidQuote]=useState("");
 const[hits,setHits]=useState<SearchItem[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<CalcResult|null>(null);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);

 async function inspect(f:File){
  setChecking(true);setReady(false);setPreds([]);setHits([]);setResult(null);setError("");
  try{const out=await recognizeFoodImage(f);if(!out.length||out[0].score<0.12)throw new Error();setPreds(out);setReady(true)}
  catch{setError(zh?"这张图片暂时无法可靠识别，换一张更清楚、主体更单一的食物照片。":"This photo cannot be recognized reliably. Try a clearer food photo.")}
  finally{setChecking(false)}
 }
 function chooseFile(f:File|null){if(!f)return;if(preview)URL.revokeObjectURL(preview);setFile(f);setPreview(URL.createObjectURL(f));void inspect(f)}
 async function reveal(quoteId:string){
  setPaidQuote(quoteId);setBusy(true);setError("");
  try{
   let found:SearchItem[]=[];
   for(const p of preds){found=await searchFood(p.label);if(found.length)break}
   setHits(found);
   if(!found.length)setError(zh?"已经完成图片识别，但营养库里没有自动匹配到对应条目。请选择下方识别候选，或切换到名称入口手动输入。":"The image was recognized, but no nutrition record matched automatically.")
  }finally{setBusy(false)}
 }
 async function calculate(food:SearchItem){
  if(!paidQuote)return;setBusy(true);setError("");
  try{const r=await fetch("/api/tools/food/calculate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({quoteId:paidQuote,items:[{food_id:food.food_id,grams:Math.max(1,grams)}]})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error();setResult(d)}
  catch{setError(zh?"营养结果没有生成成功，请重试。":"Nutrition result did not finish.")}finally{setBusy(false)}
 }
 return <>
  <section className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5">
   <h2 className="text-lg font-semibold">{zh?"上传一张食物照片":"Upload a food photo"}</h2>
   <p className="mt-2 text-sm leading-6 text-[var(--lx-muted)]">{zh?"图片在你的设备上使用灵犀场自托管视觉模型识别，不需要外部识图 API。为了避免识别失败后仍收费，会先确认图片可识别，再进入支付。":"The photo is recognized on your device with LINGXIFIELD's self-hosted vision runtime. We check recognizability before payment."}</p>
   <input type="file" accept="image/*" onChange={e=>chooseFile(e.target.files?.[0]||null)} className="mt-4 block w-full text-sm"/>
   {preview&&<img src={preview} alt="" className="mt-4 max-h-72 rounded-xl object-contain"/>}
   <label className="mt-4 block text-sm">{zh?"估计份量（克，可修改）":"Estimated portion (g)"}<input type="number" min={1} max={10000} value={grams} onChange={e=>setGrams(Number(e.target.value)||1)} className="mt-2 block w-full rounded-xl border border-[var(--lx-line)] bg-[var(--lx-bg)] px-4 py-3"/></label>
   {checking&&<p className="mt-4 text-sm text-[var(--lx-muted)]">{zh?"正在确认图片是否可以识别…":"Checking image recognizability…"}</p>}
   {ready&&!paidQuote&&<div className="mt-5"><p className="mb-3 text-sm text-[var(--lx-muted)]">{zh?"图片可以识别。支付后显示识别结果并生成完整营养分析。":"Image is recognizable. Pay to reveal the result and generate full nutrition analysis."}</p><PaidActionButton toolId="food-calorie" quantity={2} metadata={{mode:"image-recognition",images:1}} onPaid={reveal} label={zh?"支付后识别并生成结果":"Pay, recognize & generate result"}/></div>}
  </section>
  {paidQuote&&preds.length>0&&<section className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5"><h3 className="font-semibold">{zh?"图片识别候选":"Recognition candidates"}</h3><div className="mt-3 flex flex-wrap gap-2">{preds.map(p=><span key={p.label} className="rounded-full bg-[var(--lx-soft)] px-3 py-1.5 text-sm">{p.label} · {Math.round(p.score*100)}%</span>)}</div>{busy&&<p className="mt-4 text-sm">{zh?"正在匹配营养数据库…":"Matching nutrition database…"}</p>}{hits.length>0&&<div className="mt-4 space-y-2">{hits.slice(0,5).map(x=><button key={x.food_id} onClick={()=>void calculate(x)} className="flex w-full justify-between rounded-xl border border-[var(--lx-line)] px-4 py-3 text-left"><span>{zh?x.name_zh:(x.name_en||x.name_zh)}</span><span>{zh?"生成营养结果":"Generate"} ›</span></button>)}</div>}</section>}
  {result&&<Result result={result} zh={zh}/>}
  {error&&<p className="rounded-xl border border-[var(--lx-line)] p-4 text-sm">{error}</p>}
 </>;
}
