"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {SASI_SOFTWARE_CATALOG} from "@/lib/sasi-software/catalog";
type Order={id:string;productId:string;status:string;createdAt:string;delivered:boolean;downloads:number;maxDownloads:number};
export default function SasiSoftwareOrders(){
 const [items,setItems]=useState<Order[]>([]),[error,setError]=useState(""),[busy,setBusy]=useState("");
 useEffect(()=>{fetch("/api/sasi/software/my-orders",{cache:"no-store"}).then(async r=>{
  if(!r.ok)throw Error(r.status===401?"请先登录后查看软件订单。":"软件订单读取暂不可用。");
  return r.json();
 }).then(x=>setItems(Array.isArray(x.items)?x.items:[])).catch(e=>setError(e.message||"暂时无法读取订单"));},[]);
 const download=async(order:Order)=>{
  if(busy)return;setBusy(order.id);setError("");
  try{
   const r=await fetch(`/api/sasi/software/download?orderId=${encodeURIComponent(order.id)}`,{cache:"no-store"});
   const x=await r.json();
   if(!r.ok||!x.downloadUrl)throw Error("当前订单尚未具备可下载的有效授权，请在订单记录中确认付款或联系客服。");
   window.location.assign(x.downloadUrl);
  }catch(e){setError(e instanceof Error?e.message:"下载暂不可用")}finally{setBusy("")}
 };
 return <div style={{display:"grid",gap:14,marginTop:18}}>
 {error&&<p role="alert" style={{color:"#ae3535"}}>{error} <Link href="/account?mode=signin">登录 / 账户 →</Link></p>}
 {items.length===0&&!error&&<p>暂无 SASI 智能软件订单。<Link style={{textDecoration:"underline"}} href="/sasi">查看商品 →</Link></p>}
 {items.map(o=>{const product=SASI_SOFTWARE_CATALOG.find(p=>p.id===o.productId);return <article key={o.id} style={{padding:22,border:"1px solid var(--lx-line)",borderRadius:14,background:"var(--lx-panel)"}}>
 <b>{product?.titleZh||"SASI 智能软件"}</b>
 <p style={{color:"var(--lx-muted)",fontSize:13,margin:"10px 0"}}>订单：{o.id} · 状态：{o.status} · {new Date(o.createdAt).toLocaleString("zh-CN")}</p>
 {o.delivered?<button onClick={()=>download(o)} disabled={busy===o.id} style={{padding:"9px 16px",borderRadius:9,background:"#194f87",color:"#fff"}}>{busy===o.id?"核验授权中…":`安全下载（余 ${Math.max(0,o.maxDownloads-o.downloads)} 次）`}</button>:<span style={{color:"var(--lx-muted)",fontSize:13}}>尚未确认完成软件交付</span>}
 </article>})}
 </div>;
}
