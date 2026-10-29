'use client';
import {useEffect,useState} from 'react';
type Item={count:number|null;collectedAt:string|null;status:'present'|'missing';label:string};
export default function MarketCoverageStrip(){
 const [items,setItems]=useState<Record<string,Item>>({});
 useEffect(()=>{const abort=new AbortController();fetch('/api/market/coverage',{signal:abort.signal,cache:'no-store'}).then(r=>r.ok?r.json():null).then(x=>{if(x?.items&&!abort.signal.aborted)setItems(x.items)}).catch(()=>{});return()=>abort.abort()},[]);
 return <section aria-label="公开数据覆盖范围" style={{display:'flex',flexWrap:'wrap',gap:10,alignItems:'center',margin:'0 0 14px',fontSize:12,color:'#475569'}}>
 <strong>已取得的公开资料</strong>
 {(['products','models','offers','hfModels','hfSpaces'] as const).map(k=>{
 const v=items[k];return <span key={k} style={{padding:'6px 10px',border:'1px solid #e2e8f0',borderRadius:9,background:'#fff'}}>
 {v?.label||({products:'产品候选',models:'模型标识',offers:'模型服务记录',hfModels:'Hub 模型',hfSpaces:'公开应用'} as Record<string,string>)[k]}：<b>{v?.count==null?'暂无数据':v.count.toLocaleString('zh-CN')}</b></span>
 })}
 <small style={{color:'#64748b'}}>目录数量不是访问量或 SEO/GEO 排名；候选资料仍需核验。</small>
 </section>;
}
