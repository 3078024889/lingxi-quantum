'use client';
import {useEffect,useState} from 'react';
type Candidate={id:string;name:string;url:string;description?:string|null;category?:string|null;capabilities?:string[];evidence?:{kind:string;url:string;observedAt:string|null}};
type Response={matches:Candidate[];updatedAt?:string;status?:string};
export default function PlatformEvidence({website}:{website:string}){
 const [data,setData]=useState<Response|null>(null);
 useEffect(()=>{const controller=new AbortController();fetch('/api/v1/products/evidence?'+new URLSearchParams({website}),{signal:controller.signal,cache:'no-store'})
 .then(r=>r.ok?r.json():null).then(v=>{if(!controller.signal.aborted)setData(v)}).catch(()=>{});
 return()=>controller.abort()},[website]);
 if(!data?.matches?.length)return null;
 return <section className="panel" aria-label="公开产品资料" style={{marginTop:12}}>
 <h2>公开产品资料与来源</h2>
 <p className="subtle">以下为同一网站域名的公开候选记录，不代表厂商身份或收费已核验。</p>
 {data.matches.map(x=><div key={x.id} style={{padding:'8px 0',borderBottom:'1px solid #e2e8f0'}}>
 <strong>{x.name}</strong>{x.description&&<p>{x.description}</p>}
 {!!x.capabilities?.length&&<small>功能标签：{x.capabilities.slice(0,5).join(' · ')}</small>}
 <div><a href={x.evidence?.url||x.url} target="_blank" rel="noopener noreferrer">查看资料来源 ↗</a></div>
 </div>)}
 <small>目录更新时间：{data.updatedAt?.slice(0,10)||'未知'} · 价格、免费额度及地区使用条件仍须单独核验。</small>
 </section>
}
