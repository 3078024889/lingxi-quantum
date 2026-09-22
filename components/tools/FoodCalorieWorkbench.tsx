"use client";
import { useEffect,useState } from "react";
import PaidActionButton from "@/components/tools/PaidActionButton";

type FoodResult={
 items?:Array<{name?:string;estimatedPortion?:string;estimatedWeightG?:number;caloriesMin?:number;caloriesMax?:number;proteinG?:number;carbsG?:number;fatG?:number;per100g?:{calories?:number;proteinG?:number;carbsG?:number;fatG?:number}}>;
 totals?:{caloriesMin?:number;caloriesMax?:number;proteinG?:number;carbsG?:number;fatG?:number};
 uncertainty?:string[];note?:string;raw?:string;
};
export default function FoodCalorieWorkbench(){
 const [file,setFile]=useState<File|null>(null),[preview,setPreview]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<FoodResult|null>(null);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);

 async function analyze(quoteId:string){
  if(!file)return;setBusy(true);setError("");setResult(null);
  try{
   const form=new FormData();form.set("file",file);form.set("quote_id",quoteId);form.set("item_key","meal-0");
   const res=await fetch("/api/ai/food-analyze",{method:"POST",body:form});const data=await res.json();
   if(!res.ok)throw new Error(data.error==="OPENAI_NOT_CONFIGURED"?"AI 尚未配置 OPENAI_API_KEY。":(data.error||"分析失败"));
   setResult(data);
  }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
 }
 return <div>
  <label className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-blue-300">
   <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={e=>{const n=e.target.files?.[0]||null;setFile(n);setResult(null);setError("");if(preview)URL.revokeObjectURL(preview);setPreview(n?URL.createObjectURL(n):"")}}/>
   <div className="text-base font-medium text-slate-800">上传这一餐的照片</div><div className="mt-1 text-sm text-slate-500">尽量让食物完整入镜；结果是日常饮食记录估算，不是医疗营养诊断。</div>
  </label>
  {preview&&<img src={preview} alt="餐食预览" className="mx-auto mt-5 max-h-[420px] rounded-2xl object-contain"/>}
  <div className="mt-5">{busy?<button disabled className="rounded-full bg-blue-600 px-5 py-2.5 text-sm text-white opacity-50">正在分析…</button>:<PaidActionButton toolId="food-calorie" quantity={1} onPaid={analyze} label="查看本次价格"/>}</div>
  <p className="mt-3 text-xs leading-5 text-slate-500">只有付款确认后才会把这张照片发送给 AI 服务分析。</p>
  {error&&<p className="mt-4 text-sm text-rose-600">{error}</p>}
  {result&&<div className="mt-6 space-y-4">
   {result.totals&&<div className="rounded-2xl bg-blue-50 p-5"><div className="text-sm text-blue-700">这餐大约</div><div className="mt-1 text-3xl font-semibold text-blue-900">{result.totals.caloriesMin??"?"}–{result.totals.caloriesMax??"?"} kcal</div><div className="mt-3 flex flex-wrap gap-4 text-sm text-blue-900/80"><span>蛋白质 {result.totals.proteinG??"?"}g</span><span>碳水 {result.totals.carbsG??"?"}g</span><span>脂肪 {result.totals.fatG??"?"}g</span></div></div>}
   {result.items?.length?<div className="space-y-2">{result.items.map((x,i)=><div key={i} className="rounded-xl border border-slate-200 p-3 text-sm"><strong>{x.name||`食物 ${i+1}`}</strong><span className="ml-2 text-slate-500">{x.estimatedPortion||""}{x.estimatedWeightG?` · 约 ${x.estimatedWeightG}g`:""}</span><div className="mt-1 text-slate-600">{x.caloriesMin??"?"}–{x.caloriesMax??"?"} kcal · 蛋白质 {x.proteinG??"?"}g · 碳水 {x.carbsG??"?"}g · 脂肪 {x.fatG??"?"}g</div></div>)}</div>:null}
   {result.uncertainty?.length?<div className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">不确定项：{result.uncertainty.join("；")}</div>:null}
   <p className="text-sm leading-6 text-slate-500">AI视觉估算，仅用于日常饮食记录参考。实际热量会因重量、配方与烹饪方式不同而变化。</p>
  </div>}
 </div>;
}
