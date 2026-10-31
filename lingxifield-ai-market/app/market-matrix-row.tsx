'use client';
import type {Platform} from '../lib/data';
import type {Language} from '../lib/v2';
import type {RegionCode} from '../lib/global-region-market';
import {globalRegionFact,regionCopy,regionName} from '../lib/global-region-market';
import {localizedPaymentName} from './market-global-access';
import {globalRegionSummary,regionPresentation} from '../lib/region-presentation';
import {accessFor,accessValue} from '../lib/platform-access-facts';
import {summaryFor,shortDramaEvidence,shortDramaSummary,MARKET_SCREEN_COPY} from '../lib/market-v36-screening';
import MarketRowActions from './market-row-actions';
import {paymentFactsFor,matchingPaymentMethods} from '../lib/market-payment-facts';
import type {MarketPayment} from '../lib/market-v36-screening';
import {commercialEvidence} from '../lib/market-commercial-evidence';
import {localizedProductSummary} from '../lib/market-product-locale';
import {localizedCatalogFact,localizedLoginFact} from '../lib/market-fact-locale';
import {localizedCategory} from '../lib/market-home-i18n';
import {researchedFact} from '../lib/market-researched-facts';

const columns:Record<Language,string[]>={
 zh:['序号','AI 工具 / 厂商','核心优势 · 擅长做什么','免费额度','真实价格','所在国家可用','付款 · 登录','短剧 / 短视频','代表模型','商用授权','操作'],
 en:['No.','Tool / Publisher','Core strengths','Free usage','Price','Country support','Payment / Login','AI short films / clips','Models','Commercial','Actions'],
 ja:['番号','ツール / 企業','強みと用途','無料枠','料金','地域対応','決済 / 登録','短編映像 / 動画','モデル','商用','操作'],
 ko:['번호','도구 / 기업','강점과 사용법','무료 한도','가격','국가 지원','결제 / 로그인','단편 영화 / 영상','모델','상업 이용','작업'],
 fr:['N°','Outil / Éditeur','Atouts et usages','Gratuit','Tarifs','Disponibilité','Paiement / Accès','Courts-métrages / clips','Modèles','Commercial','Actions'],
 de:['Nr.','Tool / Anbieter','Stärken und Einsatz','Gratis','Preis','Land','Zahlung / Anmeldung','Kurzfilm / Videoclips','Modelle','Gewerblich','Aktionen'],
 es:['N.º','Producto / Empresa','Fortalezas','Gratis','Precio','País','Pago / Acceso','Cortos / videoclips','Modelos','Comercial','Acciones'],
 pt:['N.º','Produto / Empresa','Pontos fortes','Grátis','Preço','País','Pagamento / Acesso','Curtas / videoclipes','Modelos','Comercial','Ações'],
 ar:['الرقم','الأداة / الشركة','أهم المزايا','المجاني','السعر','توفر البلد','الدفع / الدخول','أفلام قصيرة / مقاطع','النماذج','تجاري','إجراءات']
};
export const V36_COL_COUNT=11;
export function marketRowTitles(language:Language){return columns[language];}
const localizedNotice:Record<Language,string>={
 zh:'尚无可靠资料',en:'Not verified',ja:'未確認',ko:'미확인',fr:'Non vérifié',de:'Nicht geprüft',es:'Sin verificar',pt:'Não verificado',ar:'لم يتم التحقق'
};
const SPECIFIC:Record<Language,Record<"free"|"price"|"models"|"commercial"|"login"|"payment",string>>={
zh:{free:"官网未列出统一免费额度",price:"未公布统一价格",models:"未公布具体模型",commercial:"查看商用许可",login:"查看官网登录",payment:"本地支付方式未说明"},
en:{free:"Free allowance differs by plan",price:"No single published price",models:"Models not detailed",commercial:"Check commercial terms",login:"See official sign-in",payment:"Local payments not specified"},
ja:{free:"無料枠はプラン別",price:"統一価格は未公表",models:"モデルの詳細未公開",commercial:"商用条件を確認",login:"公式ログインを確認",payment:"地域別決済未記載"},
ko:{free:"무료 한도는 요금제별",price:"통합 가격 미공개",models:"모델 상세 미공개",commercial:"상업용 약관 확인",login:"공식 로그인 확인",payment:"지역별 결제 미공개"},
fr:{free:"Quota selon formule",price:"Pas de prix unique",models:"Modèles non détaillés",commercial:"Vérifier la licence",login:"Voir la connexion",payment:"Paiement local non indiqué"},
de:{free:"Gratis-Limit je Tarif",price:"Kein Einheitspreis",models:"Modelle nicht angegeben",commercial:"Lizenz prüfen",login:"Anmeldung prüfen",payment:"Regionale Zahlung unklar"},
es:{free:"Gratis según plan",price:"Sin precio único",models:"Modelos sin detalle",commercial:"Ver licencia",login:"Consultar acceso",payment:"Pago local no indicado"},
pt:{free:"Grátis conforme plano",price:"Sem preço único",models:"Modelos sem detalhes",commercial:"Ver licença",login:"Consultar acesso",payment:"Pagamento local não indicado"},
ar:{free:"المجاني حسب الخطة",price:"لا يوجد سعر موحد",models:"النماذج غير مفصلة",commercial:"راجع الترخيص",login:"راجع التسجيل",payment:"الدفع المحلي غير موضح"},
};
const isUnknownText=(v:string|undefined)=>!v||/^(待核验|尚无可靠资料|以官网为准|暂无可核验资料|not verified)$/i.test(v.trim());
export default function MarketMatrixRow({platform:p,position,language,region,paymentFilter='any',onDetail,onToggleCompare,isCompared}:{
 platform:Platform;position:number;language:Language;region:RegionCode;paymentFilter?:MarketPayment;onDetail:()=>void;onToggleCompare:()=>void;isCompared:boolean;
}){
 const t=MARKET_SCREEN_COPY[language],h=marketRowTitles(language),specific=SPECIFIC[language];
 const summary=summaryFor(p),guide=p.guide,access=accessFor(p.id),research=researchedFact(p.id);
 const r=region==='GLOBAL'?null:globalRegionFact(p.id,region);
 const regionList=regionPresentation(p.id,language);
 const regionText=r?regionCopy(language).status[r.policy.status]:(regionList.total?(regionList.complete?regionList.words.complete:regionList.words.partial):regionList.words.empty);
 const statusUnsupported=r?.policy.status==='unsupported';
 const free=p.conditions?.find(x=>x.label==='免费额度');
 const price=p.conditions?.find(x=>x.label==='价格');
 const commercial=p.conditions?.find(x=>x.label==='商用条件');
 const rawCost=price?.text||guide?.cost||p.price;
 const cost=localizedCatalogFact(p.id,language,'price',isUnknownText(rawCost)?specific.price:rawCost);
 const rawFree=free?.text||guide?.free||p.free;
 const allowance=localizedCatalogFact(p.id,language,'free',isUnknownText(rawFree)?specific.free:rawFree);
 const rawModels=p.conditions?.find(x=>x.label==='模型与用量')?.text||access?.models;
 const models=localizedCatalogFact(p.id,language,'models',isUnknownText(rawModels)?specific.models:rawModels||specific.models);
 const rawCommercial=access?.commercial||commercial?.text;
 const commercialValue=isUnknownText(rawCommercial)?specific.commercial:rawCommercial;
 const licenseFact=commercialEvidence(p.id,language);
 const paymentFact=paymentFactsFor(p.id,region);
 const allPayments=paymentFact.methods;
 const matched=paymentFilter==='any'?[]:matchingPaymentMethods(p.id,paymentFilter,region);
 const locallyFree=Boolean(research?.priceSource)&&/本地|开源|SDK/.test(research?.price||'')&&!allPayments.length;
 const paymentMethods=allPayments.length?
  [...new Set([...matched,...allPayments])].slice(0,5).map(x=>localizedPaymentName(x,language)).join(' · '):
  locallyFree?({zh:'本地软件免费，无需在线付款',en:'Free local software; no checkout',ja:'本体無料・決済不要',ko:'로컬 무료·결제 불필요',fr:'Logiciel local gratuit',de:'Lokale Software kostenlos',es:'Software local gratuito',pt:'Software local gratuito',ar:'البرنامج المحلي مجاني'} as Record<Language,string>)[language]:
  (language==='zh'?'尚未找到厂商可核实的支付渠道':specific.payment);
 const paymentScope=paymentFact.scope==='unsupported'?
  regionCopy(language).status.unsupported:
  paymentFact.scope==='unverified_region'?
  ({zh:'官网列有渠道，该地区结算未核实',en:'Provider offers it; local checkout unverified',ja:'公式掲載あり・現地決済未確認',ko:'공식 결제수단, 지역 결제 미확인',fr:'Canal officiel ; paiement local non vérifié',de:'Anbieter nennt Option; vor Ort ungeprüft',es:'Método oficial; pago local sin verificar',pt:'Método oficial; pagamento local não verificado',ar:'طريقة رسمية، الدفع المحلي غير مؤكد'} as Record<Language,string>)[language]:
  ({zh:'厂商公开支付渠道 · 以结算页为准',en:'Publisher-listed methods · checkout may vary',ja:'公式決済方法・購入画面で確認',ko:'공식 결제 수단 · 결제 화면 확인',fr:'Moyens publiés · selon paiement',de:'Offizielle Methoden · je Checkout',es:'Métodos oficiales · depende del pago',pt:'Métodos oficiais · confira no checkout',ar:'طرق رسمية، تتغير عند الدفع'} as Record<Language,string>)[language];
 const login=p.id==='anthropic-sdk-python'?(language==='zh'?'SDK可直接安装；调用API需官方账号与密钥':'Install SDK freely; API account and key required'):localizedLoginFact(language,accessValue(access?.login,specific.login));
 const drama=shortDramaEvidence(p.id);
 const videoTool=Boolean(drama)||/视频|video|film|clip|短剧/i.test(p.category);
 return <tr className="marketOverviewRow marketV36Row" data-market-id={p.id}>
   <td className="marketOverviewRank" data-label={h[0]}>{position}</td>
   <td className="marketOverviewIdentity" data-label={h[1]}>
    <button type="button" className="platformName" onClick={onDetail}>
     <span className="brandIcon" aria-hidden="true">{p.symbol}</span>
     <span><strong>{p.name}</strong><small>{p.company}</small></span>
    </button><small>{localizedCategory(language,p.category)}</small>
   </td>
   <td className="marketOverviewStrength" data-label={h[2]}>
    <strong>{localizedProductSummary(p.id,language)||summary.headline}</strong>
    {language==='zh'?<p className="marketOverviewUses">{summary.capabilities}</p>:null}
    <a href={summary.source} target="_blank" rel="noopener noreferrer">{t.source} ↗</a>
    <button type="button" className="marketV36More" onClick={onDetail}>{t.more} ↗</button>
   </td>
   <td className="marketOverviewFree" data-label={h[3]}><strong>{allowance}</strong>{free&&<a href={free.source} target="_blank" rel="noopener noreferrer">{t.source} ↗</a>}</td>
   <td className="marketOverviewPrice" data-label={h[4]}><strong>{cost}</strong>{price&&<a href={price.source} target="_blank" rel="noopener noreferrer">{t.source} ↗</a>}</td>
   <td className="marketOverviewRegion" data-label={h[5]}>
    <strong>{globalRegionSummary(p.id,language)}</strong>
    {(region!=='GLOBAL'||regionList.total>0)&&<span className={'marketRegionStatus marketRegionStatus-'+(r?.policy.status||'unknown')}>{region==='GLOBAL'?regionText:regionName(region,language)+' · '+regionText}</span>}
    {(r?.policy.source||regionList.source||research?.regionSource)&&<a href={r?.policy.source||regionList.source||research?.regionSource} target="_blank" rel="noopener noreferrer">{t.source} ↗</a>}
   </td>
   <td className="marketV36Login" data-label={h[6]}><strong title={allPayments.map(x=>localizedPaymentName(x,language)).join(' · ')}>{p.id==='anthropic-sdk-python'?(language==='zh'?'SDK免费；API单独计费':'SDK free; API billed separately'):paymentMethods}</strong>{(locallyFree||region!=='GLOBAL')&&<small>{locallyFree?(language==='zh'?'模型 API/云服务单独计费':specific.payment):paymentScope}</small>}{(paymentFact.source|| (locallyFree?research?.priceSource:null))&&<a href={paymentFact.source||(research?.priceSource||'#')} target="_blank" rel="noopener noreferrer">{t.source} ↗</a>}<small>{login}</small><button type="button" className="marketV37More" onClick={onDetail}>{t.more} ↗</button></td>
   <td className="marketV36Drama" data-label={h[7]}>{drama?<><span className="marketDramaYes">{shortDramaSummary(p.id,language)||t.dramaYes}</span><a href={drama} target="_blank" rel="noopener noreferrer">{t.source} ↗</a></>:(videoTool?<span className="marketDramaUnknown">{t.dramaUnknown}</span>:<span className="marketDramaNA" aria-label="Not applicable">—</span>)}</td>
   <td className="marketV36Model" data-label={h[8]}>{models}</td>
   <td className="marketV36Business" data-label={h[9]}>{licenseFact?<><strong className="marketLicenseVerdict">{licenseFact.label}</strong><p className="marketLicenseCondition">{licenseFact.condition}</p><a href={licenseFact.source} target="_blank" rel="noopener noreferrer">{t.source} ↗</a></>:<><strong className="marketLicenseUnknown">{language==='zh'?'商用规则待核实':specific.commercial}</strong>{!isUnknownText(rawCommercial)&&<p className="marketLicenseCondition">{language==='zh'?rawCommercial:({en:'Commercial rights are not yet independently verified for this product and plan.',ja:'この製品・プランの商用条件は確認中です。',ko:'이 제품 및 요금제의 상업적 권리는 확인 중입니다.',fr:'Droits commerciaux non encore vérifiés pour cette offre.',de:'Gewerbliche Nutzungsrechte für diesen Tarif noch ungeprüft.',es:'Derechos comerciales de este plan aún sin verificar.',pt:'Direitos comerciais deste plano ainda não verificados.',ar:'الحقوق التجارية لهذه الخطة قيد التحقق.',zh:''} as Record<Language,string>)[language]}</p>}{(access?.commercialSource||commercial?.source)&&<a href={access?.commercialSource||commercial?.source} target="_blank" rel="noopener noreferrer">{t.source} ↗</a>}</>}</td>
   <td className="marketOverviewActions" data-label={h[10]}><MarketRowActions language={language} platform={p} onDetail={onDetail} onToggleCompare={onToggleCompare} isCompared={isCompared}/></td>
  </tr>;
}
