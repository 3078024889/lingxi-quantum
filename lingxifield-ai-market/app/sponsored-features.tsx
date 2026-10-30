'use client';
import {useEffect,useState} from 'react';
type Item={projectId:string;label:string;targetUrl:string;sponsored:true};
export default function SponsoredFeatures(){
 const [items,setItems]=useState<Item[]>([]);
 useEffect(()=>{const controller=new AbortController();fetch('/api/v1/sponsored',{signal:controller.signal})
 .then(r=>r.ok?r.json():null).then(d=>{if(!controller.signal.aborted&&d?.affectsOrganicRank===false&&Array.isArray(d.items))setItems(d.items)})
 .catch(()=>{});return()=>controller.abort();},[]);
 if(!items.length)return null;
 return <section className="panel sponsoredArea" aria-label="合作推广"><h2>精选品牌展示 <small>推广内容 · Sponsored</small></h2>
  <div className="sponsoredCards">{items.map(x=><a key={x.projectId} href={x.targetUrl} rel="noopener noreferrer sponsored nofollow" target="_blank">
   <span className="sponsoredTag">推广</span><strong>{x.label}</strong><span>访问官网 ↗</span></a>)}</div>
  <p>合作展示不改变真实访问量、用户评价、价格或自然榜单顺序。</p></section>;
}
