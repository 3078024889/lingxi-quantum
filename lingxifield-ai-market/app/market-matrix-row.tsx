'use client';
import type {Platform} from '../lib/data';
import type {Language} from '../lib/v2';
import type {RegionCode} from '../lib/global-region-market';
import {globalRegionFact,regionCopy,regionName} from '../lib/global-region-market';
import {localizedPaymentName} from './market-global-access';
import {accessFor,accessValue} from '../lib/platform-access-facts';
import {summaryFor,shortDramaEvidence,MARKET_SCREEN_COPY} from '../lib/market-v36-screening';
import MarketRowActions from './market-row-actions';

const columns:Record<Language,string[]>={
 zh:['序号','AI 工具 / 厂商','核心优势 · 擅长做什么','免费额度','真实价格','所在国家可用','代表模型','短剧生成','商用授权','登录 · 付款','操作'],
 en:['No.','Tool / Publisher','Core strengths','Free usage','Price','Country support','Models','Short films','Commercial','Login / Pay','Actions'],
 ja:['番号','ツール / 企業','強みと用途','無料枠','料金','地域対応','モデル','短編動画','商用','登録・支払い','操作'],
 ko:['번호','도구 / 기업','강점과 사용법','무료 한도','가격','국가 지원','모델','단편 영상','상업 이용','로그인/결제','작업'],
 fr:['N°','Outil / Éditeur','Atouts et usages','Gratuit','Tarifs','Disponibilité','Modèles','Courts-métrages','Commercial','Accès / Paiement','Actions'],
 de:['Nr.','Tool / Anbieter','Stärken und Einsatz','Gratis','Preis','Land','Modelle','Kurzfilme','Gewerblich','Login / Zahlung','Aktionen'],
 es:['N.º','Producto / Empresa','Fortalezas','Gratis','Precio','País','Modelos','Cortos IA','Comercial','Acceso / Pago','Acciones'],
 pt:['N.º','Produto / Empresa','Pontos fortes','Grátis','Preço','País','Modelos','Curtas IA','Comercial','Acesso / Pagamento','Ações'],
 ar:['الرقم','الأداة / الشركة','أهم المزايا','المجاني','السعر','توفر البلد','النماذج','فيلم قصير','تجاري','الدخول / الدفع','إجراءات']
};
export const V36_COL_COUNT=11;
export function marketRowTitles(language:Language){return columns[language];}
const localizedNotice:Record<Language,string>={
 zh:'尚无可靠资料',en:'Not verified',ja:'未確認',ko:'미확인',fr:'Non vérifié',de:'Nicht geprüft',es:'Sin verificar',pt:'Não verificado',ar:'لم يتم التحقق'
};
export default function MarketMatrixRow({platform:p,position,language,region,onDetail,onToggleCompare,isCompared}:{
 platform:Platform;position:number;language:Language;region:RegionCode;onDetail:()=>void;onToggleCompare:()=>void;isCompared:boolean;
}){
 const t=MARKET_SCREEN_COPY[language],h=marketRowTitles(language);
 const summary=summaryFor(p),guide=p.guide,access=accessFor(p.id);
 const r=region==='GLOBAL'?null:globalRegionFact(p.id,region);
 const regionText=r?regionCopy(language).status[r.policy.status]:t.regionHint;
 const statusUnsupported=r?.policy.status==='unsupported';
 const free=p.conditions?.find(x=>x.label==='免费额度');
 const price=p.conditions?.find(x=>x.label==='价格');
 const commercial=p.conditions?.find(x=>x.label==='商用条件');
 const cost=price?.text||guide?.cost||p.price||localizedNotice[language];
 const allowance=free?.text||guide?.free||p.free||localizedNotice[language];
 const models=p.conditions?.find(x=>x.label==='模型与用量')?.text||access?.models||localizedNotice[language];
 const commercialValue=access?.commercial||commercial?.text||localizedNotice[language];
 const login=accessValue(access?.login,localizedNotice[language]);
 const payment=statusUnsupported?regionCopy(language).status.unsupported:(r?.payments.methods||[]).map(x=>localizedPaymentName(x,language)).join(' · ')||localizedNotice[language];
 const drama=shortDramaEvidence(p.id);
 return <tr className="marketOverviewRow marketV36Row" data-market-id={p.id}>
   <td className="marketOverviewRank" data-label={h[0]}>{position}</td>
   <td className="marketOverviewIdentity" data-label={h[1]}>
    <button type="button" className="platformName" onClick={onDetail}>
     <span className="brandIcon" aria-hidden="true">{p.symbol}</span>
     <span><strong>{p.name}</strong><small>{p.company}</small></span>
    </button><small>{p.category}</small>
   </td>
   <td className="marketOverviewStrength" data-label={h[2]}>
    <strong>{summary.headline}</strong>
    <p className="marketOverviewUses">{summary.capabilities}</p>
    <a href={summary.source} target="_blank" rel="noopener noreferrer">{t.source} ↗</a>
    <button type="button" className="marketV36More" onClick={onDetail}>{t.more} ↗</button>
   </td>
   <td className="marketOverviewFree" data-label={h[3]}><strong>{allowance}</strong>{free&&<a href={free.source} target="_blank" rel="noopener noreferrer">{t.source} ↗</a>}</td>
   <td className="marketOverviewPrice" data-label={h[4]}><strong>{cost}</strong>{price&&<a href={price.source} target="_blank" rel="noopener noreferrer">{t.source} ↗</a>}</td>
   <td className="marketOverviewRegion" data-label={h[5]}>
    <strong>{region==='GLOBAL'?regionCopy(language).global:regionName(region,language)}</strong>
    <span className={'marketRegionStatus marketRegionStatus-'+(r?.policy.status||'unknown')}>{regionText}</span>
    {r?.policy.source&&<a href={r.policy.source} target="_blank" rel="noopener noreferrer">{r.policy.checkedAt||t.source} ↗</a>}
   </td>
   <td className="marketV36Model" data-label={h[6]}>{models}</td>
   <td className="marketV36Drama" data-label={h[7]}>{drama?<><span className="marketDramaYes">{t.dramaYes}</span><a href={drama} target="_blank" rel="noopener noreferrer">{t.source} ↗</a></>:<span className="marketDramaUnknown">{t.dramaUnknown}</span>}</td>
   <td className="marketV36Business" data-label={h[8]}><span>{commercialValue}</span>{(access?.commercialSource||commercial?.source)&&<a href={access?.commercialSource||commercial?.source} target="_blank" rel="noopener noreferrer">{t.source} ↗</a>}</td>
   <td className="marketV36Login" data-label={h[9]}><strong>{login}</strong><span>{payment}</span></td>
   <td className="marketOverviewActions" data-label={h[10]}><MarketRowActions language={language} platform={p} onDetail={onDetail} onToggleCompare={onToggleCompare} isCompared={isCompared}/></td>
  </tr>;
}
