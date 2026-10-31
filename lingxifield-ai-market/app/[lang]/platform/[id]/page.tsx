import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {findPlatform,searchPlatforms} from '../../../../lib/platform-repository';
import {marketLocales,mayIndexMarket,marketCanonicalOrigin,indexableMarketLocales} from '../../../../lib/market-index-policy';
import {researchedFact} from '../../../../lib/market-researched-facts';
import {VIDEO_RATES} from '../../../../lib/market-rate-catalog';
import {localizedCatalogFact} from '../../../../lib/market-fact-locale';
import {localizedProductSummary} from '../../../../lib/market-product-locale';
import {localizedCategory} from '../../../../lib/market-home-i18n';
import {commercialEvidence} from '../../../../lib/market-commercial-evidence';
import {apiServiceOffer} from '../../../../lib/market-api-service-catalog';
import {paymentFactsFor} from '../../../../lib/market-payment-facts';
import {globalRegionSummary} from '../../../../lib/region-presentation';
import {localizedPaymentName} from '../../../market-global-access';
import {platformLinks} from '../../../../lib/official-platform-links';
import type {Language} from '../../../../lib/v2';
type PageParams={params:Promise<{lang:string;id:string}>};
const WORDS:Record<Language,readonly [string,string,string,string,string,string,string,string,string,string,string,string]>={
 zh:['功能和适用任务','免费额度','官方价格','代表模型与能力','国家、地区与使用入口','商用授权和限制','官网和开始使用','官方资料','资料核对时间','返回全部平台','价格可能随地区、套餐和活动变化；未核实的能力不参与排行。','第三方独立评分尚无可比数据'],
 en:['Capabilities and tasks','Free use','Official pricing','Models and capabilities','Countries, regions and access','Commercial rights','Official site and start','Publisher source','Reviewed','Back to market','Prices vary by country, plan and promotion. Unverified claims do not become rankings.','No comparable independent score yet'],
 ja:['機能と用途','無料枠','公式料金','モデルと能力','国・地域・アクセス','商用許諾','公式サイト','公式根拠','確認日','市場に戻る','国・プラン・時期で料金が変わります。','独立評価はまだありません'],
 ko:['기능과 작업','무료 이용','공식 요금','모델과 기능','국가·지역 및 접속','상업적 이용','공식 사이트','공식 자료','확인일','목록으로','지역·요금제에 따라 가격이 다를 수 있습니다.','독립 점수 자료 없음'],
 fr:['Fonctions et usages','Accès gratuit','Tarif officiel','Modèles et capacités','Pays et accès','Droits commerciaux','Site officiel','Source officielle','Vérifié le','Retour au marché','Prix variables selon pays, forfait et promotions.','Pas encore de score indépendant comparable'],
 de:['Funktionen und Einsatzgebiete','Kostenlose Nutzung','Offizielle Preise','Modelle und Fähigkeiten','Länder und Zugang','Gewerbliche Rechte','Offizielle Website','Offizielle Quelle','Geprüft','Zurück zum Markt','Preise variieren nach Land, Tarif und Aktion.','Noch kein unabhängiger Vergleichswert'],
 es:['Funciones y tareas','Uso gratuito','Precio oficial','Modelos y capacidades','Países y acceso','Uso comercial','Sitio oficial','Fuente oficial','Revisado','Volver al mercado','Los precios dependen del país, plan y promoción.','Sin puntuación independiente comparable'],
 pt:['Funções e tarefas','Uso gratuito','Preço oficial','Modelos e capacidades','Países e acesso','Uso comercial','Site oficial','Fonte oficial','Verificado','Voltar ao mercado','Preços dependem de país, plano e promoções.','Sem avaliação independente comparável'],
 ar:['الوظائف والمهام','الاستخدام المجاني','الأسعار الرسمية','النماذج والقدرات','البلدان وإمكانية الوصول','الاستخدام التجاري','الموقع الرسمي','المصدر الرسمي','تاريخ المراجعة','العودة للسوق','تختلف الأسعار حسب الدولة والخطة والعروض.','لا توجد درجة مستقلة قابلة للمقارنة']
};
export const dynamicParams=false;
export const revalidate=3600;
export function generateStaticParams(){return marketLocales.flatMap(lang=>searchPlatforms({limit:100}).items.map(e=>({lang,id:e.id})));}
const DISPLAY_NAMES:Record<string,string>={kling:'Kling AI',jimeng:'Dreamina / Jimeng AI',qwen:'Qwen',doubao:'Doubao'};
const publicName=(lang:Language,id:string,name:string)=>lang==='zh'?name:DISPLAY_NAMES[id]||name;
const videoName=(lang:Language,video:{platform:string;model:string;id:string;region:string})=>{
 if(lang==='zh')return video.model;
 if(video.platform==='kling')return 'Kling Video 3.0 · '+(video.model.includes('无原生')?'No native audio':'Native audio');
 if(video.platform==='qwen')return 'Wan 3.0 Video · '+(video.region==='北京'?'Beijing':'Singapore');
 if(video.platform==='doubao')return 'Seedance 2.5 · Volcano Ark API';
 if(video.platform==='jimeng')return 'Seedance '+(video.id.includes('25')?'2.5':'2.0')+' · '+(video.id.includes('super')?'Super annual':video.id.includes('advanced')?'Advanced annual':'Basic monthly');
 return video.model;
};
const label=(lang:Language,id:string)=>{const product=findPlatform(id);if(!product)return '';const text=localizedProductSummary(id,lang);return text||product.name;};
export async function generateMetadata({params}:PageParams):Promise<Metadata>{
 const {lang,id}=await params,product=findPlatform(id);
 if(!product||!marketLocales.includes(lang as Language))return {robots:{index:false}};
 const language=lang as Language,displayName=publicName(language,id,product.name),description=label(language,id),title=displayName+(description===displayName?'':' | '+description)+' | LINGXIFIELD';
 const robots=mayIndexMarket(lang);
 const languages:Record<string,string>={};
 if(robots)for(const l of indexableMarketLocales())languages[l]=marketCanonicalOrigin+'/'+l+'/platform/'+encodeURIComponent(id);
 if(languages.en)languages['x-default']=languages.en;
 return {title,description:label(language,id)+'. '+product.name+' — '+WORDS[language][2]+', '+WORDS[language][1]+', '+WORDS[language][5]+'.',
  robots:{index:robots,follow:robots},alternates:robots?{canonical:marketCanonicalOrigin+'/'+lang+'/platform/'+encodeURIComponent(id),languages}:undefined,
  openGraph:{title,description:label(language,id),type:'article'}};
}
export default async function LocalProduct({params}:PageParams){
 const {lang,id}=await params;
 if(!marketLocales.includes(lang as Language))notFound();
 const p=findPlatform(id);if(!p)notFound();
 const l=lang as Language,w=WORDS[l],facts=researchedFact(id),commercial=commercialEvidence(id,l),api=apiServiceOffer(id),payments=paymentFactsFor(id,'GLOBAL'),team=platformLinks(id).team;
 const summary=label(l,id),displayName=publicName(l,id,p.name),date='2026-10-31';
 const videos=VIDEO_RATES.filter(r=>r.platform===id&&r.resolution!=='not-confirmed'&&!['unverified','plan-only'].includes(r.billing));
 const videoTitle=({zh:'短视频/短剧：官方模型与画质计费',en:'Short video: model, resolution and cost',ja:'動画：モデル・画質・料金',ko:'영상: 모델·해상도·요금',fr:'Vidéo : modèle, qualité et coût',de:'Video: Modell, Auflösung und Kosten',es:'Vídeo: modelo, resolución y coste',pt:'Vídeo: modelo, resolução e custo',ar:'الفيديو: النموذج والدقة والتكلفة'} as Record<Language,string>)[l];
 const rows=[
  [w[0],summary,p.website],
  [w[1],localizedCatalogFact(id,l,'free',facts?.free||''),facts?.freeSource],
  [w[2],localizedCatalogFact(id,l,'price',facts?.price||''),facts?.priceSource],
  [w[3],localizedCatalogFact(id,l,'models',facts?.models||''),facts?.modelsSource],
  [w[4],globalRegionSummary(id,l),facts?.regionSource],
  [w[5],commercial?.condition||facts?.commercial,commercial?.source||facts?.commercialSource],
  [({zh:'支持的付款方式',en:'Payment methods',ja:'支払方法',ko:'결제 수단',fr:'Moyens de paiement',de:'Zahlungsmethoden',es:'Métodos de pago',pt:'Métodos de pagamento',ar:'طرق الدفع'} as Record<Language,string>)[l],payments.methods.map(x=>localizedPaymentName(x,l)).join(' · '),payments.source]
 ] as const;
 const jsonld={'@context':'https://schema.org','@type':'SoftwareApplication',name:displayName,description:summary,url:p.website,publisher:{'@type':'Organization',name:p.company},applicationCategory:localizedCategory(l,p.category)};
 return <main lang={l} dir={l==='ar'?'rtl':'ltr'} className="marketLocalizedProduct">
  <nav><Link href={'/'+l+'/ai'}>{w[9]}</Link></nav>
  <header><small>LINGXIFIELD · GLOBAL SI AI MARKET</small><h1>{displayName}</h1><p>{summary}</p><span>{localizedCategory(l,p.category)}</span></header>
  <section className="marketLocalizedFacts">{rows.filter(([,value])=>typeof value==='string'&&value.trim().length>0).map(([title,value,src])=><article key={title}><h2>{title}</h2><p>{value}</p>{src&&/^https:\/\//.test(src)&&<a rel="nofollow noopener noreferrer" target="_blank" href={src}>{w[7]} ↗</a>}</article>)}</section>
  {videos.length>0?<section className="marketLocalizedVideoRates"><h2>{videoTitle}</h2><div className="marketLocalizedRatesScroll"><table><thead><tr><th>{w[3]}</th><th>{l==='zh'?'分辨率':'Quality'}</th><th>{w[2]}</th><th>{w[7]}</th></tr></thead><tbody>{videos.map(v=>{
  const expired=Boolean(v.promoEnds)&&Date.now()>Date.parse(v.promoEnds+'T23:59:59+08:00');
  const cost=expired?(l==='zh'?'活动价已过期':'Offer expired'):v.billing==='credits'?v.creditsPerSecond+' credits/s':v.billing==='plan-equivalent'?v.currency+' '+v.perSecond+' /s '+(l==='zh'?'套餐折合促销价':'promotional plan equivalent'):v.billing==='token-only'?v.currency+' '+v.apiPerMillionNoVideo+'/1M video tokens':v.currency+' '+v.perSecond+' /s';
  return <tr key={v.id}><td>{videoName(l,v)}</td><td>{v.resolution}</td><td>{cost}{v.promoEnds?' · '+v.promoEnds:''}</td><td><a href={v.source} target="_blank" rel="noopener noreferrer">{w[7]} ↗</a></td></tr>;})}</tbody></table></div></section>:null}
  <footer><a target="_blank" rel="noopener noreferrer" href={p.website}>{w[6]} ↗</a><p>{w[8]}: {date} · {w[10]} · {w[11]}</p></footer>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonld).replace(/</g,'\\u003c')}}/>
 </main>;
}
