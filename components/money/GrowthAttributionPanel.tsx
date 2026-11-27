"use client";
import {useEffect,useState} from "react";
import type {GrowthSnapshot,GrowthToolFunnel} from "@/lib/analytics/growth-attribution";

type ResponseData=GrowthSnapshot&GrowthToolFunnel&{windowDays:number;generatedAt:string};
const card={border:"1px solid var(--lx-line)",borderRadius:13,padding:"14px 16px",background:"transparent",color:"var(--lx-ink)"} as const;
const tableWrap={overflowX:"auto",border:"1px solid var(--lx-line)",borderRadius:13,background:"transparent"} as const;
const th={padding:"11px 12px",fontWeight:750,background:"color-mix(in srgb,var(--lx-ink) 5%,transparent)",color:"var(--lx-ink)"} as const;
const td={padding:"10px 12px",borderTop:"1px solid var(--lx-line)",color:"var(--lx-ink)"} as const;
const pct=(value:number)=>Number.isFinite(value)?value.toFixed(1)+"%":"—";

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
 return <section aria-label="推广渠道与工具完成漏斗" style={{marginTop:28,color:"var(--lx-ink)"}}>
  <h2 style={{fontSize:23,fontWeight:780,marginBottom:6}}>推广来源与真实工具完成漏斗</h2>
  <p style={{fontSize:13,lineHeight:1.8,color:"var(--lx-muted)",margin:"0 0 15px"}}>
   最近 {days} 天的渠道访问与工具处理事件。会话不是人数；处理完成不是付款或收入。
  </p>
  {loading&&<p role="status">正在读取推广数据…</p>}
  {error&&<p role="alert">{error}</p>}
  {!loading&&data&&<>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:10}}>
    {[
     ["浏览记录",data.totalRecorded],
     ["来源会话",data.sampledSessions],
     ["带推广标签的会话",data.attributedSessions],
     ["工具打开事件",data.toolOpens],
     ["处理开始",data.toolStarts],
     ["处理完成",data.toolCompletions],
     ["完成会话",data.completedSessions],
    ].map(([label,value])=><div key={label} style={card}>
     <div style={{fontSize:12,color:"var(--lx-muted)"}}>{label}</div>
     <strong style={{fontSize:25,fontVariantNumeric:"tabular-nums",display:"block",marginTop:5}}>{Number(value).toLocaleString("zh-CN")}</strong>
    </div>)}
   </div>
   {(data.truncated||data.toolEventsTruncated)&&<p role="status" style={{fontSize:13,color:"var(--lx-warning,#b56b26)",marginTop:12}}>
    当前记录量超过单次分析上限：浏览样本 {data.analyzed.toLocaleString("zh-CN")} 条，工具事件样本 {data.toolEventsAnalyzed.toLocaleString("zh-CN")} 条。渠道结果仅代表已分析样本。
   </p>}
   <p style={{fontSize:13,lineHeight:1.8,color:"var(--lx-muted)",margin:"14px 0 10px"}}>
    集中访问只作为人工复核线索：同一分钟至少 25 次浏览、15 个会话标识、12 个不同页面；共 {data.flaggedMinutes} 个时段、{data.flaggedViews} 次浏览，不自动判定为机器人。
   </p>
   <h3 style={{fontSize:16,fontWeight:780,margin:"18px 0 9px"}}>渠道访问分布</h3>
   <div style={tableWrap}>
    <table style={{borderCollapse:"collapse",width:"100%",fontSize:12,whiteSpace:"nowrap",textAlign:"left"}}>
     <thead><tr>{["来源","推广活动","合作标识（自报）","浏览","会话","复核线索"].map(x=><th key={x} style={th}>{x}</th>)}</tr></thead>
     <tbody>
      {data.channels.map((v,i)=><tr key={v.source+"|"+v.campaign+"|"+v.partner+"|"+i}>
       <td style={td}>{v.source}</td><td style={td}>{v.campaign}</td><td style={td}>{v.partner}</td>
       <td style={td}>{v.views}</td><td style={td}>{v.sessions}</td><td style={td}>{v.flaggedViews}</td>
      </tr>)}
     </tbody>
    </table>
    {!data.channels.length&&<p style={{padding:14,fontSize:13,color:"var(--lx-muted)"}}>暂无渠道记录。</p>}
   </div>
   <h3 style={{fontSize:16,fontWeight:780,margin:"20px 0 9px"}}>渠道到工具完成漏斗</h3>
   <div style={tableWrap}>
    <table style={{borderCollapse:"collapse",width:"100%",fontSize:12,whiteSpace:"nowrap",textAlign:"left"}}>
     <thead><tr>{["来源","活动","合作标识","来源会话","打开会话","开始会话","完成会话","完成会话率","任务成功率"].map(x=><th key={x} style={th}>{x}</th>)}</tr></thead>
     <tbody>
      {data.toolFunnelChannels.map((v,i)=><tr key={v.source+"|"+v.campaign+"|"+v.partner+"|"+i}>
       <td style={td}>{v.source}</td><td style={td}>{v.campaign}</td><td style={td}>{v.partner}</td>
       <td style={td}>{v.sessions}</td><td style={td}>{v.openedSessions}</td><td style={td}>{v.startedSessions}</td>
       <td style={td}>{v.completedSessions}</td><td style={td}>{pct(v.completionRate)}</td><td style={td}>{pct(v.taskSuccessRate)}</td>
      </tr>)}
     </tbody>
    </table>
    {!data.toolFunnelChannels.length&&<p style={{padding:14,fontSize:13,color:"var(--lx-muted)"}}>暂无工具完成事件；上线后会逐步形成渠道到工具结果的真实数据。</p>}
   </div>
   <p style={{fontSize:12,color:"var(--lx-muted)",marginTop:13,lineHeight:1.8}}>
    会话标识按北京时间日期与站点域名进行 SHA-256 哈希，不是用户身份；不记录 IP、账号或私人文件内容。
    完成会话率 = 有处理完成事件的会话 / 来源会话；任务成功率 = 完成事件 / 开始事件。
    只覆盖已接入埋点的工具，不代表注册率、ToolPass 付费率、SASI 订单收入或真实获客成本。合作标识由安装方填写，未自动证明其站点所有权。
   </p>
  </>}
 </section>;
}
