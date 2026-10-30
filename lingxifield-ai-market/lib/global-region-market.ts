import type {Language} from './v2';

/**
 * Region & payment facts are GLOBAL and product-specific, never derived from UI locale.
 * "supported" = documented publisher policy; "reachable" requires a separate country test.
 * Unlisted is NOT "blocked"; absent source is explicitly unknown.
 */
export type RegionCode='GLOBAL'|'CN'|'US'|'SG'|'JP'|'KR'|'FR'|'DE'|'ES'|'PT'|'GB'|'AE'|'CA'|'AU'|'IN'|'BR';
export const REGIONS:RegionCode[]=['GLOBAL','CN','US','SG','JP','KR','FR','DE','ES','PT','GB','AE','CA','AU','IN','BR'];
export type RegionStatus='supported'|'unsupported'|'conditional'|'unknown'|'local';
export type RegionVerdict={status:RegionStatus;source?:string;checkedAt?:string;note?:string;reachability:'not_tested'};
export type MarketRegionFact={policy:RegionVerdict;payments:{methods:string[];source?:string;note?:string;checkedAt?:string;scope?:string}};
export const MARKET_REGION_COPY:Record<Language,{
 region:string;global:string;availability:string;payment:string;scope:string;source:string;
 status:Record<RegionStatus,string>;untested:string;mainland:string;note:string;access:string;
 card:string;bank:string;store:string;market:string;}> = {
 zh:{region:'查看国家/地区',global:'全球概览',availability:'官方地区政策',payment:'支持的付款渠道',scope:'支付适用范围',source:'官方出处',status:{supported:'官方支持',unsupported:'未列入官方支持范围',conditional:'部分条件下支持',unknown:'缺乏可验证的地区结论',local:'本地离线运行'},untested:'实际网络直连尚未独立实测',mainland:'中国大陆',note:'界面语言不等于所在地区；可切换国家查看。',access:'用户是否可用',card:'信用卡/借记卡',bank:'本地银行转账',store:'应用商店结算',market:'具体以国家、入口和套餐为准'},
 en:{region:'Country / region',global:'Global overview',availability:'Official availability policy',payment:'Accepted payment methods',scope:'Payment scope',source:'Publisher source',status:{supported:'Officially supported',unsupported:'Not in the publisher’s supported list',conditional:'Supported under conditions',unknown:'No verified region decision',local:'Runs locally offline'},untested:'Direct network reachability not independently tested',mainland:'Mainland China',note:'Interface language is separate from your location. Choose any region.',access:'Availability',card:'Credit / debit card',bank:'Local bank debit',store:'App store billing',market:'Depends on country, channel and plan'},
 ja:{region:'国・地域',global:'世界全体',availability:'公式提供地域',payment:'決済方法',scope:'決済の対象',source:'公式出典',status:{supported:'公式に対応',unsupported:'公式対応地域に未掲載',conditional:'条件付き対応',unknown:'地域情報未確認',local:'ローカルでオフライン利用'},untested:'直接接続は未検証',mainland:'中国本土',note:'表示言語と居住地域は別です。国を選択できます。',access:'利用可能性',card:'クレジット／デビットカード',bank:'銀行引落',store:'アプリストア決済',market:'国・購入経路・プランによって異なります'},
 ko:{region:'국가 / 지역',global:'전 세계',availability:'공식 지원 지역',payment:'결제 수단',scope:'결제 조건',source:'공식 출처',status:{supported:'공식 지원',unsupported:'공식 지원 목록에 없음',conditional:'조건부 지원',unknown:'지역 정보 미확인',local:'로컬 오프라인 실행'},untested:'직접 네트워크 접속 미검증',mainland:'중국 본토',note:'언어와 국가 선택은 별개입니다.',access:'이용 가능 여부',card:'신용/직불카드',bank:'은행 자동이체',store:'앱 스토어 결제',market:'국가, 경로 및 요금제에 따라 다름'},
 fr:{region:'Pays / région',global:'Vue mondiale',availability:'Disponibilité officielle',payment:'Moyens de paiement',scope:'Conditions de paiement',source:'Source officielle',status:{supported:'Officiellement disponible',unsupported:'Absent de la liste officielle',conditional:'Disponible sous conditions',unknown:'Disponibilité non vérifiée',local:'Exécution locale hors ligne'},untested:'Accès réseau direct non testé',mainland:'Chine continentale',note:'La langue et la région sont indépendantes.',access:'Disponibilité',card:'Carte de crédit / débit',bank:'Prélèvement bancaire',store:'Paiement via boutique mobile',market:'Varie selon pays, canal et forfait'},
 de:{region:'Land / Region',global:'Weltweit',availability:'Offizielle Verfügbarkeit',payment:'Zahlungsarten',scope:'Zahlungsbedingungen',source:'Offizielle Quelle',status:{supported:'Offiziell unterstützt',unsupported:'Nicht in der offiziellen Liste',conditional:'Bedingt verfügbar',unknown:'Region nicht verifiziert',local:'Lokal offline nutzbar'},untested:'Direkter Netzwerkzugang nicht geprüft',mainland:'Festlandchina',note:'Sprache und Region werden unabhängig gewählt.',access:'Verfügbarkeit',card:'Kredit- / Debitkarte',bank:'Bankeinzug',store:'App-Store-Abrechnung',market:'Abhängig von Land, Kanal und Tarif'},
 es:{region:'País / región',global:'Vista global',availability:'Disponibilidad oficial',payment:'Métodos de pago',scope:'Condiciones de pago',source:'Fuente oficial',status:{supported:'Oficialmente disponible',unsupported:'No figura entre regiones admitidas',conditional:'Disponible con condiciones',unknown:'Región sin verificar',local:'Funciona sin conexión localmente'},untested:'Acceso directo a la red sin probar',mainland:'China continental',note:'Idioma y país son opciones independientes.',access:'Disponibilidad',card:'Tarjeta de crédito / débito',bank:'Débito bancario',store:'Pago en tienda de aplicaciones',market:'Depende del país, canal y plan'},
 pt:{region:'País / região',global:'Visão global',availability:'Disponibilidade oficial',payment:'Métodos de pagamento',scope:'Condições de pagamento',source:'Fonte oficial',status:{supported:'Oficialmente disponível',unsupported:'Fora da lista oficial',conditional:'Disponível sob condições',unknown:'Região não verificada',local:'Uso local offline'},untested:'Acesso direto à rede não testado',mainland:'China continental',note:'Idioma e região são independentes.',access:'Disponibilidade',card:'Cartão de crédito / débito',bank:'Débito bancário',store:'Pagamento pela loja de apps',market:'Depende do país, canal e plano'},
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
const REGULAR=REGIONS.filter(x=>!['GLOBAL','CN'].includes(x));
const accepted=(source:string):Record<string,RegionVerdict>=>Object.fromEntries(REGULAR.map(r=>[r,{status:'supported',source,checkedAt:stamp,reachability:'not_tested'}])) as Record<string,RegionVerdict>;
const unsupported=(source:string):RegionVerdict=>({status:'unsupported',source,checkedAt:stamp,reachability:'not_tested'});
const unknown:RegionVerdict={status:'unknown',reachability:'not_tested'};
const local:RegionVerdict={status:'local',reachability:'not_tested'};
type AccessConfig={countries:Record<string,RegionVerdict>;globalPolicy?:RegionVerdict;paymentSource?:string;payments?:string[];paymentsByRegion?:Partial<Record<RegionCode,string[]>>;paymentNote?:string;paymentScope?:string};
const ACCESS:Record<string,AccessConfig>={
 chatgpt:{
  countries:{...accepted(OPENAI_REGIONS),CN:unsupported(OPENAI_REGIONS)},
  paymentSource:OPENAI_PAY,payments:['Credit / debit card','Apple App Store (mobile)','Google Play (mobile)'],
  paymentScope:'Web checkout: card. Mobile purchases: Apple / Google storefront, subject to local eligibility.',
  paymentsByRegion:{KR:['Kakao Pay','Naver Pay','Korean local cards'],IN:['UPI (Go / Plus only)'],BR:['Pix (Go / Plus / Pro)'],GB:['Bank debit through Link (where available)'],FR:['Bank debit through Link (where available)'],DE:['Bank debit through Link (where available)'],ES:['Bank debit through Link (where available)'],PT:['Bank debit through Link (where available)'],US:['ChatGPT wallet balance (eligible US purchases)']}
 },
 claude:{
  countries:{...accepted(CLAUDE_REGIONS),CN:unsupported(CLAUDE_REGIONS)},
  paymentSource:CLAUDE_PAY,payments:['Credit / debit card (web)','Apple App Store (iOS)','Google Play (Android)'],
  paymentScope:'Web subscriptions: cards only; mobile methods determined by Apple or Google stores.'
 },
 runway:{countries:{},globalPolicy:unknown,paymentSource:RUNWAY_PAY,
  payments:['Credit / debit card','Amazon Pay','Apple Pay','Google Pay','Alipay','Cash App Pay','WeChat Pay'],
  paymentsByRegion:{US:['Stripe Instant Bank Payments (US only)']},
  paymentNote:'Publisher lists payment methods globally; not all methods are available in every country.',
  paymentScope:'Stripe checkout, availability differs by country.'
 },
 gemini:{countries:{...accepted(GEMINI_REGIONS),CN:{status:'conditional',source:GEMINI_REGIONS,checkedAt:stamp,note:'Mainland China: Workspace only on Gemini web app; consumer availability is not implied.',reachability:'not_tested'}},paymentNote:'Gemini web, mobile, Workspace and Google One have different regional conditions.'},
 comfyui:{countries:Object.fromEntries(REGIONS.filter(x=>x!=='GLOBAL').map(r=>[r,local])) as Record<string,RegionVerdict>,paymentNote:'Local open-source software; cloud hosting, paid model licenses and network downloads are separate.'},
 ollama:{countries:Object.fromEntries(REGIONS.filter(x=>x!=='GLOBAL').map(r=>[r,local])) as Record<string,RegionVerdict>,paymentNote:'Local engine; specific model licenses, cloud access and initial downloads differ.'}
};
export function globalRegionFact(id:string,region:RegionCode):MarketRegionFact{
 const p=ACCESS[id];
 const policy=region==='GLOBAL'?{status:'unknown',reachability:'not_tested'} as RegionVerdict:p?.countries[region]||p?.globalPolicy||unknown;
 const isUnsupported=policy.status==='unsupported';
 const methods=isUnsupported?[]:[...(p?.payments||[]),...(p?.paymentsByRegion?.[region]||[])];
 return {policy,payments:{methods,source:p?.paymentSource,scope:p?.paymentScope,checkedAt:p?.paymentSource?stamp:undefined,note:isUnsupported?'Publisher service not available under this region policy.':p?.paymentNote}};
}
export function regionCopy(lang:Language){return MARKET_REGION_COPY[lang];}
