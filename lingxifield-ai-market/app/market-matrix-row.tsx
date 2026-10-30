'use client';
import {Fragment,useState} from 'react';
import type {Platform} from '../lib/data';
import type {Language} from '../lib/v2';
import type {RegionCode} from '../lib/global-region-market';
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
 const officialDownload=sources.find(link=>['desktop','ios','android'].includes(link.kind));
 const modelFact=p.conditions?.find(f=>f.label==='模型与用量');
 const reasoningFact=p.conditions?.find(f=>f.label==='推理与理解能力');
 const freeFact=p.conditions?.find(f=>f.label==='免费额度');
 const priceFact=p.conditions?.find(f=>f.label==='价格');
 const failureFact=p.conditions?.find(f=>f.label==='失败扣费');
 const commercialFact=p.conditions?.find(f=>f.label==='商用条件');
 const limitation=facts?.limitations||p.restrictions;
 const accessLogin=accessValue(facts?.login,'登录方式待核验');
 const marketRegion=region==='GLOBAL'?localized.global:localized.status[globalFact.policy.status];
 const payment=globalFact.payments.methods.map(x=>localizedPaymentName(x,language)).join('、')||localized.status.unknown;
 const commercial=facts?.commercial||commercialFact?.text||'商业授权待核验';
 const model=modelFact?.text||facts?.models||'代表模型与版本待核验';
 const reasoning=reasoningFact?.text||guide?.reasoning||'推理与理解能力需按具体模型或任务评估';
 const beginner=p.websiteKind==='repository'?'开发配置 / 本地安装':p.websiteKind==='documentation'?'开发者文档':'从官方网站开始；注册条件待核验';
 const useCase=guide?.tasks.slice(0,3).join(' · ')||p.features.slice(0,3).join(' · ')||p.category;
 return <Fragment>
  <tr className="marketMatrixRow marketMatrix16Row" data-market-id={p.id}>
   <td className="rankIndex" title="目录序号，不代表综合排名">{position}</td>
   <td className="directoryIdentity">
    <button type="button" className="platformName" onClick={onDetail}><span className="brandIcon">{p.symbol}</span><span><strong>{p.name}</strong><small>{p.company}</small></span></button>
    <small className="matrixTiny">{p.category}</small>
   </td>
   <td className="matrixBrief"><strong>{rich?.headline||guide?.strengths||p.features.slice(0,2).join(' · ')||p.about}</strong>
    <small>{rich?.differentiator||p.about}</small><small>{rich?rich.capabilities.slice(0,2).map(c=>c.name).join(' · '):p.features.slice(0,3).join(' · ')}</small><small className="matrixCaveat">官网资料整理，非独立效果评分</small></td>
   <td className="matrixBrief"><strong>{model}</strong>
    {modelFact?<a className="matrixSource" target="_blank" rel="noopener noreferrer" href={modelFact.source}>官方型号 · {modelFact.checkedAt.slice(0,10)} ↗</a>:<small>型号随版本与套餐变化</small>}</td>
   <td className="matrixBrief"><strong>{reasoning}</strong>
    {reasoningFact?<a className="matrixSource" target="_blank" rel="noopener noreferrer" href={reasoningFact.source}>官方说明 · {reasoningFact.checkedAt.slice(0,10)} ↗</a>:<small>暂无可比独立能力评分</small>}</td>
   <td className="matrixBrief"><strong>{useCase}</strong><small>先按任务选工具，再对照费用与限制</small></td>
   <td className="matrixBrief"><strong>{beginner}</strong><small>暂无统一新手上手成功率实测</small></td>
   <td className="matrixBrief"><strong>{guide?.free||freeFact?.text||p.free||'免费条件待核验'}</strong>
    {freeFact&&<a className="matrixSource" href={freeFact.source} target="_blank" rel="noopener noreferrer">免费规则来源 ↗</a>}</td>
   <td className="matrixBrief"><strong>{guide?.cost||priceFact?.text||p.price||'价格待核验'}</strong>
    <small>{guide?.paid||'付费功能待核验'}</small>{(guide?.source||priceFact?.source)&&<a className="matrixSource" target="_blank" rel="noopener noreferrer" href={guide?.source||priceFact!.source}>价格与套餐来源 ↗</a>}</td>
   <td className="matrixBrief"><strong>{limitation&&limitation!=='待核验'?limitation:'使用限制待核验'}</strong>
    <small>{failureFact?.text||'生成失败扣费规则待核验'}</small>{failureFact&&<a className="matrixSource" target="_blank" rel="noopener noreferrer" href={failureFact.source}>失败扣费依据 ↗</a>}</td>
   <td className="matrixBrief"><strong>{regionName(region,language)} · {marketRegion}</strong><small>{localized.untested}</small><button type="button" className="matrixMore" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}>{expanded?'收起证据与限制':'展开完整证据与限制'} ▾</button></td>
   <td className="matrixBrief"><strong>{commercial}</strong><small>模型与素材授权需分别核对</small>{(facts?.commercialSource||commercialFact?.source)&&<a className="matrixSource" href={facts?.commercialSource||commercialFact!.source} target="_blank" rel="noopener noreferrer">商用规则来源 ↗</a>}</td>
   <td className="matrixBrief"><strong>{localized.payment}: {payment}</strong><small>{localized.market}</small><small>{localized.source}: {globalFact.payments.checkedAt||localized.status.unknown}</small>
    {facts?.loginSource&&<a className="matrixSource" href={facts.loginSource} target="_blank" rel="noopener noreferrer">登录依据 ↗</a>}
    {globalFact.payments.source&&<a className="matrixSource" href={globalFact.payments.source} target="_blank" rel="noopener noreferrer">{localized.source} ↗</a>}</td>
   <td className="matrixBrief"><strong>{geoSummary(p.id)}</strong><small>SEO 与 GEO 需独立采样、不同地区及日期比较</small></td>
   <td className="matrixBrief matrixOfficialCell"><a href={p.website} target="_blank" rel="noopener noreferrer">{p.websiteKind==='repository'?'官方源码':p.websiteKind==='documentation'?'官方文档':'打开官方网站'} ↗</a>
    {officialDownload&&<a href={officialDownload.url} target="_blank" rel="noopener noreferrer">{officialDownload.label} ↗</a>}<small>网页使用、下载与技术文档分开</small></td>
   <td className="marketActionCell"><MarketRowActions platform={p} onDetail={onDetail} onToggleCompare={onToggleCompare} isCompared={isCompared}/></td>
  </tr>
  {expanded&&<tr className="matrixExpansion"><td colSpan={16}>
   <div className="matrixExpandGrid">
    <section><h4>模型与理解优势</h4><p>{model}</p><p>{reasoning}</p><p>{guide?.strengths||p.about}</p></section>
    <section><h4>{localized.availability}</h4><p>{regionName(region,language)} · {marketRegion}</p><p>{localized.untested}</p><p>{limitation||'尚无核实资料'}</p><p>{commercial}</p><p>导出：{guide?.watermarkNote||'导出规则待核验'}</p></section>
    <section><h4>{localized.payment} · {localized.source}</h4><p>{payment}</p>{p.conditions?.map(f=><p key={f.label}><a href={f.source} target="_blank" rel="noopener noreferrer">{f.label} · {f.checkedAt} ↗</a></p>)}</section>
    <section><h4>下载与官方入口</h4><p>{p.websiteKind==='repository'?'这是开源项目，可能需要本地配置，而非直接登录的 SaaS 服务。':'厂商官网、客户端、下载页应分别查看。'}</p>
      {sources.filter(x=>['desktop','ios','android'].includes(x.kind)).map(x=><p key={x.kind+x.url}><a target="_blank" rel="noopener noreferrer" href={x.url}>{x.label} ↗</a></p>)}
    </section>
   </div>
  </td></tr>}
 </Fragment>;
}
