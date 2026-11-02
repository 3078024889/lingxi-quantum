'use client';
import type {Platform} from '../lib/data';
import type {Language} from '../lib/v2';
import {capabilityProfile} from '../lib/capability-profiles';
import {ArrowUpRight,BookOpen,CheckCircle2,Compass} from 'lucide-react';

export default function CapabilityShowcase({platform,language='zh'}:{platform:Platform;language?:Language}){
 const profile=capabilityProfile(platform.id);
 if(!profile){
  return <section className="panel capabilityShowcase" aria-label="产品功能档案">
   <div className="capabilityHeading"><div><span className="capabilityKicker"><BookOpen size={15}/> {language==='zh'?'待补充具体能力':'Capabilities pending'}</span>
    <h2>{platform.name} · {language==='zh'?'功能证据正在补全':'Product evidence pending'}</h2>
    <p>{language==='zh'?'目前只有基础产品目录和分类资料，尚无逐项核验的详细功能，不能替厂商编造能力。':'Detailed features await source verification.'}</p></div>
    <a href={'/vendor/claim?'+new URLSearchParams({product:platform.id,name:platform.name})}>{language==='zh'?'厂商免费补充官方资料':'Submit official facts'} <ArrowUpRight size={14}/></a>
   </div>
  </section>;
 }
 const isZh=language==='zh';
 return <section className="panel capabilityShowcase" aria-label="有来源的完整功能与优势">
  <div className="capabilityHeading">
   <div><span className="capabilityKicker"><Compass size={15}/>{isZh?'核心功能与优势':'Capabilities and strengths'}</span>
    <h2>{isZh?profile.headline:platform.name+' · Key capabilities'}</h2>
    <p>{isZh?profile.differentiator:platform.about}</p></div>
   <div className="capabilityCoverage"><strong>{profile.capabilities.length}</strong><span>{isZh?'项具体功能':'documented features'}</span><small>{profile.checkedAt}</small></div>
  </div>
  <div className="capabilityAudience"><CheckCircle2 size={16}/><strong>{isZh?'适合谁：':'Audience: '}</strong><span>{isZh?profile.audience:platform.category}</span></div>
  <div className="capabilityGrid">{profile.capabilities.map((item,index)=>
    <article className="capabilityItem" key={item.name}>
     <div className="capabilityItemTop"><span className="capabilityCount">{String(index+1).padStart(2,'0')}</span><h3>{item.name}</h3></div>
     <p className="capabilityOutcome">{item.outcome}</p>
     
     
     <a href={item.source} target="_blank" rel="noopener noreferrer" className="capabilitySource">{isZh?'功能来源':'Official source'} <ArrowUpRight size={13}/></a>
    </article>)}</div>
  <div className="capabilityBottom">
   <div><h3>{isZh?'新手三步使用':'Getting started'}</h3><ol>{profile.firstSteps.map((step,i)=><li key={i}><span>{i+1}</span>{step}</li>)}</ol></div>
   <a href={'/vendor/claim?'+new URLSearchParams({product:platform.id,name:platform.name})}>{isZh?'厂商认领并提交新功能 / 真实作品':'Claim and submit product updates'} <ArrowUpRight size={14}/></a>
  </div>
 </section>;
}
