'use client';
import type {Platform} from '../lib/data';
import type {Language} from '../lib/v2';
import {DECISION_TITLES} from '../lib/decision-titles';
import {MARKET_UI_EXTRA} from '../lib/market-ui-extra';

type Condition = NonNullable<Platform['conditions']>[number];
type Decision = {key:string;title:string;description:string;fact?:Condition};

export default function MarketDecisionCards({
  platform,
  selectedForCompare,
  onToggleCompare,
  onOpenPricing,
  language='zh',
}:{
  platform:Platform;
  selectedForCompare:boolean;
  onToggleCompare:()=>void;
  onOpenPricing:()=>void;
  language?:Language;
}) {
  const facts=platform.conditions || [];
  const localized=DECISION_TITLES[language];
  const ui=MARKET_UI_EXTRA[language];
  const get=(label:string)=>facts.find(f=>f.label===label);
  const cards:Decision[]=[
    {key:'free',title:'免费额度',description:'具体次数、积分及恢复周期',fact:get('免费额度')},
    {key:'price',title:'实际价格',description:'请核对套餐、计费周期及任务成本',fact:get('价格')},
    {key:'failure',title:'失败会扣费吗？',description:'失败、取消和超时分别核验',fact:get('失败扣费')},
    {key:'region',title:'地区与使用门槛',description:'中国大陆、手机号、信用卡分别核验',fact:get('地区与年龄')},
    {key:'watermark',title:'导出和水印',description:'下载格式、水印及清晰度限制',fact:get('导出水印')},
    {key:'commercial',title:'能否商用？',description:'按套餐、模型及素材授权核验',fact:get('商用条件')},
  ];
  const covered=cards.filter(c=>c.fact).length;
  return <section className="decisionSurface panel" aria-label="平台使用前的关键问题">
    <div className="decisionHeading">
      <div><h2>{localized[6]}</h2><p>免费多少、实际花费、失败扣费、地区限制、下载和商用条件。仅展示有来源的结论。</p></div>
      <span className="decisionCoverage">已核验 {covered}/6 项</span>
    </div>
    <div className="decisionGrid">
      {cards.map((card,i)=><article className="decisionCard" key={card.key}>
        <h3>{localized[i]}</h3>
        <p className={card.fact?'decisionValue':'decisionUnknown'}>{card.fact?.text||'待核验'}</p>
        <small>{card.fact?card.fact.scope:card.description}</small>
        {card.fact&&<a href={card.fact.source} target="_blank" rel="noopener noreferrer">查看依据 · {card.fact.checkedAt} ↗</a>}
      </article>)}
    </div>
    <div className="decisionActions">
      <button type="button" className="decisionPrimary" onClick={onOpenPricing}>查看详细费用与限制</button>
      <button type="button" className="decisionSecondary" onClick={onToggleCompare}>{selectedForCompare?'已加入对比 · 点击移除':'加入竞品对比'}</button>
      <span>未公开、未核实的字段不会用猜测值补齐。</span>
    </div>
  </section>;
}
