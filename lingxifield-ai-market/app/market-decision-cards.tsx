'use client';
import type {Platform} from '../lib/data';
import {accessFor,accessValue} from '../lib/platform-access-facts';
import type {Language} from '../lib/v2';
import {MARKET_UI_EXTRA} from '../lib/market-ui-extra';
import {capabilityProfile} from '../lib/capability-profiles';
import {DECISION_I18N} from '../lib/market-decision-i18n';
const missing:Record<Language,Record<"login"|"models"|"commercial"|"export",string>>={zh:{login:"登录入口与条件见官网",models:"具体模型随产品或套餐变化",commercial:"查看官方商用条款",export:"可在官网核对各项导出规则"},en:{login:"Check publisher sign-in conditions",models:"Models depend on product or plan",commercial:"Check commercial license",export:"See publisher export rules"},ja:{login:"公式ログイン条件を確認",models:"モデルはプランごとに異なります",commercial:"商用利用規約を確認",export:"公式の書き出し条件を確認"},ko:{login:"공식 로그인 조건 확인",models:"모델은 요금제에 따라 다름",commercial:"상업용 약관 확인",export:"공식 내보내기 규칙 확인"},fr:{login:"Vérifier les conditions de connexion",models:"Modèles selon le forfait",commercial:"Voir les droits commerciaux",export:"Consulter les règles d’export"},de:{login:"Anmeldebedingungen prüfen",models:"Modelle je nach Tarif",commercial:"Nutzungsrechte prüfen",export:"Exportregeln beim Anbieter prüfen"},es:{login:"Consultar condiciones de acceso",models:"Modelos según plan",commercial:"Revisar licencia comercial",export:"Consultar reglas de exportación"},pt:{login:"Consultar condições de acesso",models:"Modelos conforme plano",commercial:"Ver licença comercial",export:"Consultar regras de exportação"},ar:{login:"راجع شروط الدخول",models:"النماذج تختلف حسب الخطة",commercial:"راجع الترخيص التجاري",export:"راجع قواعد التصدير"}};
export default function MarketDecisionCards({platform,selectedForCompare,onToggleCompare,onOpenPricing,language='zh'}:{
 platform:Platform;selectedForCompare:boolean;onToggleCompare:()=>void;onOpenPricing:()=>void;language?:Language;
}){
 const guide=platform.guide,ui=MARKET_UI_EXTRA[language],rich=capabilityProfile(platform.id),labels=DECISION_I18N[language];
 const facts=platform.conditions||[];
 const access=accessFor(platform.id),fallback=missing[language];
 return <section className="decisionSurface panel" aria-label="使用与收费">
  <div className="decisionHeading"><div><h2>{rich?labels.summary:ui.features}</h2>
   <p>{platform.name} · {platform.category}</p></div></div>
  {guide?<div className="choiceFacts">
   {!rich&&<article><h3>{labels.what}</h3><p>{guide.tasks.join(' · ')}</p></article>}
   <article><h3>{labels.free}</h3><p>{facts.find(f=>f.label==='免费额度')?.text||guide.free}</p></article>
   <article><h3>{labels.paid}</h3><p>{guide.paid}</p></article>
   <article><h3>{labels.price}</h3><p>{facts.find(f=>f.label==='价格')?.text||guide.cost}</p></article>
   <article><h3>{labels.login}</h3><p>{accessValue(access?.login,fallback.login)}</p></article>
   <article><h3>{labels.models}</h3><p>{access?.models||fallback.models}</p></article>
   <article><h3>{labels.commercial}</h3><p>{access?.commercial||fallback.commercial}</p></article>
   
   {!rich&&guide.strengths&&<article><h3>{labels.advantages}</h3><p>{guide.strengths}</p></article>}
   {!rich&&guide.reasoning&&<article><h3>{labels.reasoning}</h3><p>{guide.reasoning}</p></article>}
   <article><h3>{labels.watermark}</h3><p>{guide.watermarkNote||fallback.export}</p>
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
