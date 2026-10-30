'use client';
import type {Platform} from '../lib/data';
import type {Language} from '../lib/v2';
import {DECISION_TITLES} from '../lib/decision-titles';
import {MARKET_UI_EXTRA} from '../lib/market-ui-extra';

type Condition = NonNullable<Platform['conditions']>[number];
type Decision = {key:string;title:string;description:string;fact?:Condition};
export default function MarketDecisionCards({platform,selectedForCompare,onToggleCompare,onOpenPricing,language='zh'}:{
 platform:Platform;selectedForCompare:boolean;onToggleCompare:()=>void;onOpenPricing:()=>void;language?:Language;
}){
 const facts=platform.conditions || [];
 const localized=DECISION_TITLES[language],ui=MARKET_UI_EXTRA[language];
 const get=(label:string)=>facts.find(f=>f.label===label);
 const cards:Decision[]=[
  {key:'free',title:'免费额度',description:'免费次数和恢复时间',fact:get('免费额度')},
  {key:'price',title:'实际价格',description:'套餐和计费方式',fact:get('价格')},
  {key:'failure',title:'失败会扣费吗？',description:'失败扣费和退款',fact:get('失败扣费')},
  {key:'region',title:'地区与使用门槛',description:'哪些地区能用',fact:get('地区与年龄')},
  {key:'watermark',title:'导出和水印',description:'水印和下载限制',fact:get('导出水印')},
  {key:'commercial',title:'能否商用？',description:'商用许可',fact:get('商用条件')}
 ];
 const known=cards.filter(card=>card.fact);
 const missing=cards.filter(card=>!card.fact);
 return <section className="decisionSurface panel" aria-label="使用前先了解">
  <div className="decisionHeading"><div><h2>{language==='zh'?'使用前先看这几项':localized[6]}</h2>
   <p>{language==='zh'?'免费能用多少、怎么收费、有哪些限制，一眼看清。':ui.limits}</p></div>
   {!!known.length&&<span className="decisionCoverage">{language==='zh'?'来自官方资料':'Official sources'}</span>}
  </div>
  {!!known.length?<div className="decisionGrid">
   {known.map((card)=><article className="decisionCard" key={card.key}>
    <h3>{card.title}</h3><p className="decisionValue">{card.fact?.text}</p>
    <small>{card.fact?.scope}</small>
    {card.fact&&<a href={card.fact.source} target="_blank" rel="noopener noreferrer">{language==='zh'?'查看官方说明':'Official source'} · {card.fact.checkedAt} ↗</a>}
   </article>)}
  </div>:<div className="decisionSummary"><strong>{platform.category}</strong>
   <span>{platform.features.slice(0,4).join(' · ')}</span>
   <p>{language==='zh'?'更多费用与使用规则正在整理，可先通过上方官方入口了解产品。':ui.noData}</p>
  </div>}
  {missing.length>0&&<details className="decisionMore"><summary>{language==='zh'?'还想了解什么？':'More details'} ({missing.length})</summary>
   <div className="decisionMoreItems">{missing.map(card=><span key={card.key}>{card.title}</span>)}</div>
   <p>{language==='zh'?'这些内容暂未找到明确的公开说明，点击上方官网可进一步了解。':ui.noData}</p>
  </details>}
  <div className="decisionActions">
   <button type="button" className="decisionPrimary" onClick={onOpenPricing}>{ui.pricing} / {ui.limits}</button>
   <button type="button" className="decisionSecondary" onClick={onToggleCompare}>{selectedForCompare?(language==='zh'?'移出对比':'Remove comparison'):ui.compare}</button>
  </div>
 </section>;
}
