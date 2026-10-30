'use client';
import {Fragment,useState} from 'react';
import type {Platform} from '../lib/data';
import {accessFor,accessValue,geoSummary} from '../lib/platform-access-facts';
import {platformLinks,safePublisherLink} from '../lib/official-platform-links';
import MarketRowActions from './market-row-actions';

export default function MarketMatrixRow({platform:p,position,onDetail,onToggleCompare,isCompared}:{
 platform:Platform;position:number;onDetail:()=>void;onToggleCompare:()=>void;isCompared:boolean;
}){
 const [expanded,setExpanded]=useState(false);
 const facts=accessFor(p.id),guide=p.guide;
 const evidence=platformLinks(p.id).links.filter(safePublisherLink);
 const limitation=facts?.limitations||p.restrictions;
 const accessLogin=accessValue(facts?.login,'暂无厂商公开登录方式记录');
 const payment=accessValue(facts?.payment,'尚未核实支付渠道');
 const marketRegion=facts?.mainland==='yes'?'支持本地运行':facts?.mainland==='no'?'官方不支持大陆':facts?.mainland==='conditional'?'限定服务地区':'中国大陆可用性未核实';
 const commercial=facts?.commercial||'商业授权尚无已核实资料';
 return <Fragment>
  <tr className="marketMatrixRow" data-market-id={p.id}>
   <td className="rankIndex">{position}</td>
   <td className="directoryIdentity">
    <button type="button" className="platformName" onClick={onDetail}><span className="brandIcon">{p.symbol}</span><span><strong>{p.name}</strong><small>{p.company}</small></span></button>
    <div className="directoryTasks">{guide?.tasks.slice(0,3).join(' · ')||p.features.slice(0,3).join(' · ')}</div>
    <small className="matrixTiny">{guide?.strengths||p.about}</small>
   </td>
   <td className="matrixBrief"><strong>{facts?.models||'模型版本待核实'}</strong>
    <small>{guide?.reasoning||'推理与理解能力因模型而异'}</small></td>
   <td className="matrixPlans">
    <p><b className="planLabel freeLabel">免费</b> {guide?.free||p.conditions?.find(f=>f.label==='免费额度')?.text||'未公布可核实免费权益'}</p>
    <p><b className="planLabel paidLabel">付费</b> {guide?.paid||'未公布可核实付费功能'}</p>
   </td>
   <td className="matrixBrief"><strong>{guide?.cost||p.price||'价格尚未核实'}</strong>
    <small>{guide?.visualWatermark==='none'?'无可见水印':guide?.visualWatermark==='paid_only_no_mark'?'付费可无水印':guide?.visualWatermark==='included'?'包含可见水印':'导出水印未核实'}</small></td>
   <td className="matrixBrief"><strong>{marketRegion}</strong>
    <small>{limitation&&limitation!=='待核验'?limitation:'使用限制未核实'}</small>
    <button type="button" className="matrixMore" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}>商用与限制 {expanded?'收起':'展开'} ▾</button></td>
   <td className="matrixBrief"><strong>{accessLogin}</strong><small>付款：{payment}</small></td>
   <td className="matrixBrief"><strong>{geoSummary(p.id)}</strong><small>SEO 与 GEO 按区域、关键词和采样日分别统计</small></td>
   <td className="marketActionCell"><MarketRowActions platform={p} onDetail={onDetail} onToggleCompare={onToggleCompare} isCompared={isCompared}/></td>
  </tr>
  {expanded&&<tr className="matrixExpansion"><td colSpan={9}>
   <div className="matrixExpandGrid">
    <section><h4>模型与理解优势</h4><p>{facts?.models||'暂无可靠型号记录'}</p><p>{guide?.reasoning||'不同模型的推理能力需依据具体版本测试。'}</p><p>{guide?.strengths||p.about}</p></section>
    <section><h4>限制、地区与商用</h4><p>{limitation||'尚无核实资料'}</p><p>{facts?.regionNote||guide?.region||'支持地区尚无可核实说明'}</p><p>商用：{commercial}</p><p>导出：{guide?.watermarkNote||'规则未核实'}</p></section>
    <section><h4>登录、付款与证据</h4><p>登录：{accessLogin}</p><p>付款：{payment}</p><p>{facts?.paymentSource&&<a href={facts.paymentSource} target="_blank" rel="noopener noreferrer">支付来源 ↗</a>}</p><p>{facts?.loginSource&&<a href={facts.loginSource} target="_blank" rel="noopener noreferrer">登录方式官方说明 ↗</a>}</p><p>{facts?.commercialSource&&<a href={facts.commercialSource} target="_blank" rel="noopener noreferrer">商用条款 ↗</a>}</p><p>{guide?.source&&<a href={guide.source} target="_blank" rel="noopener noreferrer">官方价格和功能 ↗</a>}</p></section>
    <section><h4>下载与官方入口</h4><p>{p.websiteKind==='repository'?'这是开源项目，不是可直接登录的消费级网页产品。':'部分厂商官网首先展示登录界面，登录后才可体验；下载页与使用入口分开。'}</p>
      {evidence.filter(x=>['desktop','ios','android'].includes(x.kind)).map(x=><p key={x.kind+x.url}><a target="_blank" rel="noopener noreferrer" href={x.url}>{x.label} ↗</a></p>)}
    </section>
   </div>
  </td></tr>}
 </Fragment>;
}
