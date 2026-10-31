import type {Platform} from './data';
import type {Language} from './v2';
import type {RegionCode} from './global-region-market';
import {globalRegionFact} from './global-region-market';
import {matchesOfficialPayment} from './market-payment-facts';
import {capabilityProfile} from './capability-profiles';

export type MarketFilter='all'|'free'|'drama'|'video'|'image'|'local'|'code'|'supported'|'commercial';
export const MARKET_FILTERS:MarketFilter[]=['all','supported','free','drama','video','image','local','code','commercial'];
export type MarketSort='directory'|'name'|'free'|'drama';
export type MarketPayment='any'|'card'|'alipay'|'wechat'|'paypal'|'appstore';
export const PAYMENT_LABELS:Record<Language,{label:string;any:string;card:string;alipay:string;wechat:string;paypal:string;appstore:string}>={
 zh:{label:'付款方式',any:'不限支付',card:'银行卡',alipay:'支付宝',wechat:'微信支付',paypal:'PayPal',appstore:'应用商店'},
 en:{label:'Payment',any:'Any payment',card:'Bank card',alipay:'Alipay',wechat:'WeChat Pay',paypal:'PayPal',appstore:'App stores'},
 ja:{label:'決済',any:'指定なし',card:'カード',alipay:'Alipay',wechat:'WeChat Pay',paypal:'PayPal',appstore:'アプリストア'},
 ko:{label:'결제',any:'제한 없음',card:'은행 카드',alipay:'Alipay',wechat:'WeChat Pay',paypal:'PayPal',appstore:'앱 스토어'},
 fr:{label:'Paiement',any:'Tous',card:'Carte bancaire',alipay:'Alipay',wechat:'WeChat Pay',paypal:'PayPal',appstore:'Boutiques mobiles'},
 de:{label:'Zahlung',any:'Beliebig',card:'Bankkarte',alipay:'Alipay',wechat:'WeChat Pay',paypal:'PayPal',appstore:'App Stores'},
 es:{label:'Pago',any:'Cualquiera',card:'Tarjeta',alipay:'Alipay',wechat:'WeChat Pay',paypal:'PayPal',appstore:'Tiendas móviles'},
 pt:{label:'Pagamento',any:'Qualquer',card:'Cartão',alipay:'Alipay',wechat:'WeChat Pay',paypal:'PayPal',appstore:'Lojas de apps'},
 ar:{label:'الدفع',any:'كل الوسائل',card:'بطاقة مصرفية',alipay:'Alipay',wechat:'WeChat Pay',paypal:'PayPal',appstore:'متجر التطبيقات'}
};
type Copy={filters:Record<MarketFilter,string>;sorts:Record<MarketSort,string>;filterLabel:string;sortLabel:string;regionHint:string;dramaYes:string;dramaUnknown:string;source:string;more:string;noMatch:string;footnote:string;reviews:string;payment:string;models:string;business:string;uses:string;};
export const MARKET_SCREEN_COPY:Record<Language,Copy>={
 zh:{filters:{all:'全部产品',supported:'本地区官方支持',free:'有免费试用',drama:'短剧 / 短视频',video:'视频创作',image:'图片创作',local:'本地模型',code:'编程开发',commercial:'商用说明可查'},sorts:{directory:'目录顺序',name:'按名称',free:'免费优先',drama:'短剧能力优先'},filterLabel:'快捷筛选',sortLabel:'排序',regionHint:'先选择所在国家，查看当地官方支持政策',dramaYes:'有短剧创作能力',dramaUnknown:'尚未收录连续短剧方案',source:'官网资料',more:'查看详情',noMatch:'当前范围没有符合这些条件的工具，请试试其他条件。',footnote:'短剧支持表示厂商公布了相关生成或编辑功能，不等于已经实测成片质量、角色一致性和成本。',reviews:'真实体验',payment:'登录 / 付款',models:'代表模型',business:'商用',uses:'最擅长'},
 en:{filters:{all:'All tools',supported:'Supported here',free:'Free option',drama:'AI short films',video:'AI video',image:'AI images',local:'Local models',code:'Coding tools',commercial:'Commercial terms'},sorts:{directory:'Directory order',name:'Name',free:'Free first',drama:'Short-film capable first'},filterLabel:'Quick filters',sortLabel:'Sort',regionHint:'Choose your country to see official availability',dramaYes:'Short-film workflow',dramaUnknown:'No documented multi-scene workflow yet',source:'Publisher evidence',more:'Details',noMatch:'No matches for the selected filters.',footnote:'Short-film capability is based on publisher-described features, not independent quality or cost testing.',reviews:'User experiences',payment:'Login / payment',models:'Models',business:'Commercial',uses:'Strengths'},
 ja:{filters:{all:'すべて',supported:'地域対応',free:'無料プラン',drama:'短編動画',video:'AI動画',image:'AI画像',local:'ローカル',code:'開発ツール',commercial:'商用規定'},sorts:{directory:'一覧順',name:'名前順',free:'無料優先',drama:'動画優先'},filterLabel:'絞り込み',sortLabel:'並び替え',regionHint:'国を選んで公式提供地域を確認',dramaYes:'短編動画制作',dramaUnknown:'複数シーン制作は未収録',source:'公式資料',more:'詳細',noMatch:'該当する製品はありません。',footnote:'動画制作能力は公式資料に基づき、品質や費用の独立検証ではありません。',reviews:'利用者の声',payment:'登録と決済',models:'モデル',business:'商用',uses:'特長'},
 ko:{filters:{all:'전체',supported:'지역 지원',free:'무료 이용',drama:'AI 단편 영상',video:'AI 영상',image:'AI 이미지',local:'로컬 모델',code:'개발',commercial:'상업 이용'},sorts:{directory:'목록 순서',name:'이름',free:'무료 우선',drama:'단편 영상 우선'},filterLabel:'빠른 필터',sortLabel:'정렬',regionHint:'국가를 선택해 공식 지원 여부를 확인',dramaYes:'단편 영상 제작',dramaUnknown:'다중 장면 작업 흐름 미수록',source:'공식 출처',more:'상세',noMatch:'일치하는 도구가 없습니다.',footnote:'영상 제작 지원은 회사 자료 기준이며 품질·비용 실측은 아닙니다.',reviews:'사용자 경험',payment:'로그인·결제',models:'모델',business:'상업용',uses:'강점'},
 fr:{filters:{all:'Tous',supported:'Disponible ici',free:'Offre gratuite',drama:'Courts-métrages IA',video:'Vidéo IA',image:'Images IA',local:'Modèles locaux',code:'Développement',commercial:'Usage commercial'},sorts:{directory:'Ordre du catalogue',name:'Nom',free:'Gratuit d’abord',drama:'Vidéo d’abord'},filterLabel:'Filtres rapides',sortLabel:'Tri',regionHint:'Choisissez votre pays pour vérifier la disponibilité',dramaYes:'Création de courts métrages',dramaUnknown:'Workflow multi-scènes non recensé',source:'Source éditeur',more:'Détails',noMatch:'Aucun résultat pour ces filtres.',footnote:'Les capacités vidéo proviennent des éditeurs, sans test indépendant de qualité ni de coût.',reviews:'Avis',payment:'Accès / paiement',models:'Modèles',business:'Commercial',uses:'Atouts'},
 de:{filters:{all:'Alle',supported:'Hier unterstützt',free:'Kostenlos',drama:'KI-Kurzfilme',video:'KI-Video',image:'KI-Bilder',local:'Lokale Modelle',code:'Entwicklung',commercial:'Kommerzielle Nutzung'},sorts:{directory:'Katalog',name:'Name',free:'Gratis zuerst',drama:'Film zuerst'},filterLabel:'Schnellfilter',sortLabel:'Sortierung',regionHint:'Land auswählen, um offizielle Verfügbarkeit zu prüfen',dramaYes:'Kurzfilm-Erstellung',dramaUnknown:'Mehrszenen-Ablauf noch nicht erfasst',source:'Anbieterquelle',more:'Details',noMatch:'Keine passenden Tools.',footnote:'Videoangaben basieren auf Herstellerquellen, nicht auf unabhängigen Qualitäts- oder Kostentests.',reviews:'Erfahrungen',payment:'Login / Zahlung',models:'Modelle',business:'Gewerblich',uses:'Stärken'},
 es:{filters:{all:'Todas',supported:'Disponibles aquí',free:'Opción gratis',drama:'Cortos con IA',video:'Vídeo IA',image:'Imágenes IA',local:'Modelos locales',code:'Desarrollo',commercial:'Uso comercial'},sorts:{directory:'Orden del catálogo',name:'Nombre',free:'Gratis primero',drama:'Cortos primero'},filterLabel:'Filtros rápidos',sortLabel:'Ordenar',regionHint:'Elige tu país para comprobar disponibilidad',dramaYes:'Creación de cortos',dramaUnknown:'Sin datos verificados',source:'Fuente oficial',more:'Detalles',noMatch:'No hay coincidencias.',footnote:'Las funciones de vídeo son declaraciones del proveedor, no pruebas independientes de calidad o coste.',reviews:'Experiencias',payment:'Acceso / pago',models:'Modelos',business:'Comercial',uses:'Ventajas'},
 pt:{filters:{all:'Todas',supported:'Disponível aqui',free:'Opção grátis',drama:'Curtas com IA',video:'Vídeo IA',image:'Imagens IA',local:'Modelos locais',code:'Desenvolvimento',commercial:'Uso comercial'},sorts:{directory:'Ordem do catálogo',name:'Nome',free:'Grátis primeiro',drama:'Curtas primeiro'},filterLabel:'Filtros rápidos',sortLabel:'Ordenar',regionHint:'Selecione seu país para verificar disponibilidade',dramaYes:'Criação de curtas',dramaUnknown:'Fluxo de várias cenas não catalogado',source:'Fonte oficial',more:'Detalhes',noMatch:'Nenhum resultado.',footnote:'Capacidades de vídeo são descritas pelo fornecedor, sem teste independente de qualidade ou custo.',reviews:'Experiências',payment:'Acesso / pagamento',models:'Modelos',business:'Comercial',uses:'Destaques'},
 ar:{filters:{all:'جميع الأدوات',supported:'متاح في بلدي',free:'خيار مجاني',drama:'أفلام قصيرة بالذكاء الاصطناعي',video:'فيديو AI',image:'صور AI',local:'نماذج محلية',code:'برمجة',commercial:'استخدام تجاري'},sorts:{directory:'ترتيب الدليل',name:'الاسم',free:'المجاني أولاً',drama:'الأفلام أولاً'},filterLabel:'تصفية سريعة',sortLabel:'الترتيب',regionHint:'اختر بلدك لمعرفة التوفر الرسمي',dramaYes:'إنشاء أفلام قصيرة',dramaUnknown:'غير موثق',source:'المصدر الرسمي',more:'التفاصيل',noMatch:'لا توجد نتائج مطابقة.',footnote:'قدرات الفيديو من وثائق الشركات وليست اختبارًا مستقلًا للجودة أو التكلفة.',reviews:'تجارب المستخدمين',payment:'الدخول / الدفع',models:'النماذج',business:'تجاري',uses:'المزايا'}
};

