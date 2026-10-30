'use client';
import type {Platform} from '../lib/data';
import {accessFor,accessValue,geoSummary} from '../lib/platform-access-facts';
import type {Language} from '../lib/v2';
import {MARKET_UI_EXTRA} from '../lib/market-ui-extra';
import {capabilityProfile} from '../lib/capability-profiles';
import {DECISION_I18N} from '../lib/market-decision-i18n';
export default function MarketDecisionCards({platform,selectedForCompare,onToggleCompare,onOpenPricing,language='zh'}:{
 platform:Platform;selectedForCompare:boolean;onToggleCompare:()=>void;onOpenPricing:()=>void;language?:Language;
}){
 const guide=platform.guide,ui=MARKET_UI_EXTRA[language],rich=capabilityProfile(platform.id),labels=DECISION_I18N[language];
 const facts=platform.conditions||[];
 const access=accessFor(platform.id);
 return <section className="decisionSurface panel" aria-label="使用与收费">
  <div className="decisionHeading"><div><h2>{rich?labels.summary:ui.features}</h2>
   <p>{platform.name} · {platform.category}</p></div></div>
  {guide?<div className="choiceFacts">
   {!rich&&<article><h3>{labels.what}</h3><p>{guide.tasks.join(' · ')}</p></article>}
   <article><h3>{labels.free}</h3><p>{guide.free}</p></article>
   <article><h3>{labels.paid}</h3><p>{guide.paid}</p></article>
   <article><h3>{labels.price}</h3><p>{guide.cost}</p></article>
   <article><h3>{labels.login}</h3><p>{accessValue(access?.login,'暂无经核实的账号登录方式')}</p></article>
   <article><h3>{labels.models}</h3><p>{access?.models||'具体版本与模型限制尚未核实'}</p></article>
   <article><h3>{labels.commercial}</h3><p>{access?.commercial||'商用授权资料尚未核实'}</p></article>
   <article><h3>SEO / GEO</h3><p>{geoSummary(platform.id)}。待完成同关键词、同时间范围的可复现监测后再排名。</p></article>
   {!rich&&guide.strengths&&<article><h3>{labels.advantages}</h3><p>{guide.strengths}</p></article>}
   {!rich&&guide.reasoning&&<article><h3>{labels.reasoning}</h3><p>{guide.reasoning}</p></article>}
   <article><h3>{labels.watermark}</h3><p>{guide.watermarkNote||'该产品的图片、视频或音频导出规则尚无可核查资料，请查看官网。'}</p>
    {guide.watermarkSource&&<a href={guide.watermarkSource} target="_blank" rel="noopener noreferrer">查看相关说明 ↗</a>}</article>
  </div>:<div className="decisionSummary"><strong>{platform.category}</strong>
   <span>{platform.features.slice(0,5).join(' · ')}</span>
   {facts.filter(f=>f.label==='免费额度'||f.label==='价格').map(f=><p key={f.label}><strong>{f.label}：</strong>{f.text}</p>)}
   <p>{labels.notice}</p></div>}
  <details className="decisionMore"><summary>{labels.rules}</summary>
   {access?.loginSource&&<p><a href={access.loginSource} target="_blank" rel="noopener noreferrer">官方登录方式说明 ↗</a></p>}
   {access?.paymentSource&&<p><a href={access.paymentSource} target="_blank" rel="noopener noreferrer">支付渠道官方说明 ↗</a></p>}
   {access?.commercialSource&&<p><a href={access.commercialSource} target="_blank" rel="noopener noreferrer">商业授权说明 ↗</a></p>}
   {guide?<p><a href={guide.source} target="_blank" rel="noopener noreferrer">官方价格或功能说明 ↗</a> · 更新于 {guide.checkedAt}</p>:null}
   {facts.map(f=><p key={f.label}><strong>{f.label}</strong>：{f.text} <a href={f.source} target="_blank" rel="noopener noreferrer">官方说明 ↗</a></p>)}
  </details>
  <div className="decisionActions"><button type="button" className="decisionPrimary" onClick={onOpenPricing}>{ui.pricing} / {ui.limits}</button>
   <button type="button" className="decisionSecondary" onClick={onToggleCompare}>{selectedForCompare?labels.remove:ui.compare}</button></div>
 </section>;
}
