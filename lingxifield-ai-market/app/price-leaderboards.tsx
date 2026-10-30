'use client';
import {useState} from 'react';
import {priceBoards,OFFER_GUIDE} from '../lib/offer-guide';
const names:Record<string,string>={runway:'Runway',suno:'Suno',elevenlabs:'ElevenLabs',lovable:'Lovable',chatgpt:'ChatGPT',claude:'Claude',perplexity:'Perplexity',replit:'Replit'};
export default function PriceLeaderboards({compact=false}:{compact?:boolean}){
 const [bill,setBill]=useState<'monthly'|'annual_equivalent'>('monthly');
 const [task,setTask]=useState<'all'|'video'|'images'|'music'|'voice'|'web'|'research'>('all');
 const choices=[{value:'all',label:'全部工具',pattern:/.*/},{value:'video',label:'视频制作',pattern:/视频|短剧/},{value:'images',label:'图片创作',pattern:/图像|图片/},{value:'music',label:'AI 音乐',pattern:/音乐|歌曲|配乐/},{value:'voice',label:'语音配音',pattern:/语音|配音|旁白/},{value:'web',label:'网站编程',pattern:/编程|建网站|网站|应用/},{value:'research',label:'研究搜索',pattern:/研究|搜索/}] as const;
 const selected=choices.find(x=>x.value===task)!;
 const board=priceBoards().find(x=>x.billing===bill)!;
 return <section className="panel consumerBoard" aria-label="公开入门价格榜">
  <div className="rankHead"><h2>AI 工具入门价格榜</h2><span>按公开起步套餐价格从低到高</span></div>
  <div className="consumerBoardTabs">
   <button className={bill==='monthly'?'active':''} onClick={()=>setBill('monthly')}>按月付费</button>
   <button className={bill==='annual_equivalent'?'active':''} onClick={()=>setBill('annual_equivalent')}>年付折合</button>
  </div>
  <div className="consumerBoardTabs categoryTabs">{choices.map(x=><button key={x.value} className={task===x.value?'active':''} onClick={()=>setTask(x.value)}>{x.label}</button>)}</div>
  <div className="consumerBoardRows">{board.items.filter(x=>selected.pattern.test(x.tasks.join(' '))).map((r,i)=>{
   const offer=OFFER_GUIDE[r.id];
   return <div className="consumerBoardRow" key={r.id}>
    <span className="boardRank">{i+1}</span>
    <div><a className="boardName" href={'/platform/'+r.id}>{names[r.id]||r.id}</a>
     <small>{r.tasks.slice(0,2).join(' · ')}</small></div>
    <div className="boardPrice"><strong>${r.monthlyUsd}/月</strong><small>{bill==='monthly'?'按月订阅':'年付折算，不代表可以逐月买'}</small></div>
    <a href={r.source} target="_blank" rel="noopener noreferrer" className="boardSource">官网价格 ↗</a>
   </div>;
  })}</div>
  {!board.items.some(x=>selected.pattern.test(x.tasks.join(' ')))&&<p className="consumerBoardFoot">本类工具暂无足够可比较的公开套餐价格，请查看工具详情中的官方价格页。</p>}
  <p className="consumerBoardFoot">这是不同 AI 工具的公开入门套餐价格比较，不是热度或用户满意度排名。积分、使用上限和商用权限不同，点击工具查看详情。资料更新：2026-10-30。</p>
 </section>;
}