const videoSource:Readonly<Record<string,string>>={
 kling:'https://ir.kuaishou.com/zh-hans/news-releases/news-release-details/kelingaixinyidaimoxingklin1g-40zhengshishangxian/',
 jimeng:'https://jimeng.jianying.com/',
 runway:'https://runwayml.com/',
 luma:'https://lumalabs.ai/news/ray3-modify',
 grok:'https://x.ai/grok/use-cases/video-generation',
 gemini:'https://ai.google.dev/gemini-api/docs/video',
 qwen:'https://help.aliyun.com/zh/model-studio/wan3-video-generation-guide',
 doubao:'https://seed.bytedance.com/zh/blog/official-launch-of-seedance-2-0'
};
// Evidence of video/storyboard/clip generation is not evidence of a full-feature film maker.
// Unknown does NOT mean that a platform categorically cannot make films.
export function shortDramaEvidence(id:string){return videoSource[id]||null;}
const filmFacts:Record<string,Record<Language,string>>={
 kling:{zh:'Kling 4.0 · 单段最长30秒 · 最多10关键帧',en:'Kling 4.0 · Up to 30s · 10 keyframes',ja:'Kling 4.0 · 最長30秒 · 10キーフレーム',ko:'Kling 4.0 · 최대 30초 · 키프레임 10개',fr:'Kling 4.0 · 30 s max · 10 images clés',de:'Kling 4.0 · Max. 30 s · 10 Keyframes',es:'Kling 4.0 · Hasta 30 s · 10 fotogramas clave',pt:'Kling 4.0 · Até 30 s · 10 quadros-chave',ar:'Kling 4.0 · حتى 30 ثانية · 10 إطارات رئيسية'},
 runway:{zh:'Gen-4：单段5或10秒 · 按秒消耗积分',en:'Gen-4: 5 or 10s clips · credits per second',ja:'Gen-4：5秒または10秒・秒単位のクレジット',ko:'Gen-4: 5초 또는 10초 · 초당 크레딧',fr:'Gen-4 : clips de 5 ou 10 s · crédits/s',de:'Gen-4: 5 oder 10 s · Credits pro Sekunde',es:'Gen-4: 5 o 10 s · créditos por segundo',pt:'Gen-4: 5 ou 10 s · créditos por segundo',ar:'Gen-4: مقاطع 5 أو 10 ثوانٍ · رصيد لكل ثانية'},
 luma:{zh:'Ray3 Modify：参考视频修改 · 角色与镜头控制',en:'Ray3 Modify: video edits · character and shot control',ja:'Ray3 Modify：動画編集と人物・撮影制御',ko:'Ray3 Modify: 영상 수정과 캐릭터·샷 제어',fr:'Ray3 Modify : montage et contrôle des plans',de:'Ray3 Modify: Videobearbeitung und Szenenkontrolle',es:'Ray3 Modify: edición y control de escenas',pt:'Ray3 Modify: edição e controle de cenas',ar:'Ray3 Modify: تعديل الفيديو والتحكم بالمشاهد'},
 jimeng:{zh:'参考首尾帧 · 镜头与人物画面控制',en:'Start/end frames · shot and subject reference',ja:'開始・終了フレームと人物・カメラ制御',ko:'첫·끝 프레임 · 샷·피사체 참조',fr:'Images de début/fin · références de plan',de:'Start-/Endframes · Kamera- und Figurensteuerung',es:'Fotogramas inicial/final · control de escenas',pt:'Quadros inicial/final · controle de cenas',ar:'إطارات البداية والنهاية · التحكم بالمشاهد'},
 grok:{"zh":"Grok Imagine · 文字/图片生成短片 · 运镜与比例控制","en":"Grok Imagine · Text/image to short video · Camera & aspect controls","ja":"Grok Imagine · テキスト/画像から短編動画 · カメラ制御","ko":"Grok Imagine · 텍스트/이미지로 짧은 영상 · 카메라 제어","fr":"Grok Imagine · Vidéo par texte/image · Contrôle caméra","de":"Grok Imagine · Video aus Text/Bild · Kamerasteuerung","es":"Grok Imagine · Vídeo desde texto/imagen · Control de cámara","pt":"Grok Imagine · Vídeo de texto/imagem · Controle de câmera","ar":"Grok Imagine · فيديو من النص أو الصورة مع تحكم بالكاميرا"},
 gemini:{"zh":"Gemini Omni Flash · 短视频生成/对话编辑 · API 与 App 条件不同","en":"Gemini Omni Flash · Video creation/editing · App/API terms differ","ja":"Gemini Omni Flash · 動画生成/対話編集 · アプリ/API別","ko":"Gemini Omni Flash · 영상 생성/대화 편집 · 앱/API 별도","fr":"Gemini Omni Flash · Vidéo et montage · App et API distinctes","de":"Gemini Omni Flash · Videos und Bearbeitung · App/API getrennt","es":"Gemini Omni Flash · Generación y edición · App/API separados","pt":"Gemini Omni Flash · Vídeo e edição · App/API distintos","ar":"Gemini Omni Flash · إنشاء الفيديو وتحريره · شروط التطبيق وAPI مختلفة"},
 qwen:{"zh":"阿里云百炼万相 3.0 API · 文生/图生视频最长30秒；非千问聊天保证","en":"Alibaba Model Studio Wan 3.0 API · Up to 30s; not Qwen chat entitlement","ja":"阿里雲百錬 Wan3.0 API · 最長30秒 · 千問チャットとは別","ko":"알리바바 Model Studio Wan 3.0 API · 최대30초 · Qwen 채팅과 별도","fr":"API Alibaba Wan 3.0 · Jusqu’à 30 s ; distinct de Qwen Chat","de":"Alibaba Wan 3.0 API · Bis 30 s; nicht Qwen Chat","es":"API Alibaba Wan 3.0 · Hasta 30 s; no implica Qwen Chat","pt":"API Alibaba Wan 3.0 · Até 30 s; separado do chat Qwen","ar":"واجهة Alibaba Wan 3.0 · حتى 30 ثانية · منفصلة عن دردشة Qwen"},
 doubao:{"zh":"豆包 App / Seedance 2.0 · 多模态音视频生成 · 单段15秒","en":"Doubao App / Seedance 2.0 · Multimodal video with audio · 15s","ja":"豆包アプリ/Seedance 2.0 · 音声付き動画生成 · 15秒","ko":"Doubao 앱/Seedance 2.0 · 오디오 포함 영상 · 15초","fr":"Doubao / Seedance 2.0 · Vidéo avec audio · 15 s","de":"Doubao / Seedance 2.0 · Video mit Ton · 15 s","es":"Doubao / Seedance 2.0 · Vídeo con audio · 15 s","pt":"Doubao / Seedance 2.0 · Vídeo com áudio · 15 s","ar":"تطبيق Doubao / Seedance 2.0 · فيديو بالصوت · 15 ثانية"}
};
export function shortDramaSummary(id:string,language:Language){return filmFacts[id]?.[language]||null;}
export function hasFreeOption(p:Platform){
 const text=[p.free,p.guide?.free,p.conditions?.find(x=>x.label==='免费额度')?.text].filter(Boolean).join(' ');
 return /(免费|free|credits|试用|no cost|gratuit|grátis)/i.test(text)
   &&!/(不提供免费|没有免费|无免费套餐|no free plan)/i.test(text);
}
export function matchesMarketFilter(p:Platform,filter:MarketFilter,country:RegionCode):boolean{
 if(filter==='all')return true;
 if(filter==='supported')return country!=='GLOBAL'&&['supported','local'].includes(globalRegionFact(p.id,country).policy.status);
 if(filter==='free')return hasFreeOption(p);
 if(filter==='drama')return Boolean(shortDramaEvidence(p.id));
 if(filter==='video')return p.category.includes('视频')||Boolean(shortDramaEvidence(p.id));
 if(filter==='image')return /图片|图像/.test(p.category)||p.features.some(x=>/图片生成|图像生成|image generation/i.test(x));
 if(filter==='local')return p.websiteKind==='repository'&&/llama|ollama|webui|transformers|comfyui|vllm/i.test(p.id);
 if(filter==='code')return /编程|开发|代码/.test(p.category)||p.features.some(x=>/编程|代码/.test(x));
 if(filter==='commercial')return Boolean(p.conditions?.find(x=>x.label==='商用条件')?.source);
 return true;
}
export function matchesMarketPayment(p:Platform,payment:MarketPayment,country:RegionCode){
 if(payment==='any')return true;
 return matchesOfficialPayment(p.id,payment,country);
}

export function compareMarketSort(a:Platform,b:Platform,sort:MarketSort){
 return sort==='name'?a.name.localeCompare(b.name):
 sort==='free'?Number(hasFreeOption(b))-Number(hasFreeOption(a)):
 sort==='drama'?Number(Boolean(shortDramaEvidence(b.id)))-Number(Boolean(shortDramaEvidence(a.id))):0;
}
export function filterAndSortMarket(p:Platform[],filter:MarketFilter,sort:MarketSort,country:RegionCode,payment:MarketPayment='any'){
 const matches=p.filter(x=>matchesMarketFilter(x,filter,country)&&matchesMarketPayment(x,payment,country));
 if(sort==='directory')return matches;
 return [...matches].sort((a,b)=>compareMarketSort(a,b,sort));
}
export function summaryFor(p:Platform){
 const rich=capabilityProfile(p.id);
 return {headline:rich?.headline||p.guide?.strengths||p.about,capabilities:rich?.capabilities.slice(0,3).map(x=>x.name).join(' · ')||p.features.slice(0,3).join(' · '),source:rich?.capabilities[0]?.source||p.guide?.source||p.source};
}
