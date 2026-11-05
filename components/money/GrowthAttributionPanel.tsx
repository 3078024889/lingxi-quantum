"use client";
import {useEffect,useState} from "react";
import type {GrowthSnapshot} from "@/lib/analytics/growth-attribution";

type ResponseData=GrowthSnapshot&{windowDays:number;generatedAt:string};
const card={border:"1px solid #dbe3ef",borderRadius:12,padding:"14px 18px",background:"#fff"} as const;

export default function GrowthAttributionPanel({days}:{days:number}){
 const [data,setData]=useState<ResponseData|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>{
  let active=true;const controller=new AbortController();
  setLoading(true);setError("");
  fetch("/api/account/growth-stats?days="+days,{cache:"no-store",signal:controller.signal})
   .then(async r=>{if(!r.ok)throw Error("Request failed");return await r.json() as ResponseData;})
   .then(d=>{if(active)setData(d);})
   .catch(()=>{if(active){setData(null);setError("无法读取渠道归因数据，请刷新后重试。");}})
   .finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;controller.abort();};
 },[days]);
 return <section aria-label="推广渠道归因" style={{marginTop:28}}>
  <h2 style={{fontSize:23,fontWeight:750,marginBottom:6}}>推广来源与自动化访问排查</h2>
  <p style={{fontSize:14,lineHeight:1.8,color:"#65728a",margin:"0 0 15px"}}>
   显示最近 {days} 天的渠道来源。这里的“会话”不等于真实人数，“疑似集中访问”也不能直接认定为机器人。
  </p>
  {loading&&<p role="status">正在读取推广数据…</p>}
  {error&&<p role="alert">{error}</p>}
  {!loading&&data&&<>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
    {[
     ["数据库浏览记录",data.totalRecorded],
     ["本次分析记录",data.analyzed],
     ["带推广标签的浏览",data.attributedViews],
     ["带推广标签的会话",data.attributedSessions],
     ["需要复核的集中访问",data.flaggedViews],
    ].map(([label,value])=><div key={label} style={card}>
     <div style={{fontSize:14,color:"#67758d"}}>{label}</div>
     <strong style={{fontSize:28,fontVariantNumeric:"tabular-nums",display:"block",marginTop:5}}>{Number(value).toLocaleString("zh-CN")}</strong>
    </div>)}
   </div>
   {data.truncated&&<p role="status" style={{fontSize:14,color:"#9b421d",marginTop:12}}>
    当前时段记录较多：下面的渠道归因与异常检测仅基于最新 {data.analyzed.toLocaleString("zh-CN")} 条样本，不能代表所有浏览来源。
   </p>}
   <p style={{fontSize:14,lineHeight:1.8,color:"#64748b",margin:"15px 0 10px"}}>
    集中访问识别规则：同一分钟内至少 25 次浏览、15 个会话标识、12 个不同页面，标记为人工复核线索而非确定的假流量。共识别到 {data.flaggedMinutes} 个时段。
   </p>
   <div style={{overflowX:"auto",border:"1px solid #dbe3ef",borderRadius:12,background:"#fff"}}>
    <table style={{borderCollapse:"collapse",width:"100%",fontSize:14,whiteSpace:"nowrap",textAlign:"left"}}>
     <thead><tr style={{background:"#f1f5ff"}}>
      {["来源","推广活动","合作标识（自报）","浏览次数","会话","疑似集中访问"].map(x=><th key={x} style={{padding:"12px 14px",fontWeight:700}}>{x}</th>)}
     </tr></thead>
     <tbody>
      {data.channels.map((v,i)=><tr key={v.source+"|"+v.campaign+"|"+v.partner+"|"+i} style={{borderTop:"1px solid #e6ecf5"}}>
       <td style={{padding:"10px 14px"}}>{v.source}</td>
       <td style={{padding:"10px 14px"}}>{v.campaign}</td>
       <td style={{padding:"10px 14px"}}>{v.partner}</td>
       <td style={{padding:"10px 14px"}}>{v.views}</td>
       <td style={{padding:"10px 14px"}}>{v.sessions}</td>
       <td style={{padding:"10px 14px"}}>{v.flaggedViews}</td>
      </tr>)}
     </tbody>
    </table>
    {!data.channels.length&&<p style={{padding:16,fontSize:14}}>暂无渠道记录。</p>}
   </div>
   <p style={{fontSize:14,color:"#64748b",marginTop:13,lineHeight:1.7}}>
    数据不包含客户身份和私人文件内容。合作标识可由安装方自行填写，尚未经过站点所有权认证；
    工具处理完成、真实注册、付费转化和留存尚无完整事件链，不能据此计算获客收入或真人转化率。
   </p>
  </>}
 </section>;
}
