'use client';
import {useState} from 'react';
import {priceBoards,OFFER_GUIDE} from '../lib/offer-guide';
const names:Record<string,string>={runway:'Runway',suno:'Suno',elevenlabs:'ElevenLabs',lovable:'Lovable',chatgpt:'ChatGPT',claude:'Claude',perplexity:'Perplexity',replit:'Replit'};
export default function PriceLeaderboards({compact=false}:{compact?:boolean}){
 const [bill,setBill]=useState<'monthly'|'annual_equivalent'>('monthly');
 const board=priceBoards().find(x=>x.billing===bill)!;
 return <section className="panel consumerBoard" aria-label="公开入门价格榜">
  <div className="rankHead"><h2>AI 工具入门价格榜</h2><span>按公开起步套餐价格从低到高</span></div>
  <div className="consumerBoardTabs">
   <button className={bill==='monthly'?'active':''} onClick={()=>setBill('monthly')}>按月付费</button>
   <button className={bill==='annual_equivalent'?'active':''} onClick={()=>setBill('annual_equivalent')}>年付折合</button>
  </div>
  <div className="consumerBoardRows">{board.items.map((r,i)=>{
   const offer=OFFER_GUIDE[r.id];
   return <div className="consumerBoardRow" key={r.id}>
    <span className="boardRank">{i+1}</span>
    <div><a className="boardName" href={'/platform/'+r.id}>{names[r.id]||r.id}</a>
     <small>{r.tasks.slice(0,2).join(' · ')}</small></div>
    <div className="boardPrice"><strong>${r.monthlyUsd}/月</strong><small>{bill==='monthly'?'按月订阅':'年付折算，不代表可以逐月买'}</small></div>
    <a href={r.source} target="_blank" rel="noopener noreferrer" className="boardSource">官网价格 ↗</a>
   </div>;
  })}</div>
  <p className="consumerBoardFoot">这是不同 AI 工具的公开入门套餐价格比较，不是热度或用户满意度排名。积分、使用上限和商用权限不同，点击工具查看详情。资料更新：2026-10-30。</p>
 </section>;
}
