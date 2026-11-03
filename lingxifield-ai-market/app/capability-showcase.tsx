'use client';
import type {Platform} from '../lib/data';
import type {Language} from '../lib/v2';
import {capabilityProfile} from '../lib/capability-profiles';
import {productAnswerHeadline} from '../lib/market-result-headlines';
import {localizedProductSummary} from '../lib/market-product-locale';
import {localizedCatalogFact} from '../lib/market-fact-locale';
import {researchedFact} from '../lib/market-researched-facts';
import {MARKET_SCREEN_COPY} from '../lib/market-v36-screening';
import {SIAI_ANSWER_UI} from '../lib/market-answer-i18n';
import {ArrowUpRight,BookOpen,CheckCircle2,Compass} from 'lucide-react';

export default function CapabilityShowcase({platform,language='zh'}:{platform:Platform;language?:Language}){
 const profile=capabilityProfile(platform.id);
 if(!profile){
  return <section className="panel capabilityShowcase" aria-label="产品功能档案">
   <div className="capabilityHeading"><div><span className="capabilityKicker"><BookOpen size={15}/> {language==='zh'?'先看工具能做什么':'See what the tool does'}</span>
    <h2>{platform.name} · {language==='zh'?'功能与使用方式':'Features and getting started'}</h2>
    <p>{language==='zh'?'查看产品官方功能、价格和可用套餐，先判断能否完成你的任务。':'Check the publisher’s features, plans and limits before you choose.'}</p></div>
    <a href={'/vendor/claim?'+new URLSearchParams({product:platform.id,name:platform.name})}>{language==='zh'?'厂商免费补充官方资料':'Submit official facts'} <ArrowUpRight size={14}/></a>
   </div>
  </section>;
 }
 const isZh=language==='zh';
 const real=researchedFact(platform.id),ui=SIAI_ANSWER_UI[language];
 // Non-Chinese readers see localized, sourced product answers instead of the
 // raw Chinese editorial examples; specific claim links remain first-party.
 const cards=isZh?profile.capabilities:[
  {name:ui.simple,outcome:localizedProductSummary(platform.id,language)||platform.name,example:'',boundary:'',source:profile.capabilities[0].source},
  {name:MARKET_SCREEN_COPY[language].models,outcome:localizedCatalogFact(platform.id,language,'models',real?.models||''),example:'',boundary:'',source:real?.modelsSource||platform.website},
  {name:MARKET_SCREEN_COPY[language].filters.free,outcome:localizedCatalogFact(platform.id,language,'free',real?.free||''),example:'',boundary:'',source:real?.freeSource||platform.website}
 ];
 const firstSteps=isZh?profile.firstSteps:[ui.first.replace('{name}',platform.name),ui.second,ui.third];
 return <section className="panel capabilityShowcase" aria-label="有来源的完整功能与优势">
  <div className="capabilityHeading">
   <div><span className="capabilityKicker"><Compass size={15}/>{isZh?'核心功能与优势':'Capabilities and strengths'}</span>
    <h2>{isZh?(productAnswerHeadline(platform.id)||profile.headline):(localizedProductSummary(platform.id,language)||platform.name+' · Key capabilities')}</h2>
    <p>{isZh?profile.differentiator:(localizedProductSummary(platform.id,language)||platform.name)}</p></div>
   <div className="capabilityCoverage"><strong>{cards.length}</strong><span>{isZh?'项具体功能':'documented features'}</span><small>{profile.checkedAt}</small></div>
  </div>
  <div className="capabilityAudience"><CheckCircle2 size={16}/><strong>{isZh?'适合谁：':'Audience: '}</strong><span>{isZh?profile.audience:platform.category}</span></div>
  <div className="capabilityGrid">{cards.map((item,index)=>
    <article className="capabilityItem" key={item.name}>
     <div className="capabilityItemTop"><span className="capabilityCount">{String(index+1).padStart(2,'0')}</span><h3>{item.name}</h3></div>
     <p className="capabilityOutcome">{item.outcome}</p>
     {isZh&&<p className="capabilityExample"><b>实际用途</b><span>{item.example}</span></p>}
     {isZh&&<p className="capabilityBoundary"><b>使用条件</b><span>{item.boundary}</span></p>}
     <a href={item.source} target="_blank" rel="noopener noreferrer" className="capabilitySource">{isZh?'功能来源':'Official source'} <ArrowUpRight size={13}/></a>
    </article>)}</div>
  <div className="capabilityBottom">
   <div><h3>{isZh?'新手三步使用':'Getting started'}</h3><ol>{firstSteps.map((step,i)=><li key={i}><span>{i+1}</span>{step}</li>)}</ol></div>
   <a href={'/vendor/claim?'+new URLSearchParams({product:platform.id,name:platform.name})}>{isZh?'厂商认领并提交新功能 / 真实作品':'Claim and submit product updates'} <ArrowUpRight size={14}/></a>
  </div>
 </section>;
}
