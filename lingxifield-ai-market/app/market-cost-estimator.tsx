'use client';
import {useMemo,useState} from 'react';
import type {Language,Currency} from '../lib/v2';
import {VIDEO_RATES,API_RATES,RESOLUTIONS,estimateKnownVideoRate,type Resolution} from '../lib/market-rate-catalog';
import {estimateApiUsageCost} from '../lib/market-cost-math';
const COPY:Record<Language,readonly string[]>={"zh":["按平台算真实费用","先选平台、模型和分辨率，自动使用官方价格。","视频 / 短剧","程序接口 API","AI 平台","模型 / 套餐","画质 / 分辨率","每段秒数","生成段数","输入参考视频秒数（每次）","预计消耗","查看官方计费规则","官方价格尚未核实，暂不能计算","该分辨率没有核实的官方价格，请换画质或模型。","原生生成","放大输出（非原生）","套餐价（非单次价）","按量付费","积分","每月额度","占套餐比例","套餐不足，可能需要补充积分或升级","用户输入量（Token）","AI 输出量（Token）","API 指程序自动调用模型，不需要手填价格。","人民币和美元不按固定汇率换算；显示厂商原币计费。税费、输入素材、重试、优惠和其他服务可能另计。","该模型支持的画质","暂未公布","官方核验","预计账单","不限车型"],"en":["Estimate verified costs","Choose provider, model and resolution; official rates fill automatically.","Video / short film","Developer API","Provider","Model / plan","Output resolution","Seconds / clip","Number of clips","Input video seconds per clip","Estimated use","Official rate source","No verified per-clip price for this plan yet.","No verified rate for this resolution. Select a different model or resolution.","Native output","Upscaled (not native)","Subscription only (not per video)","Metered usage","credits","Monthly allowance","Share of monthly credits","Allowance exceeded; extra credits or upgrade may be needed","Input tokens","Output tokens","An API lets software call an AI model; prices are prefilled.","Publisher billing currency is shown without invented conversion. Taxes, inputs, retries and other charges can apply.","Verified resolutions","Not published","Verified source","Estimated charge",""],"ja":["公式料金から計算","提供会社・モデル・画質を選ぶと単価を自動入力。","動画・短編","開発者 API","提供会社","モデル・プラン","解像度","動画の秒数","本数","入力動画の秒数","推定使用量","公式料金表","単価未確認のため計算不可。","この解像度の公式料金は未確認です。","ネイティブ","アップスケール","月額プラン（動画単価ではない）","従量課金","クレジット","月間枠","月間枠の割合","枠を超過","入力トークン","出力トークン","APIはプログラムからAIを呼び出す方法です。単価は自動設定。","公式通貨で表示します。税・再試行・追加料金は別。","利用できる画質","未発表","公式資料","推定料金",""],"ko":["공식 사용료 계산","제공업체, 모델, 화질 선택 시 요금 자동 적용.","동영상·단편","개발자 API","제공업체","모델·요금제","해상도","클립 길이(초)","클립 수","입력 영상 초","예상 사용량","공식 요금","확인된 단가가 없습니다.","해당 해상도 공식 요금 미확인.","원본 출력","업스케일","월 구독(건별 요금 아님)","사용량 기반","크레딧","월별 한도","한도 사용 비율","월별 한도 초과","입력 토큰","출력 토큰","API는 소프트웨어에서 AI를 호출하는 방법입니다.","공급자 통화 기준. 세금 및 추가 비용 별도.","확인된 화질","미공개","공식 자료","예상 요금",""],"fr":["Estimer le coût officiel","Choisissez fournisseur, modèle et résolution ; tarifs préremplis.","Vidéo / court métrage","API développeur","Fournisseur","Modèle / offre","Résolution","Secondes / clip","Nombre de clips","Secondes vidéo source","Consommation prévue","Tarif officiel","Prix par clip non vérifié.","Aucun tarif vérifié pour cette résolution.","Natif","Agrandissement","Abonnement (pas à l'unité)","À l'usage","crédits","Quota mensuel","Part du quota","Quota dépassé","Tokens entrée","Tokens sortie","Une API permet aux logiciels d'appeler un modèle. Tarifs automatiques.","Devise de facturation du fournisseur ; taxes et frais hors calcul.","Résolutions","Non publié","Source","Coût estimé",""],"de":["Offizielle Kosten schätzen","Anbieter, Modell und Auflösung wählen; Tarife automatisch.","Video / Kurzfilm","Entwickler-API","Anbieter","Modell / Tarif","Auflösung","Sekunden je Clip","Clip-Anzahl","Quellvideo-Sekunden","Geschätzter Verbrauch","Offizieller Tarif","Kein bestätigter Einzelpreis.","Keine bestätigten Preise für diese Auflösung.","Nativ","Hochskaliert","Abo (kein Einzelpreis)","Nutzungsbasiert","Credits","Monatskontingent","Anteil Monatskontingent","Kontingent überschritten","Eingabe-Tokens","Ausgabe-Tokens","Eine API lässt Programme KI-Modelle aufrufen.","Originalwährung; Steuern und weitere Gebühren zusätzlich.","Auflösungen","Nicht veröffentlicht","Quelle","Geschätzte Kosten",""],"es":["Calcular coste oficial","Elige proveedor, modelo y resolución; precio automático.","Vídeo / cortometraje","API de desarrollador","Proveedor","Modelo / plan","Resolución","Segundos por clip","Número de clips","Segundos de vídeo fuente","Uso estimado","Tarifa oficial","Precio unitario sin verificar.","Sin precio verificado para esta resolución.","Nativo","Escalado","Suscripción (no por vídeo)","Por uso","créditos","Cuota mensual","Porcentaje de cuota","Cuota superada","Tokens entrada","Tokens salida","Una API conecta software con modelos de IA; tarifas automáticas.","Se muestra moneda original. Impuestos y extras aparte.","Resoluciones","No publicado","Fuente","Coste estimado",""],"pt":["Calcular custo oficial","Escolha provedor, modelo e resolução; tarifa automática.","Vídeo / curta","API de desenvolvedor","Provedor","Modelo / plano","Resolução","Segundos por clipe","Número de clipes","Segundos de vídeo de entrada","Uso previsto","Tarifa oficial","Preço unitário não verificado.","Sem tarifa oficial para essa resolução.","Nativo","Ampliado","Assinatura (não por vídeo)","Por uso","créditos","Franquia mensal","Percentual da franquia","Franquia excedida","Tokens de entrada","Tokens de saída","Uma API permite que programas acessem modelos; tarifas automáticas.","Moeda original do provedor; impostos e extras à parte.","Resoluções","Não divulgado","Fonte","Custo estimado",""],"ar":["حساب التكلفة الرسمية","اختر الشركة والنموذج والدقة؛ تظهر الأسعار تلقائياً.","فيديو / فيلم قصير","واجهة API للمطورين","الشركة","النموذج / الخطة","الدقة","ثوانٍ لكل مقطع","عدد المقاطع","ثوانٍ من فيديو الإدخال","الاستهلاك المتوقع","مصدر التسعير الرسمي","لم يُتحقق من سعر كل مقطع.","لا يوجد سعر مؤكد لهذه الدقة.","أصلي","تكبير غير أصلي","اشتراك وليس سعر كل مقطع","حسب الاستهلاك","رصيد","حصة شهرية","النسبة من الحصة","تجاوز الحصة","رموز الإدخال","رموز الإخراج","API وسيلة تسمح للبرنامج باستخدام النموذج؛ الأسعار تلقائية.","تعرض عملة الشركة؛ الضرائب والرسوم الإضافية منفصلة.","الدقات","غير منشور","مصدر رسمي","التكلفة المقدرة",""]};
const fmt=(n:number)=>Number(n.toFixed(6)).toLocaleString('en-US',{maximumFractionDigits:6});
const positiveInt=(s:string)=>/^\d+$/.test(s)&&Number.isSafeInteger(Number(s))?Number(s):null;
export default function MarketCostEstimator({language,currency}:{language:Language;currency:Currency}){
 const t=COPY[language]||COPY.zh;
 const [mode,setMode]=useState<'video'|'api'>('video');
 const providers=useMemo(()=>[...new Map(VIDEO_RATES.map(x=>[x.platform,x.provider])).entries()],[]);
 const [provider,setProvider]=useState('runway'),[model,setModel]=useState('Gen-4.5 Web'),[region,setRegion]=useState('Web'),[resolution,setResolution]=useState<Resolution>('720p');
 const [seconds,setSeconds]=useState('5'),[clips,setClips]=useState('6'),[inputVideo,setInputVideo]=useState('0');
 const [apiId,setApiId]=useState(API_RATES[0]?.id||''),[inTokens,setInTokens]=useState('1000000'),[outTokens,setOutTokens]=useState('250000');
 const candidates=VIDEO_RATES.filter(r=>r.platform===provider);
 const models=[...new Map(candidates.map(r=>[r.model+'|'+r.region,{model:r.model,region:r.region}])).values()];
 const variants=candidates.filter(r=>r.model===model&&r.region===region);
 const variant=variants.find(r=>r.resolution===resolution);
 const rate=variant||null;
 const sec=positiveInt(seconds),count=positiveInt(clips),inSeconds=positiveInt(inputVideo);
 const calculated=rate&&sec!==null&&count!==null&&inSeconds!==null?estimateKnownVideoRate(rate,sec,count,inSeconds):null;
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
    <label className="lxCostField"><span>{t[6]}</span><select value={resolution} onChange={e=>setResolution(e.target.value as Resolution)}>{[...RESOLUTIONS,'not-confirmed' as Resolution].map(r=><option key={r} value={r}>{r==='not-confirmed'?t[26]:r} {variants.some(v=>v.resolution===r)?'':'— '+t[13]}</option>)}</select></label>
    {numberField(t[7],seconds,setSeconds)}
    {numberField(t[8],clips,setClips)}
    {rate?.chargesInputVideo?numberField(t[9],inputVideo,setInputVideo):null}
   </div>
   {rate?<div className="lxCostResult">
    <strong>{t[29]}: {calculated?.kind==='money'?rate.currency+' '+fmt(calculated.amount!):calculated?.kind==='credits'?fmt(calculated.credits!)+' '+t[18]:t[12]}</strong>
    {calculated?.kind==='credits'?<small>{t[19]}: {rate.includedCredits??t[26]} {t[18]} · {t[20]}: {rate.includedCredits?fmt(calculated.credits!/rate.includedCredits*100)+'%':t[26]}{rate.includedCredits&&calculated.credits!>rate.includedCredits?' · '+t[21]:''}</small>:null}
    {rate.planMonthly!==null?<small>{t[16]}: {rate.currency} {fmt(rate.planMonthly)} / month {rate.subscription==='annual-billed'?'(annual billing)':''}</small>:null}
    {rate.billing==='per-second'?<small>{t[17]}: {rate.currency} {rate.perSecond} / sec{rate.chargesInputVideo?' · '+t[9]+' included':''}</small>:null}
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
