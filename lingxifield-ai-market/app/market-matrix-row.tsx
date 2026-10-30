'use client';
import {Fragment,useState} from 'react';
import type {Platform} from '../lib/data';
import type {Language} from '../lib/v2';
import type {RegionCode} from '../lib/global-region-market';
import {MATRIX_HEADINGS,MATRIX_OVERVIEW_HEADINGS} from '../lib/market-matrix-headings';
import {globalRegionFact,regionCopy,regionName} from '../lib/global-region-market';
import {localizedPaymentName} from './market-global-access';
import {accessFor,accessValue,geoSummary} from '../lib/platform-access-facts';
import {platformLinks,safePublisherLink} from '../lib/official-platform-links';
import {capabilityProfile} from '../lib/capability-profiles';
import MarketRowActions from './market-row-actions';

export default function MarketMatrixRow({platform:p,position,language,region,onDetail,onToggleCompare,isCompared}:{
 platform:Platform;position:number;language:Language;region:RegionCode;onDetail:()=>void;onToggleCompare:()=>void;isCompared:boolean;
}){
 const [expanded,setExpanded]=useState(false);
 const facts=accessFor(p.id),guide=p.guide;
 const localized=regionCopy(language),globalFact=globalRegionFact(p.id,region);
 const rich=capabilityProfile(p.id);
 const sources=platformLinks(p.id).links.filter(safePublisherLink);
 const modelFact=p.conditions?.find(f=>f.label==='模型与用量');
 const reasoningFact=p.conditions?.find(f=>f.label==='推理与理解能力');
 const freeFact=p.conditions?.find(f=>f.label==='免费额度');
 const priceFact=p.conditions?.find(f=>f.label==='价格');
 const failureFact=p.conditions?.find(f=>f.label==='失败扣费');
 const commercialFact=p.conditions?.find(f=>f.label==='商用条件');
 const limitation=facts?.limitations||p.restrictions;
 const login=accessValue(facts?.login,'登录方式待核验');
 const marketRegion=region==='GLOBAL'?localized.global:localized.status[globalFact.policy.status];
 const payment=globalFact.payments.methods.map(x=>localizedPaymentName(x,language)).join('、')||localized.status.unknown;
 const commercial=facts?.commercial||commercialFact?.text||'商业授权待核验';
 const model=modelFact?.text||facts?.models||'代表模型与版本待核验';
 const reasoning=reasoningFact?.text||guide?.reasoning||'推理与理解能力需按具体模型或任务评估';
 const beginner=p.websiteKind==='repository'?'开发配置 / 本地安装':p.websiteKind==='documentation'?'开发者文档':'从官方网站开始；注册条件待核验';
 const useCase=guide?.tasks.slice(0,3).join(' · ')||p.features.slice(0,3).join(' · ')||p.category;
 const free=freeFact?.text||guide?.free||p.free||'免费条件待核验';
 const price=priceFact?.text||guide?.cost||p.price||'价格待核验';
 const headings=MATRIX_HEADINGS[language];
 const compactHeadings=MATRIX_OVERVIEW_HEADINGS[language];
 const detailLabel=language==='zh'?'完整资料 · 16 项':'All details · 16 fields';
 return <Fragment>
  <tr className="marketOverviewRow" data-market-id={p.id}>
   <td className="marketOverviewRank" data-label={compactHeadings[0]} title="目录序号，不代表综合排名">{position}</td>
   <td className="marketOverviewIdentity" data-label={compactHeadings[1]}>
    <button type="button" className="platformName" onClick={onDetail}>
     <span className="brandIcon">{p.symbol}</span>
     <span><strong>{p.name}</strong><small>{p.company}</small></span>
    </button>
    <small>{p.category}</small>
   </td>
   <td className="marketOverviewStrength" data-label={compactHeadings[2]}>
    <strong>{rich?.headline||guide?.strengths||p.features.slice(0,2).join(' · ')||p.about}</strong>
    <p>{rich?.differentiator||p.about}</p>
    <p className="marketOverviewUses">{useCase}</p>
    <button type="button" className="marketOverviewExpand" aria-expanded={expanded}
     aria-controls={'market-details-'+p.id} onClick={()=>setExpanded(v=>!v)}>
     {expanded?(language==='zh'?'收起完整资料':'Collapse details'):detailLabel} <span aria-hidden="true">{expanded?'▴':'▾'}</span>
    </button>
   </td>
   <td className="marketOverviewFree" data-label={compactHeadings[3]}>
    <strong>{free}</strong>
    {freeFact&&<a href={freeFact.source} target="_blank" rel="noopener noreferrer">{language==='zh'?'官方免费规则':'Official terms'} ↗</a>}
   </td>
   <td className="marketOverviewPrice" data-label={compactHeadings[4]}>
    <strong>{price}</strong>
    {(priceFact?.source||guide?.source)&&<a href={priceFact?.source||guide!.source} target="_blank" rel="noopener noreferrer">{language==='zh'?'核验价格':'Price source'} ↗</a>}
   </td>
   <td className="marketOverviewRegion" data-label={compactHeadings[5]}>
    <strong>{regionName(region,language)}</strong>
    <span>{marketRegion}</span>
    <small>{localized.untested}</small>
   </td>
   <td className="marketOverviewActions" data-label={compactHeadings[6]}>
    <MarketRowActions language={language} platform={p} onDetail={onDetail} onToggleCompare={onToggleCompare} isCompared={isCompared}/>
   </td>
  </tr>
  {expanded&&<tr className="marketOverviewDetailsRow">
   <td colSpan={7}>
    <div id={'market-details-'+p.id} className="marketOverviewDetails" role="region" aria-label={p.name+' '+detailLabel}>
     <div className="marketOverviewDetailTitle"><strong>{p.name} · {detailLabel}</strong>
      <button type="button" onClick={()=>setExpanded(false)}>{language==='zh'?'收起':'Close'} ↑</button></div>
     <div className="marketOverviewDetailsGrid">
      <section><h4>{headings[3]}</h4><p>{model}</p>{modelFact&&<a href={modelFact.source} target="_blank" rel="noopener noreferrer">{language==='zh'?'官方型号与版本':'Official versions'} · {modelFact.checkedAt.slice(0,10)} ↗</a>}</section>
      <section><h4>{headings[4]}</h4><p>{reasoning}</p>{reasoningFact&&<a href={reasoningFact.source} target="_blank" rel="noopener noreferrer">{language==='zh'?'官方推理资料':'Reasoning source'} ↗</a>}</section>
      <section><h4>{headings[5]}</h4><p>{useCase}</p><p>{rich?.headline||guide?.strengths||p.about}</p></section>
      <section><h4>{headings[6]}</h4><p>{beginner}</p><p>{language==='zh'?'暂无统一新手上手成功率实测':'No comparable onboarding success-rate test yet.'}</p></section>
      <section><h4>{headings[7]}</h4><p>{free}</p>{freeFact&&<a href={freeFact.source} target="_blank" rel="noopener noreferrer">{language==='zh'?'免费规则来源':'Free allowance source'} ↗</a>}</section>
      <section><h4>{headings[8]}</h4><p>{price}</p><p>{guide?.paid||'付费功能待核验'}</p>{priceFact&&<a href={priceFact.source} target="_blank" rel="noopener noreferrer">{language==='zh'?'价格与套餐来源':'Pricing source'} ↗</a>}</section>
      <section><h4>{headings[9]}</h4><p>{limitation&&limitation!=='待核验'?limitation:'使用限制待核验'}</p><p>{failureFact?.text||'生成失败扣费规则待核验'}</p>{failureFact&&<a href={failureFact.source} target="_blank" rel="noopener noreferrer">{language==='zh'?'失败扣费依据':'Failed-task billing source'} ↗</a>}</section>
      <section><h4>{headings[10]}</h4><p>{regionName(region,language)} · {marketRegion}</p><p>{localized.untested}</p><p>{globalFact.policy.checkedAt||''}</p>{globalFact.policy.source&&<a href={globalFact.policy.source} target="_blank" rel="noopener noreferrer">{localized.source} ↗</a>}</section>
      <section><h4>{headings[11]}</h4><p>{commercial}</p><p>{language==='zh'?'模型与素材授权需分别核对':'Check model and asset licenses separately.'}</p>{(facts?.commercialSource||commercialFact?.source)&&<a href={facts?.commercialSource||commercialFact!.source} target="_blank" rel="noopener noreferrer">{language==='zh'?'商用规则来源':'Commercial licensing source'} ↗</a>}</section>
      <section><h4>{headings[12]}</h4><p>{login}</p><p>{localized.payment}: {payment}</p><p>{localized.source}: {globalFact.payments.checkedAt||localized.status.unknown}</p>{facts?.loginSource&&<a href={facts.loginSource} target="_blank" rel="noopener noreferrer">{language==='zh'?'登录依据':'Sign-in source'} ↗</a>}{globalFact.payments.source&&<a href={globalFact.payments.source} target="_blank" rel="noopener noreferrer">{language==='zh'?'付款依据':'Payment source'} ↗</a>}</section>
      <section><h4>{headings[13]}</h4><p>{geoSummary(p.id)}</p><p>{language==='zh'?'SEO/GEO 须按同关键词、地区、日期进行可复现采样后排名。':'SEO/GEO comparisons require repeatable sampling by query, region and date.'}</p></section>
      <section><h4>{headings[14]}</h4><p><a href={p.website} target="_blank" rel="noopener noreferrer">{p.websiteKind==='repository'?'官方源码':p.websiteKind==='documentation'?'官方文档':'官方网站'} ↗</a></p>{sources.filter(x=>['desktop','ios','android'].includes(x.kind)).map(x=><p key={x.kind+x.url}><a target="_blank" rel="noopener noreferrer" href={x.url}>{x.label} ↗</a></p>)}</section>
      <section><h4>{headings[15]}</h4><button type="button" onClick={onDetail}>{language==='zh'?'查看完整详情':'Full profile'}</button><button type="button" onClick={onToggleCompare}>{isCompared?(language==='zh'?'取消对比':'Remove comparison'):(language==='zh'?'加入对比':'Compare')}</button><p><a href={'/vendor/claim?'+new URLSearchParams({product:p.id,name:p.name})}>{language==='zh'?'厂商免费认领':'Vendor claim'} ↗</a></p></section>
     </div>
     <div className="marketOverviewEvidence">
      <strong>{language==='zh'?'官方证据与更新日期':'Official sources and review dates'}</strong>
      {p.conditions?.map(f=><p key={f.label}><strong>{f.label}：</strong>{f.text} <a href={f.source} target="_blank" rel="noopener noreferrer">{f.checkedAt} ↗</a></p>)}
      {guide?.watermarkNote&&<p>{language==='zh'?'导出与水印：':'Export and watermark: '}{guide.watermarkNote}</p>}
     </div>
    </div>
   </td>
  </tr>}
 </Fragment>;
}
