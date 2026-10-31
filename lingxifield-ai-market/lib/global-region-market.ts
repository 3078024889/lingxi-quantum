import type {Language} from './v2';
import {officialCountrySnapshot,officialSupportCountries} from './official-country-lists';

/**
 * Region & payment facts are GLOBAL and product-specific, never derived from UI locale.
 * "supported" = documented publisher policy; "reachable" requires a separate country test.
 * Unlisted is NOT "blocked"; absent source is explicitly unknown.
 */
export type RegionCode='GLOBAL'|'CN'|'US'|'SG'|'JP'|'KR'|'FR'|'DE'|'ES'|'PT'|'GB'|'AE'|'CA'|'AU'|'IN'|'BR'|'ID'|'PH'|'VN';
export const REGIONS:RegionCode[]=['GLOBAL','CN','US','SG','JP','KR','FR','DE','ES','PT','GB','AE','CA','AU','IN','BR'];
// ISO 3166-1 alpha-2 countries/territories. This is a picker, NOT proof of service availability.
export const ALL_REGIONS:RegionCode[]=['GLOBAL',...new Set([...REGIONS.filter(r=>r!=='GLOBAL'),...('AW,AF,AO,AI,AX,AL,AD,AE,AR,AM,AS,AQ,TF,AG,AU,AT,AZ,BI,BE,BJ,BQ,BF,BD,BG,BH,BS,BA,BL,BY,BZ,BM,BO,BR,BB,BN,BT,BV,BW,CF,CA,CC,CH,CL,CN,CI,CM,CD,CG,CK,CO,KM,CV,CR,CU,CW,CX,KY,CY,CZ,DE,DJ,DM,DK,DO,DZ,EC,EG,ER,EH,ES,EE,ET,FI,FJ,FK,FR,FO,FM,GA,GB,GE,GG,GH,GI,GN,GP,GM,GW,GQ,GR,GD,GL,GT,GF,GU,GY,HK,HM,HN,HR,HT,HU,ID,IM,IN,IO,IE,IR,IQ,IS,IL,IT,JM,JE,JO,JP,KZ,KE,KG,KH,KI,KN,KR,KW,LA,LB,LR,LY,LC,LI,LK,LS,LT,LU,LV,MO,MF,MA,MC,MD,MG,MV,MX,MH,MK,ML,MT,MM,ME,MN,MP,MZ,MR,MS,MQ,MU,MW,MY,YT,NA,NC,NE,NF,NG,NI,NU,NL,NO,NP,NR,NZ,OM,PK,PA,PN,PE,PH,PW,PG,PL,PR,KP,PT,PY,PS,PF,QA,RE,RO,RU,RW,SA,SD,SN,SG,GS,SH,SJ,SB,SL,SV,SM,SO,PM,RS,SS,ST,SR,SK,SI,SE,SZ,SX,SC,SY,TC,TD,TG,TH,TJ,TK,TM,TL,TO,TT,TN,TR,TV,TW,TZ,UG,UA,UM,UY,US,UZ,VA,VC,VE,VG,VI,VN,VU,WF,WS,YE,ZA,ZM,ZW'.split(',') as RegionCode[])])];
export type RegionStatus='supported'|'unsupported'|'conditional'|'unknown'|'local';
export type RegionVerdict={status:RegionStatus;source?:string;checkedAt?:string;note?:string;reachability:'not_tested'};
export type MarketRegionFact={policy:RegionVerdict;payments:{methods:string[];source?:string;note?:string;checkedAt?:string;scope?:string}};
export const MARKET_REGION_COPY:Record<Language,{
 region:string;global:string;availability:string;payment:string;scope:string;source:string;
 status:Record<RegionStatus,string>;untested:string;mainland:string;note:string;access:string;
 card:string;bank:string;store:string;market:string;}> = {
 zh:{region:'查看国家/地区',global:'全球概览',availability:'官方地区政策',payment:'支持的付款渠道',scope:'支付适用范围',source:'官方出处',status:{supported:'官网列为支持',unsupported:'官网名单未包含此地区',conditional:'仅特定服务或账号支持',unknown:'官网未提供可确认的地区名单',local:'可在本地运行'},untested:'实际网络直连尚未独立实测',mainland:'中国大陆',note:'界面语言不等于所在地区；可切换国家查看。',access:'用户是否可用',card:'信用卡/借记卡',bank:'本地银行转账',store:'应用商店结算',market:'具体以国家、入口和套餐为准'},
 en:{region:'Country / region',global:'Global overview',availability:'Official availability policy',payment:'Accepted payment methods',scope:'Payment scope',source:'Publisher source',status:{supported:'Listed by publisher',unsupported:'Not listed as supported',conditional:'Supported for specific services',unknown:'No confirmed publisher region list',local:'Can run locally'},untested:'Direct network reachability not independently tested',mainland:'Mainland China',note:'Interface language is separate from your location. Choose any region.',access:'Availability',card:'Credit / debit card',bank:'Local bank debit',store:'App store billing',market:'Depends on country, channel and plan'},
 ja:{region:'国・地域',global:'世界全体',availability:'公式提供地域',payment:'決済方法',scope:'決済の対象',source:'公式出典',status:{supported:'公式に対応',unsupported:'公式対応地域に未掲載',conditional:'条件付き対応',unknown:'公式の地域一覧は未公開',local:'ローカルでオフライン利用'},untested:'直接接続は未検証',mainland:'中国本土',note:'表示言語と居住地域は別です。国を選択できます。',access:'利用可能性',card:'クレジット／デビットカード',bank:'銀行引落',store:'アプリストア決済',market:'国・購入経路・プランによって異なります'},
 ko:{region:'국가 / 지역',global:'전 세계',availability:'공식 지원 지역',payment:'결제 수단',scope:'결제 조건',source:'공식 출처',status:{supported:'공식 지원',unsupported:'공식 지원 목록에 없음',conditional:'조건부 지원',unknown:'지역 정보 미확인',local:'로컬 오프라인 실행'},untested:'직접 네트워크 접속 미검증',mainland:'중국 본토',note:'언어와 국가 선택은 별개입니다.',access:'이용 가능 여부',card:'신용/직불카드',bank:'은행 자동이체',store:'앱 스토어 결제',market:'국가, 경로 및 요금제에 따라 다름'},
 fr:{region:'Pays / région',global:'Vue mondiale',availability:'Disponibilité officielle',payment:'Moyens de paiement',scope:'Conditions de paiement',source:'Source officielle',status:{supported:'Officiellement disponible',unsupported:'Absent de la liste officielle',conditional:'Disponible sous conditions',unknown:'Disponibilité non vérifiée',local:'Exécution locale hors ligne'},untested:'Accès réseau direct non testé',mainland:'Chine continentale',note:'La langue et la région sont indépendantes.',access:'Disponibilité',card:'Carte de crédit / débit',bank:'Prélèvement bancaire',store:'Paiement via boutique mobile',market:'Varie selon pays, canal et forfait'},
 de:{region:'Land / Region',global:'Weltweit',availability:'Offizielle Verfügbarkeit',payment:'Zahlungsarten',scope:'Zahlungsbedingungen',source:'Offizielle Quelle',status:{supported:'Offiziell unterstützt',unsupported:'Nicht in der offiziellen Liste',conditional:'Bedingt verfügbar',unknown:'Region nicht verifiziert',local:'Lokal offline nutzbar'},untested:'Direkter Netzwerkzugang nicht geprüft',mainland:'Festlandchina',note:'Sprache und Region werden unabhängig gewählt.',access:'Verfügbarkeit',card:'Kredit- / Debitkarte',bank:'Bankeinzug',store:'App-Store-Abrechnung',market:'Abhängig von Land, Kanal und Tarif'},
 es:{region:'País / región',global:'Vista global',availability:'Disponibilidad oficial',payment:'Métodos de pago',scope:'Condiciones de pago',source:'Fuente oficial',status:{supported:'Oficialmente disponible',unsupported:'No figura entre regiones admitidas',conditional:'Disponible con condiciones',unknown:'Región sin verificar',local:'Funciona sin conexión localmente'},untested:'Acceso directo a la red sin probar',mainland:'China continental',note:'Idioma y país son opciones independientes.',access:'Disponibilidad',card:'Tarjeta de crédito / débito',bank:'Débito bancario',store:'Pago en tienda de aplicaciones',market:'Depende del país, canal y plan'},
 pt:{region:'País / região',global:'Visão global',availability:'Disponibilidade oficial',payment:'Métodos de pagamento',scope:'Condições de pagamento',source:'Fonte oficial',status:{supported:'Oficialmente disponível',unsupported:'Fora da lista oficial',conditional:'Disponível sob condições',unknown:'Lista oficial de regiões indisponível',local:'Uso local offline'},untested:'Acesso direto à rede não testado',mainland:'China continental',note:'Idioma e região são independentes.',access:'Disponibilidade',card:'Cartão de crédito / débito',bank:'Débito bancário',store:'Pagamento pela loja de apps',market:'Depende do país, canal e plano'},
 ar:{region:'البلد / المنطقة',global:'نظرة عالمية',availability:'التوفر الرسمي',payment:'طرق الدفع',scope:'شروط الدفع',source:'المصدر الرسمي',status:{supported:'مدعوم رسميًا',unsupported:'غير مدرج ضمن المناطق المدعومة',conditional:'متاح بشروط',unknown:'المنطقة غير موثقة',local:'يعمل محليًا دون اتصال'},untested:'لم يُختبر الاتصال المباشر بالشبكة',mainland:'الصين القارية',note:'لغة الواجهة مستقلة عن البلد المختار.',access:'التوفر',card:'بطاقة ائتمان أو خصم',bank:'خصم مصرفي',store:'الدفع عبر متجر التطبيقات',market:'حسب البلد والقناة والخطة'}
};
export function regionName(country:RegionCode,lang:Language){
 if(country==='GLOBAL')return MARKET_REGION_COPY[lang].global;
 const langTag:Record<Language,string>={zh:'zh-Hans',en:'en',ja:'ja',ko:'ko',fr:'fr',de:'de',es:'es',pt:'pt',ar:'ar'};
 try {return new Intl.DisplayNames([langTag[lang]],{type:'region'}).of(country)||country;}catch{return country;}
}
const stamp='2026-10-30';
const OPENAI_REGIONS='https://help.openai.com/en/articles/7947663-chatgpt-supported-countries';
const OPENAI_PAY='https://help.openai.com/en/articles/10421635-which-payment-methods-are-supported-for-chatgpt';
const CLAUDE_REGIONS='https://support.claude.com/en/articles/8461763-where-can-i-access-claude';
const CLAUDE_PAY='https://support.claude.com/en/articles/8325618-paid-plan-billing-faqs';
const RUNWAY_PAY='https://help.runwayml.com/hc/en-us/articles/30657959470483-What-payment-methods-are-available';
const GEMINI_REGIONS='https://support.google.com/gemini/answer/13575153?hl=en';
const unsupported=(source:string):RegionVerdict=>({status:'unsupported',source,checkedAt:stamp,reachability:'not_tested'});
const unknown:RegionVerdict={status:'unknown',reachability:'not_tested'};
const local:RegionVerdict={status:'local',reachability:'not_tested'};
type AccessConfig={countries:Record<string,RegionVerdict>;globalPolicy?:RegionVerdict;paymentSource?:string;payments?:string[];paymentsByRegion?:Record<string,string[]>;paymentNote?:string;paymentScope?:string};
const ACCESS:Record<string,AccessConfig>={
 chatgpt:{
  countries:{},
  paymentSource:OPENAI_PAY,payments:['Credit / debit card','Apple App Store (mobile)','Google Play (mobile)'],
  paymentScope:'Web checkout: card. Mobile purchases: Apple / Google storefront, subject to local eligibility.',
  paymentsByRegion:{KR:['Kakao Pay','Naver Pay','Korean local cards'],IN:['UPI (Go / Plus only)'],BR:['Pix (Go / Plus / Pro)'],ID:['GoPay (Go / Plus / Pro)'],PH:['GCash (Go / Plus / Pro)'],VN:['MoMo (web checkout: Go / Plus / Pro)'],GB:['Bank debit through Link (where available)'],FR:['Bank debit through Link (where available)'],DE:['Bank debit through Link (where available)'],ES:['Bank debit through Link (where available)'],PT:['Bank debit through Link (where available)'],US:['ChatGPT wallet balance (eligible US purchases)']}
 },
 claude:{
  countries:{},
  paymentSource:CLAUDE_PAY,payments:['Credit / debit card (web)','Apple App Store (iOS)','Google Play (Android)'],
  paymentScope:'Web subscriptions: cards only; mobile methods determined by Apple or Google stores.'
 },
 midjourney:{countries:{},globalPolicy:unknown,
  paymentSource:'https://docs.midjourney.com/hc/en-us/articles/27868831972365-Accepted-Payment-Methods',
  payments:['Visa','Mastercard','American Express','Apple Pay','Amazon Pay','Alipay','Google Pay','Link'],
  paymentScope:'Stripe checkout: cards broadly offered; wallets only where shown. PayPal NOT accepted.',
  paymentNote:'Digital wallets vary by region/checkout; PayPal is not accepted.'
 },
 runway:{countries:{},globalPolicy:unknown,paymentSource:RUNWAY_PAY,
  payments:['Credit / debit card','Amazon Pay','Apple Pay','Google Pay','Alipay','Cash App Pay','WeChat Pay'],
  paymentsByRegion:{US:['Stripe Instant Bank Payments (US only)']},
  paymentNote:'Publisher lists payment methods globally; not all methods are available in every country.',
  paymentScope:'Stripe checkout, availability differs by country.'
 },
 gemini:{countries:{CN:{status:'conditional',source:GEMINI_REGIONS,checkedAt:stamp,note:'Mainland China: Workspace only on Gemini web app; consumer availability is not implied.',reachability:'not_tested'}},paymentNote:'Gemini web, mobile, Workspace and Google One have different regional conditions.'},
 comfyui:{globalPolicy:local,countries:Object.fromEntries(REGIONS.filter(x=>x!=='GLOBAL').map(r=>[r,local])) as Record<string,RegionVerdict>,paymentNote:'Local open-source software; cloud hosting, paid model licenses and network downloads are separate.'},
 ollama:{globalPolicy:local,countries:Object.fromEntries(REGIONS.filter(x=>x!=='GLOBAL').map(r=>[r,local])) as Record<string,RegionVerdict>,paymentNote:'Local engine; specific model licenses, cloud access and initial downloads differ.'}
};
export function globalRegionFact(id:string,region:RegionCode):MarketRegionFact{
 const p=ACCESS[id];
 const official=officialCountrySnapshot(id);
 const recorded=official&&region!=='GLOBAL'&&(
  official.countries.has(region)||!('isComplete' in official)||official.isComplete!==false
 )?{
  status:official.countries.has(region)?'supported' as const:'unsupported' as const,
  source:official.source,checkedAt:official.checkedAt,reachability:'not_tested' as const,
  note:'productScope' in official?String(official.productScope):undefined
 }:undefined;
 const policy=region==='GLOBAL'?{status:'unknown',reachability:'not_tested'} as RegionVerdict:p?.countries[region]||recorded||p?.globalPolicy||unknown;
 const isUnsupported=policy.status==='unsupported';
 const methods=isUnsupported?[]:[...(p?.payments||[]),...(p?.paymentsByRegion?.[region]||[])];
 return {policy,payments:{methods,source:p?.paymentSource,scope:p?.paymentScope,checkedAt:p?.paymentSource?stamp:undefined,note:isUnsupported?'Publisher service not available under this region policy.':p?.paymentNote}};
}
export function regionCopy(lang:Language){return MARKET_REGION_COPY[lang];}

export function completeSupportedRegionList(id:string):string[]{return officialSupportCountries(id);}
