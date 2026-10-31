'use client';
import {useMemo,useState} from 'react';
import type {Language,Currency} from '../lib/v2';
import {VIDEO_RATES,API_RATES,KLING_PLANS,estimateKnownVideoRate,type Resolution} from '../lib/market-rate-catalog';
import {estimateApiUsageCost} from '../lib/market-cost-math';
const COPY:Record<Language,readonly string[]>={"zh":["按平台算真实费用","先选平台、模型和分辨率，自动使用官方价格。","视频 / 短剧","程序接口 API","AI 平台","模型 / 套餐","画质 / 分辨率","每段秒数","生成段数","输入参考视频秒数（每次）","预计消耗","查看官方计费规则","官方价格尚未核实，暂不能计算","该分辨率没有核实的官方价格，请换画质或模型。","原生生成","放大输出（非原生）","套餐价（非单次价）","按量付费","积分","每月额度","占套餐比例","套餐不足，可能需要补充积分或升级","用户输入量（Token）","AI 输出量（Token）","API 指程序自动调用模型，不需要手填价格。","人民币和美元不按固定汇率换算；显示厂商原币计费。税费、输入素材、重试、优惠和其他服务可能另计。","该模型支持的画质","暂未公布","官方核验","预计账单","不限车型"],"en":["Estimate verified costs","Choose provider, model and resolution; official rates fill automatically.","Video / short film","Developer API","Provider","Model / plan","Output resolution","Seconds / clip","Number of clips","Input video seconds per clip","Estimated use","Official rate source","No verified per-clip price for this plan yet.","No verified rate for this resolution. Select a different model or resolution.","Native output","Upscaled (not native)","Subscription only (not per video)","Metered usage","credits","Monthly allowance","Share of monthly credits","Allowance exceeded; extra credits or upgrade may be needed","Input tokens","Output tokens","An API lets software call an AI model; prices are prefilled.","Publisher billing currency is shown without invented conversion. Taxes, inputs, retries and other charges can apply.","Verified resolutions","Not published","Verified source","Estimated charge",""],"ja":["公式料金から計算","提供会社・モデル・画質を選ぶと単価を自動入力。","動画・短編","開発者 API","提供会社","モデル・プラン","解像度","動画の秒数","本数","入力動画の秒数","推定使用量","公式料金表","単価未確認のため計算不可。","この解像度の公式料金は未確認です。","ネイティブ","アップスケール","月額プラン（動画単価ではない）","従量課金","クレジット","月間枠","月間枠の割合","枠を超過","入力トークン","出力トークン","APIはプログラムからAIを呼び出す方法です。単価は自動設定。","公式通貨で表示します。税・再試行・追加料金は別。","利用できる画質","未発表","公式資料","推定料金",""],"ko":["공식 사용료 계산","제공업체, 모델, 화질 선택 시 요금 자동 적용.","동영상·단편","개발자 API","제공업체","모델·요금제","해상도","클립 길이(초)","클립 수","입력 영상 초","예상 사용량","공식 요금","확인된 단가가 없습니다.","해당 해상도 공식 요금 미확인.","원본 출력","업스케일","월 구독(건별 요금 아님)","사용량 기반","크레딧","월별 한도","한도 사용 비율","월별 한도 초과","입력 토큰","출력 토큰","API는 소프트웨어에서 AI를 호출하는 방법입니다.","공급자 통화 기준. 세금 및 추가 비용 별도.","확인된 화질","미공개","공식 자료","예상 요금",""],"fr":["Estimer le coût officiel","Choisissez fournisseur, modèle et résolution ; tarifs préremplis.","Vidéo / court métrage","API développeur","Fournisseur","Modèle / offre","Résolution","Secondes / clip","Nombre de clips","Secondes vidéo source","Consommation prévue","Tarif officiel","Prix par clip non vérifié.","Aucun tarif vérifié pour cette résolution.","Natif","Agrandissement","Abonnement (pas à l'unité)","À l'usage","crédits","Quota mensuel","Part du quota","Quota dépassé","Tokens entrée","Tokens sortie","Une API permet aux logiciels d'appeler un modèle. Tarifs automatiques.","Devise de facturation du fournisseur ; taxes et frais hors calcul.","Résolutions","Non publié","Source","Coût estimé",""],"de":["Offizielle Kosten schätzen","Anbieter, Modell und Auflösung wählen; Tarife automatisch.","Video / Kurzfilm","Entwickler-API","Anbieter","Modell / Tarif","Auflösung","Sekunden je Clip","Clip-Anzahl","Quellvideo-Sekunden","Geschätzter Verbrauch","Offizieller Tarif","Kein bestätigter Einzelpreis.","Keine bestätigten Preise für diese Auflösung.","Nativ","Hochskaliert","Abo (kein Einzelpreis)","Nutzungsbasiert","Credits","Monatskontingent","Anteil Monatskontingent","Kontingent überschritten","Eingabe-Tokens","Ausgabe-Tokens","Eine API lässt Programme KI-Modelle aufrufen.","Originalwährung; Steuern und weitere Gebühren zusätzlich.","Auflösungen","Nicht veröffentlicht","Quelle","Geschätzte Kosten",""],"es":["Calcular coste oficial","Elige proveedor, modelo y resolución; precio automático.","Vídeo / cortometraje","API de desarrollador","Proveedor","Modelo / plan","Resolución","Segundos por clip","Número de clips","Segundos de vídeo fuente","Uso estimado","Tarifa oficial","Precio unitario sin verificar.","Sin precio verificado para esta resolución.","Nativo","Escalado","Suscripción (no por vídeo)","Por uso","créditos","Cuota mensual","Porcentaje de cuota","Cuota superada","Tokens entrada","Tokens salida","Una API conecta software con modelos de IA; tarifas automáticas.","Se muestra moneda original. Impuestos y extras aparte.","Resoluciones","No publicado","Fuente","Coste estimado",""],"pt":["Calcular custo oficial","Escolha provedor, modelo e resolução; tarifa automática.","Vídeo / curta","API de desenvolvedor","Provedor","Modelo / plano","Resolução","Segundos por clipe","Número de clipes","Segundos de vídeo de entrada","Uso previsto","Tarifa oficial","Preço unitário não verificado.","Sem tarifa oficial para essa resolução.","Nativo","Ampliado","Assinatura (não por vídeo)","Por uso","créditos","Franquia mensal","Percentual da franquia","Franquia excedida","Tokens de entrada","Tokens de saída","Uma API permite que programas acessem modelos; tarifas automáticas.","Moeda original do provedor; impostos e extras à parte.","Resoluções","Não divulgado","Fonte","Custo estimado",""],"ar":["حساب التكلفة الرسمية","اختر الشركة والنموذج والدقة؛ تظهر الأسعار تلقائياً.","فيديو / فيلم قصير","واجهة API للمطورين","الشركة","النموذج / الخطة","الدقة","ثوانٍ لكل مقطع","عدد المقاطع","ثوانٍ من فيديو الإدخال","الاستهلاك المتوقع","مصدر التسعير الرسمي","لم يُتحقق من سعر كل مقطع.","لا يوجد سعر مؤكد لهذه الدقة.","أصلي","تكبير غير أصلي","اشتراك وليس سعر كل مقطع","حسب الاستهلاك","رصيد","حصة شهرية","النسبة من الحصة","تجاوز الحصة","رموز الإدخال","رموز الإخراج","API وسيلة تسمح للبرنامج باستخدام النموذج؛ الأسعار تلقائية.","تعرض عملة الشركة؛ الضرائب والرسوم الإضافية منفصلة.","الدقات","غير منشور","مصدر رسمي","التكلفة المقدرة",""]};
const fmt=(n:number)=>Number(n.toFixed(6)).toLocaleString('en-US',{maximumFractionDigits:6});
const positiveInt=(s:string)=>/^\d+$/.test(s)&&Number.isSafeInteger(Number(s))?Number(s):null;
export default function MarketCostEstimator({language,currency}:{language:Language;currency:Currency}){
 const t=COPY[language]||COPY.zh;
 const [mode,setMode]=useState<'video'|'api'>('video');
 const providers=useMemo(()=>[...new Map(VIDEO_RATES.map(x=>[x.platform,x.provider])).entries()],[]);
 const [provider,setProvider]=useState('runway'),[model,setModel]=useState('Gen-4.5 Web'),[region,setRegion]=useState('Web'),[resolution,setResolution]=useState<Resolution>('720p');
 const [klingPlanId,setKlingPlanId]=useState('standard');
 const [seconds,setSeconds]=useState('5'),[clips,setClips]=useState('6'),[inputVideo,setInputVideo]=useState('0');
 const [apiId,setApiId]=useState(API_RATES[0]?.id||''),[inTokens,setInTokens]=useState('1000000'),[outTokens,setOutTokens]=useState('250000');
 const candidates=VIDEO_RATES.filter(r=>r.platform===provider);
 const models=[...new Map(candidates.map(r=>[r.model+'|'+r.region,{model:r.model,region:r.region}])).values()];
 const variants=candidates.filter(r=>r.model===model&&r.region===region);
 const variant=variants.find(r=>r.resolution===resolution);
 const rate=variant||null;
 const klingPlan=KLING_PLANS.find(p=>p.id===klingPlanId)||KLING_PLANS[0];
 const coveredCredits=provider==='kling'?klingPlan.monthlyCredits:rate?.includedCredits??null;
 const sec=positiveInt(seconds),count=positiveInt(clips),inSeconds=positiveInt(inputVideo);
 const calculated=rate&&sec!==null&&count!==null&&inSeconds!==null?estimateKnownVideoRate(rate,sec,count,inSeconds):null;
 const promoExpired=Boolean(rate?.promoEnds)&&Date.now()>new Date(rate!.promoEnds+'T23:59:59+08:00').getTime();
 const tokenRate=API_RATES.find(r=>r.id===apiId)||API_RATES[0];
 const inputCount=positiveInt(inTokens),outputCount=positiveInt(outTokens);
 const apiCost=tokenRate&&inputCount!==null&&outputCount!==null?estimateApiUsageCost(inputCount,outputCount,tokenRate.inPerMillion,tokenRate.outPerMillion):null;
 const chooseProvider=(p:string)=>{const first=VIDEO_RATES.find(r=>r.platform===p);setProvider(p);if(first){setModel(first.model);setRegion(first.region);setResolution(first.resolution);}};
 const chooseModel=(key:string)=>{const next=candidates.find(r=>r.model+'|'+r.region===key);if(next){setModel(next.model);setRegion(next.region);setResolution(next.resolution);}};
 const numberField=(label:string,v:string,cb:(s:string)=>void)=><label className="lxCostField"><span>{label}</span><input type="number" inputMode="numeric" min="0" step="1" value={v} onChange={e=>cb(e.target.value)}/></label>;
 const selectField=(label:string,value:string,onChange:(s:string)=>void,options:{value:string;label:string}[])=><label className="lxCostField"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;
 return <section className="lxCostEstimate lxCostV44" aria-label={t[0]}>
  <div className="lxCostHeader"><div><h3>{t[0]}</h3><p>{t[1]}</p></div><div className="lxCostMode" role="group"><button type="button" aria-pressed={mode==='video'} onClick={()=>setMode('video')}>{t[2]}</button><button type="button" aria-pressed={mode==='api'} onClick={()=>setMode('api')}>{t[3]}</button></div></div>
  {mode==='video'?<>
   <div className="lxCostFields">
    {selectField(t[4],provider,chooseProvider,providers.map(([value,label])=>({value,label})))}
    {selectField(t[5],model+'|'+region,chooseModel,models.map(x=>({value:x.model+'|'+x.region,label:x.model+(x.region==='Web'?'':' · '+x.region)})))}
    <label className="lxCostField"><span>{t[6]}</span>{variants.length===1?<strong className="lxCostFixedResolution">{variants[0].resolution}</strong>:<select value={resolution} onChange={e=>setResolution(e.target.value as Resolution)}>{variants.map(v=><option key={v.id} value={v.resolution}>{v.resolution}{v.outputType==='upscaled'?' · '+t[15]:''}</option>)}</select>}</label>
    {provider==='kling'?selectField(language==='zh'?'会员套餐':'Membership plan',klingPlanId,setKlingPlanId,KLING_PLANS.map(p=>({value:p.id,label:p.name+' · '+p.monthlyCredits+' '+t[18]+' / month'}))):null}
    {numberField(t[7],seconds,setSeconds)}
    {numberField(t[8],clips,setClips)}
    {rate?.chargesInputVideo?numberField(t[9],inputVideo,setInputVideo):null}
   </div>
   {rate?<div className="lxCostResult">
    <strong>{rate.billing==='plan-equivalent'?(language==='zh'?'套餐折合成本':'Plan-equivalent cost'):rate.billing==='token-only'?(language==='zh'?'API 按视频 Token 计费':'API billed per video token'):t[29]}: {promoExpired?(language==='zh'?'活动已过期，请核对新价':'Promotion expired; check updated price'):calculated?.kind==='money'?rate.currency+' '+fmt(calculated.amount!):calculated?.kind==='equivalent'?rate.currency+' '+fmt(calculated.amount!):calculated?.kind==='credits'?fmt(calculated.credits!)+' '+t[18]:rate.billing==='token-only'?rate.currency+' '+rate.apiPerMillionNoVideo+' / 1M video tokens':t[12]}</strong>
    {calculated?.kind==='credits'?<small>{t[19]}: {coveredCredits??t[26]} {t[18]} · {t[20]}: {coveredCredits?fmt(calculated.credits!/coveredCredits*100)+'%':t[26]}{coveredCredits&&calculated.credits!>coveredCredits?' · '+t[21]:''}</small>:null}
    {rate.planMonthly!==null&&provider!=='kling'?<small>{t[16]}: {rate.currency} {fmt(rate.planMonthly)} / {language==='zh'?'月':'month'} {rate.subscription?.startsWith('annual')?(language==='zh'?'（需按年购买，非按月扣款）':' (billed annually)'):''}</small>:null}
    {rate.planTotal!==undefined?<small>{language==='zh'?'首期实付':'Initial term'}: {rate.currency} {fmt(rate.planTotal)} / {rate.termMonths} {language==='zh'?'个月':'months'} · {language==='zh'?'续费':'Renewal'}: {rate.currency} {fmt(rate.renewTotal??0)}</small>:null}
    {provider==='kling'?<small>{language==='zh'?'会员首月参考价':'First-month offer'}: USD {klingPlan.firstMonth} · {language==='zh'?'续费参考':'Renewal'}: USD {klingPlan.renewMonthly}/{language==='zh'?'月':'month'} · {coveredCredits} {t[18]} <a href={klingPlan.source} target="_blank" rel="noopener noreferrer">{t[11]} ↗</a></small>:null}
    {rate.renewMonthly!==undefined&&provider!=='kling'?<small>{language==='zh'?'续费参考':'Renewal reference'}: {rate.currency} {fmt(rate.renewMonthly)} / {language==='zh'?'月':'month'}</small>:null}
    {rate.promoEnds?<small>{language==='zh'?'活动截止':'Promotion ends'}: {rate.promoEnds}</small>:null}
    {rate.billing==='plan-equivalent'?<small>{language==='zh'?'该金额是官方活动套餐的等效用量价值，实际扣会员积分，不会按秒重新收现金。':'This is the plan-equivalent value; actual usage deducts included credits, not a new per-second cash bill.'}</small>:null}
    {rate.billing==='token-only'?<small>{language==='zh'?'无参考视频':'Without input video'}: {rate.currency} {rate.apiPerMillionNoVideo}/1M Tokens · {language==='zh'?'含参考视频':'With input video'}: {rate.currency} {rate.apiPerMillionWithVideo}/1M Tokens</small>:null}
    {rate.billing==='per-second'?<small>{t[17]}: {rate.currency} {rate.perSecond} / sec{rate.chargesInputVideo?' · '+t[9]+' included':''}</small>:null}
    {provider==='grok'?<small>{language==='zh'?'Grok 免费账户可先体验；480p 免费一次等具体次数按登录后账户权益确认，API视频另按秒收费。':'Grok can be tried free; the number of free 480p videos varies by account. API video is billed separately.'}</small>:null}
    {calculated?.kind==='credits'&&coveredCredits&&calculated.credits!>coveredCredits?<small>{language==='zh'?'超额积分：'+fmt(calculated.credits!-coveredCredits)+'积分。':'Excess: '+fmt(calculated.credits!-coveredCredits)+' credits. ' }{language==='zh'?'超出会员积分：请通过厂商官方积分购买/升级结算；未核实额外积分包单价前不虚构金额。':'Over plan credits: purchase extras or upgrade on the provider billing page. No invented top-up price.'}</small>:null}
    {rate.outputType==='upscaled'?<small>{t[15]}</small>:rate.outputType==='native'?<small>{t[14]}</small>:null}
    {calculated===null&&sec!==null&&count!==null?<small>{language==='zh'?'长度不符合该模型要求：':'Duration outside model limits: '}{rate.minSeconds}–{rate.maxSeconds}s</small>:null}
    <small>{language==='zh'?rate.notes:rate.billing==='unverified'?'Resolution and exact usage price have not been independently verified.':rate.chargesInputVideo?'Both input and output video seconds are billed.':rate.outputType==='upscaled'?'Output is upscaled, not natively rendered.':'Additional inputs, taxes and retries may cost extra.'}</small>
    <a href={rate.source} target="_blank" rel="noopener noreferrer">{t[11]} ↗</a>
   </div>:<div className="lxCostResult"><strong>{t[13]}</strong><small>{t[27]}: {variants.map(x=>x.resolution).join(' · ')||t[26]}</small></div>}
  </>:<>
   <p className="lxCostIntro">{t[24]}</p>
   <div className="lxCostFields">
    {selectField(t[5],apiId,setApiId,API_RATES.map(r=>({value:r.id,label:r.provider+' · '+r.model})))}
    {numberField(t[22],inTokens,setInTokens)}
    {numberField(t[23],outTokens,setOutTokens)}
   </div>
   {tokenRate?<div className="lxCostResult">
    <strong>{t[29]}: {apiCost===null?t[12]:tokenRate.currency+' '+fmt(apiCost)}</strong>
    <small>{tokenRate.currency} {tokenRate.inPerMillion}/1M {t[22]} · {tokenRate.currency} {tokenRate.outPerMillion}/1M {t[23]}</small>
    <small>{language==='zh'?tokenRate.notes:'Rates apply to the named model and billing period; cache and tool charges may differ.'}</small>
    <a href={tokenRate.source} target="_blank" rel="noopener noreferrer">{t[11]} ↗</a>
   </div>:null}
  </>}
  <p className="lxCostDisclaimer">{t[25]} {currency==='CNY'?'CNY':'USD'}</p>
 </section>;
}
