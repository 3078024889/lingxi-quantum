"use client";
import {useMemo,useState} from "react";
import {diagnoseAiSpend} from "@/lib/siai/free-spend-diagnostic";
import type {SpendItem} from "@/lib/siai/free-spend-diagnostic";
const field:React.CSSProperties={border:"1px solid #cbd5e1",borderRadius:10,padding:"10px 12px",minWidth:0,width:"100%",fontSize:16,background:"#fff",color:"#14213d"};
const initial:SpendItem={name:"",monthlyPrice:0,usedPerMonth:0,expectedPerMonth:0,essential:false};
export default function SpendDiagnostic(){
 const [currency,setCurrency]=useState<"CNY"|"USD">("CNY");
 const [items,setItems]=useState<SpendItem[]>([{...initial}]);
 const [submitted,setSubmitted]=useState(false);
 const update=(i:number,patch:Partial<SpendItem>)=>{setItems(v=>v.map((x,j)=>j===i?{...x,...patch}:x));setSubmitted(false);};
 const calculation=useMemo(()=>{try{return {result:diagnoseAiSpend({currency,items}),error:""};}catch(e){return {result:null,error:e instanceof Error?e.message:"输入有误"};}},[currency,items]);
 const money=(n:number)=>new Intl.NumberFormat(currency==="CNY"?"zh-CN":"en-US",{style:"currency",currency}).format(n);
 const inputNum=(n:number)=>Number.isFinite(n)?n:0;
 const share=()=>{if(!calculation.result)return;const summary={currency,monthlySpend:calculation.result.monthlySpend,potentialMonthlySavings:calculation.result.potentialMonthlySavings};navigator.clipboard?.writeText("灵犀场 SI/AI 花费诊断（匿名摘要）\n"+JSON.stringify(summary)+"\nhttps://lingxifield.com/siai/spend-diagnostic");};
 return <main style={{maxWidth:960,margin:"0 auto",padding:"32px 16px 72px",color:"#172235"}}>
  <h1 style={{fontSize:34,fontWeight:750,marginBottom:12}}>免费的 SI/AI 花费诊断</h1>
  <p style={{fontSize:16,lineHeight:1.8}}>不连接银行、不上传账单、不要求注册。填写正在订阅的工具与真实使用量，查看可能省下多少费用。计算仅在浏览器完成。</p>
  <div style={{background:"#f0f7f5",borderRadius:16,padding:20,margin:"20px 0"}}>
   <label style={{fontWeight:650}}>计价币种（不同币种分开计算）</label>
   <select value={currency} onChange={e=>{setCurrency(e.target.value as "CNY"|"USD");setSubmitted(false);}} style={{...field,marginTop:8,maxWidth:220}}><option value="CNY">人民币 CNY</option><option value="USD">美元 USD</option></select>
  </div>
  {items.map((item,i)=><section key={i} style={{border:"1px solid #dde6e8",borderRadius:16,padding:18,margin:"14px 0",background:"#fff"}}>
   <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:12}}><h2 style={{fontSize:19,fontWeight:700}}>订阅 {i+1}</h2>{items.length>1&&<button type="button" onClick={()=>{setItems(v=>v.filter((_,j)=>j!==i));setSubmitted(false);}} style={{color:"#a22",padding:8}}>删除</button>}</div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(185px,1fr))",gap:12}}>
    <label>工具名称<input aria-label={"工具名称"+(i+1)} placeholder="例如：某视频AI" style={field} maxLength={100} value={item.name} onChange={e=>update(i,{name:e.target.value})}/></label>
    <label>每月实际费用<input aria-label={"月费"+(i+1)} type="number" min="0" step="0.01" style={field} value={item.monthlyPrice} onChange={e=>update(i,{monthlyPrice:inputNum(e.target.valueAsNumber)})}/></label>
    <label>本月使用次数<input aria-label={"使用次数"+(i+1)} type="number" min="0" step="1" style={field} value={item.usedPerMonth} onChange={e=>update(i,{usedPerMonth:inputNum(e.target.valueAsNumber)})}/></label>
    <label>下月预计次数<input aria-label={"预计次数"+(i+1)} type="number" min="0" step="1" style={field} value={item.expectedPerMonth??item.usedPerMonth} onChange={e=>update(i,{expectedPerMonth:inputNum(e.target.valueAsNumber)})}/></label>
    <label>已知的替代套餐月费（可选）<input aria-label={"替代价格"+(i+1)} type="number" min="0" step="0.01" placeholder="不确定请留空" style={field} value={item.alternativeMonthlyPrice??""} onChange={e=>update(i,{alternativeMonthlyPrice:e.target.value===""?undefined:inputNum(e.target.valueAsNumber)})}/></label>
   </div>
   <label style={{display:"flex",gap:8,alignItems:"center",marginTop:14}}><input type="checkbox" checked={!!item.essential} onChange={e=>update(i,{essential:e.target.checked})}/> 工作必须保留，不能简单取消</label>
  </section>)}
  <div style={{display:"flex",gap:12,flexWrap:"wrap",margin:"20px 0"}}>
   <button type="button" disabled={items.length>=30} onClick={()=>{setItems(v=>[...v,{...initial}]);setSubmitted(false);}} style={{padding:"12px 18px",borderRadius:10,border:"1px solid #8baea1",fontWeight:650}}>增加订阅</button>
   <button type="button" onClick={()=>setSubmitted(true)} style={{padding:"12px 18px",borderRadius:10,background:"#136c57",color:"#fff",fontWeight:700}}>免费诊断</button>
  </div>
  {submitted&&(calculation.error?<p role="alert" style={{color:"#ae2525"}}>{calculation.error}</p>:calculation.result&&<section aria-live="polite" style={{padding:22,background:"#edf8f4",borderRadius:16}}>
   <h2 style={{fontSize:23,fontWeight:700,marginBottom:14}}>诊断结果</h2>
   <p>每月费用：<strong>{money(calculation.result.monthlySpend)}</strong></p>
   <p>潜在每月节省：<strong>{money(calculation.result.potentialMonthlySavings)}</strong></p>
   <p>潜在年度节省（简单乘12）：<strong>{money(calculation.result.annualizedPotentialSavings)}</strong></p>
   {calculation.result.findings.map((f,i)=><div key={i} style={{padding:"12px 0",borderTop:"1px solid #c9ddd5"}}><strong>{f.name}</strong><p>{f.reason}</p><p>本月每次使用成本：{f.costPerUse===null?"无法计算（0次使用）":money(f.costPerUse)}</p><p>潜在节省：{money(f.potentialMonthlySavings)}</p></div>)}
   <button type="button" onClick={share} style={{padding:"11px 15px",border:"1px solid #136c57",borderRadius:10}}>复制匿名结果（不含工具名称）</button>
   <p style={{fontSize:14,marginTop:12}}>这些只是情景计算，不代表任何已验证的套餐推荐。取消前请检查数据导出、续费、退款和商用限制。</p>
  </section>)}
  <p style={{fontSize:14,marginTop:22,color:"#536374"}}>隐私：当前版本只在本地浏览器计算，不上传所填订阅信息。不会自动连接AI账号，也不会替你取消订阅。</p>
 </main>;
}
