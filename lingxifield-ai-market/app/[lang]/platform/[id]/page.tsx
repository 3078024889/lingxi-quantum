import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {findPlatform,searchPlatforms} from '../../../../lib/platform-repository';
import {marketLocales,mayIndexMarket,marketCanonicalOrigin,indexableMarketLocales} from '../../../../lib/market-index-policy';
import {researchedFact,marketProductReviewedAt} from '../../../../lib/market-researched-facts';
import {companyEvidenceFor,companyPresentationFor} from '../../../../lib/market-company-evidence';
import MarketPublisherFacts from '../../../market-publisher-facts';
import {capabilityProfile} from '../../../../lib/capability-profiles';
import {localizeCompanyEvidence} from '../../../../lib/market-company-evidence-locale';
import {questionForProduct} from '../../../../lib/market-user-task-queries.mjs';
import {VIDEO_RATES} from '../../../../lib/market-rate-catalog';
import {localizedCatalogFact} from '../../../../lib/market-fact-locale';
import {localizedProductSummary} from '../../../../lib/market-product-locale';
import MarketCodexSection from '../../../market-codex-section';
import SunoPlanComparison from '../../../suno-plan-comparison';
import {sunoPaymentNote} from '../../../../lib/market-suno-pricing';
import {localizedCategory} from '../../../../lib/market-home-i18n';
import {commercialEvidence} from '../../../../lib/market-commercial-evidence';
import {apiServiceOffer} from '../../../../lib/market-api-service-catalog';
import {paymentFactsFor} from '../../../../lib/market-payment-facts';
import {globalRegionSummary} from '../../../../lib/region-presentation';
import {localizedPaymentName} from '../../../../lib/market-localized-payment';
import {platformLinks} from '../../../../lib/official-platform-links';
import type {Language} from '../../../../lib/v2';
type PageParams={params:Promise<{lang:string;id:string}>};
const WORDS:Record<Language,readonly [string,string,string,string,string,string,string,string,string,string,string,string]>={
 zh:['功能和适用任务','免费额度','官方价格','代表模型与能力','国家、地区与使用入口','商用授权和限制','官网和开始使用','官方资料','资料核对时间','返回全部平台','价格随地区、套餐和活动变化，点击官方资料查看详情。','第三方独立评分尚无可比数据'],
 en:['Capabilities and tasks','Free use','Official pricing','Models and capabilities','Countries, regions and access','Commercial rights','Official site and start','Publisher source','Reviewed','Back to market','Prices vary by country and plan. See the publisher source for details.','No comparable independent score yet'],
 ja:['機能と用途','無料枠','公式料金','モデルと能力','国・地域・アクセス','商用許諾','公式サイト','公式根拠','確認日','市場に戻る','国やプランにより料金が異なります。公式情報をご覧ください。','独立評価はまだありません'],
 ko:['기능과 작업','무료 이용','공식 요금','모델과 기능','국가·지역 및 접속','상업적 이용','공식 사이트','공식 자료','확인일','목록으로','국가와 요금제에 따라 가격이 다릅니다. 공식 출처를 확인하세요.','독립 점수 자료 없음'],
 fr:['Fonctions et usages','Accès gratuit','Tarif officiel','Modèles et capacités','Pays et accès','Droits commerciaux','Site officiel','Source officielle','Vérifié le','Retour au marché','Tarifs variables selon pays et forfait. Consultez la source officielle.','Pas encore de score indépendant comparable'],
 de:['Funktionen und Einsatzgebiete','Kostenlose Nutzung','Offizielle Preise','Modelle und Fähigkeiten','Länder und Zugang','Gewerbliche Rechte','Offizielle Website','Offizielle Quelle','Geprüft','Zurück zum Markt','Die Preise variieren je Land und Tarif. Offizielle Quelle ansehen.','Noch kein unabhängiger Vergleichswert'],
 es:['Funciones y tareas','Uso gratuito','Precio oficial','Modelos y capacidades','Países y acceso','Uso comercial','Sitio oficial','Fuente oficial','Revisado','Volver al mercado','Los precios dependen del país y del plan. Consulta la fuente oficial.','Sin puntuación independiente comparable'],
 pt:['Funções e tarefas','Uso gratuito','Preço oficial','Modelos e capacidades','Países e acesso','Uso comercial','Site oficial','Fonte oficial','Verificado','Voltar ao mercado','Os preços dependem do país e do plano. Consulte a fonte oficial.','Sem avaliação independente comparável'],
 ar:['الوظائف والمهام','الاستخدام المجاني','الأسعار الرسمية','النماذج والقدرات','البلدان وإمكانية الوصول','الاستخدام التجاري','الموقع الرسمي','المصدر الرسمي','تاريخ المراجعة','العودة للسوق','تختلف الأسعار حسب الدولة والخطة؛ راجع المصدر الرسمي.','لا توجد درجة مستقلة قابلة للمقارنة']
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
const label=(lang:Language,id:string)=>{const product=findPlatform(id);if(!product)return '';const text=localizedProductSummary(id,lang);return text||(lang==='zh'?(capabilityProfile(id)?.headline||product.about):product.name);};
export async function generateMetadata({params}:PageParams):Promise<Metadata>{
 const {lang,id}=await params,product=findPlatform(id);
 if(!product||!marketLocales.includes(lang as Language))return {robots:{index:false}};
 const language=lang as Language,displayName=publicName(language,id,product.name),description=label(language,id);
 const editorialQuestion=language==='zh'?questionForProduct(id)[0]:undefined;
 const title=editorialQuestion?(editorialQuestion+(editorialQuestion.endsWith('？')?'':'？')+' | '+displayName+' | LINGXIFIELD'):(displayName+(description===displayName?'':' | '+description)+' | LINGXIFIELD');
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
 const summary=label(l,id),displayName=publicName(l,id,p.name),date=marketProductReviewedAt(id),companyEvidence=localizeCompanyEvidence(id,l,companyEvidenceFor(id));
 const publisher=companyPresentationFor(id,p.company),profile=capabilityProfile(id);
 const listingCopy=({zh:['未见公开上市公告','开源项目不独立上市'],en:['No confirmed public listing','Open-source project'],ja:['上場情報は未公表','OSSプロジェクト'],ko:['상장 정보 미확인','오픈소스 프로젝트'],fr:['Aucune cotation confirmée','Projet open source'],de:['Keine bestätigte Börsennotierung','Open-Source-Projekt'],es:['Cotización no confirmada','Proyecto de código abierto'],pt:['Cotação não confirmada','Projeto de código aberto'],ar:['لم يتم تأكيد الإدراج','مشروع مفتوح المصدر']} as Record<Language,string[]>)[l];
 const useful=(value:string|undefined)=>Boolean(value&&value.trim()&&!/^(待核验|暂无|—|unknown|n.?a|not verified)$/i.test(value.trim()));
 const companyWords=({zh:['公司','成立','地区','融资','上市','规模'],en:['Company','Founded','Location','Funding','Listing','Scale'],ja:['企業','設立','地域','調達','上場','規模'],ko:['회사','설립','지역','투자','상장','규모'],fr:['Entreprise','Création','Siège','Financement','Cotation','Taille'],de:['Firma','Gründung','Sitz','Finanzierung','Börse','Größe'],es:['Empresa','Fundación','Sede','Financiación','Bolsa','Tamaño'],pt:['Empresa','Fundação','Sede','Investimento','Bolsa','Dimensão'],ar:['الشركة','تأسست','المنطقة','التمويل','الإدراج','الحجم']} as Record<Language,string[]>)[l];
 const companyFacts=[
  {value:companyEvidence?.headquarters?.text,label:companyWords[2],source:companyEvidence?.headquarters?.source},
  {value:companyEvidence?.funding?.text,label:companyWords[3],source:companyEvidence?.funding?.source},
  {value:companyEvidence?.scale?.text,label:companyWords[5],source:companyEvidence?.scale?.source},
  {value:companyEvidence?.projectStarted?.text,label:l==='zh'?'项目起源':'Project origin',source:companyEvidence?.projectStarted?.source}
 ].filter(x=>useful(x.value));
 const videos=VIDEO_RATES.filter(r=>r.platform===id&&r.resolution!=='not-confirmed'&&!['unverified','plan-only'].includes(r.billing));
 const videoTitle=({zh:'短视频/短剧：官方模型与画质计费',en:'Short video: model, resolution and cost',ja:'動画：モデル・画質・料金',ko:'영상: 모델·해상도·요금',fr:'Vidéo : modèle, qualité et coût',de:'Video: Modell, Auflösung und Kosten',es:'Vídeo: modelo, resolución y coste',pt:'Vídeo: modelo, resolução e custo',ar:'الفيديو: النموذج والدقة والتكلفة'} as Record<Language,string>)[l];
 const paymentHeading=({zh:'支持的付款方式',en:'Payment methods',ja:'支払方法',ko:'결제 수단',fr:'Moyens de paiement',de:'Zahlungsmethoden',es:'Métodos de pago',pt:'Métodos de pagamento',ar:'طرق الدفع'} as Record<Language,string>)[l];
 const rows=[
  [w[0],l==='zh'&&profile?profile.capabilities.map(item=>item.name+'：'+item.outcome).join('；'):summary,profile?.capabilities[0]?.source||p.website],
  [w[1],localizedCatalogFact(id,l,'free',facts?.free||''),facts?.freeSource],
  [w[2],localizedCatalogFact(id,l,'price',facts?.price||''),facts?.priceSource],
  [w[3],localizedCatalogFact(id,l,'models',facts?.models||''),facts?.modelsSource],
  [w[4],globalRegionSummary(id,l),facts?.regionSource],
  [w[5],commercial?.condition||facts?.commercial,commercial?.source||facts?.commercialSource],
  [paymentHeading,payments.methods.map(x=>localizedPaymentName(x,l)).join(' · '),undefined]
 ] as const;
 const jsonld={'@context':'https://schema.org','@type':'SoftwareApplication',name:displayName,description:summary,url:p.website,publisher:{'@type':'Organization',name:publisher.name,...(publisher.legalEntity?{legalName:publisher.legalEntity}:{}),url:publisher.companySource||p.website},applicationCategory:localizedCategory(l,p.category),featureList:l==='zh'?profile?.capabilities.map(item=>item.name+'：'+item.outcome):undefined};
 return <main lang={l} dir={l==='ar'?'rtl':'ltr'} className="marketLocalizedProduct">
  <nav><Link href={'/'+l+'/ai'}>{w[9]}</Link></nav>
  <header><small>LINGXIFIELD · GLOBAL SI AI MARKET</small><h1>{displayName}</h1><p>{summary}</p><span>{localizedCategory(l,p.category)}</span></header>
  <section className="marketLocalizedCompany">
   <h2>{({zh:'公司简介',en:'Company overview',ja:'企業概要',ko:'회사 소개',fr:'Profil de l’entreprise',de:'Firmenprofil',es:'Empresa',pt:'Empresa',ar:'نبذة عن الشركة'} as Record<Language,string>)[l]}</h2>
   <p>{summary}</p><MarketPublisherFacts publisher={publisher} language={l} showSources/><div className="marketLocalizedCompanyFacts">{companyFacts.map((fact,i)=><span key={i}><small>{fact.label}</small><strong>{fact.value}</strong>{fact.source&&<a href={fact.source} target="_blank" rel="noopener noreferrer">{w[7]} ↗</a>}</span>)}<a href={p.website} target="_blank" rel="noopener noreferrer">{p.domain} ↗</a></div>
   {team&&l==='zh'&&<p>{team.summary} <a href={team.source} target="_blank" rel="noopener noreferrer">{w[7]} ↗</a></p>}
  </section>
  {id==='chatgpt'?<MarketCodexSection language={l}/>:null}
  <section className="marketLocalizedFacts">{rows.filter(([,value])=>typeof value==='string'&&value.trim().length>0).map(([title,value,src])=><article key={title}><h2>{title}</h2>
   {title===paymentHeading&&payments.methodEvidence.length>0?<><ul className="marketLocalizedPaymentEvidence">{payments.methodEvidence.map(method=><li key={method.method}><span>{localizedPaymentName(method.method,l)}</span><a href={method.source} rel="nofollow noopener noreferrer" target="_blank">{w[7]} ↗</a></li>)}</ul>{id==='suno'?<p className="marketPaymentNote">{sunoPaymentNote(l)}</p>:null}</>:title===w[2]&&id==='suno'?<SunoPlanComparison language={l}/>:<p>{value}</p>}
   {src&&/^https:\/\//.test(src)&&!(id==='suno'&&title===w[2])&&<a rel="nofollow noopener noreferrer" target="_blank" href={src}>{w[7]} ↗</a>}
  </article>)}</section>
  {l==='zh'&&questionForProduct(id).length>0?<section className="marketLocalizedFaq">
   <h2>大家还会搜索</h2>
   <div className="marketLocalizedFaqLinks">{questionForProduct(id).map((q:string)=><Link key={q} href={'/zh/ai?q='+encodeURIComponent(q)}>{q} ↗</Link>)}</div>
  </section>:null}
  <section className="marketLocalizedApiRates">
   <h2>{({zh:'开发者 API 计费与会员套餐',en:'Developer API pricing and web plans',ja:'開発者API料金と会員プラン',ko:'개발자 API 요금 및 구독',fr:'Tarifs API et abonnements',de:'API-Preise und Abos',es:'Precios API y planes',pt:'Preços de API e planos',ar:'أسعار API والاشتراكات'} as Record<Language,string>)[l]}</h2>
   <p>{l==='zh'?api.descriptionZh:api.descriptionEn}</p>
   {api.tokenRates.length>0?<div className="marketLocalizedRatesScroll"><table><thead><tr>
    <th>{w[3]}</th><th>{({zh:'输入 / 百万 Token',en:'Input / 1M tokens',ja:'入力/100万Token',ko:'입력/100만토큰',fr:'Entrée/1M tokens',de:'Eingabe/1M Token',es:'Entrada/1M tokens',pt:'Entrada/1M tokens',ar:'الإدخال / مليون رمز'} as Record<Language,string>)[l]}</th>
    <th>{({zh:'输出 / 百万 Token',en:'Output / 1M tokens',ja:'出力/100万Token',ko:'출력/100만토큰',fr:'Sortie/1M tokens',de:'Ausgabe/1M Token',es:'Salida/1M tokens',pt:'Saída/1M tokens',ar:'الإخراج / مليون رمز'} as Record<Language,string>)[l]}</th><th>{w[7]}</th>
   </tr></thead><tbody>{api.tokenRates.map(x=><tr key={x.id}><td>{x.model}</td><td>{x.currency} {x.inPerMillion}</td><td>{x.currency} {x.outPerMillion}</td><td><a href={x.source} target="_blank" rel="noopener noreferrer">{w[7]} ↗</a></td></tr>)}</tbody></table></div>:null}
   {api.unitRates.length>0?<div className="marketLocalizedRatesScroll"><table><thead><tr><th>{w[3]}</th><th>{w[2]}</th><th>{w[7]}</th></tr></thead>
    <tbody>{api.unitRates.map(x=><tr key={x.id}><td>{x.name}</td><td>{x.currency} {x.price} / {x.unit}</td><td><a href={x.source} target="_blank" rel="noopener noreferrer">{w[7]} ↗</a></td></tr>)}</tbody></table></div>:null}
   {api.videoRates.length>0?<div className="marketLocalizedRatesScroll"><table><thead><tr><th>{w[3]}</th><th>{w[2]}</th><th>{w[7]}</th></tr></thead><tbody>{api.videoRates.map(x=><tr key={x.id}><td>{x.model} · {x.resolution}</td><td>{x.currency} {x.billing==='per-second'?x.perSecond+' /s':x.apiPerMillionNoVideo+' / 1M video tokens'}</td><td><a href={x.source} target="_blank" rel="noopener noreferrer">{w[7]} ↗</a></td></tr>)}</tbody></table></div>:null}
   {api.subscriptionZh?<div className="marketLocalizedApiPlan"><strong>{({zh:'网页会员或产品订阅价（不是 API 单次价格）',en:'Web or product subscription (not an API-call fee)',ja:'Web会員費（API従量料金とは別）',ko:'웹 구독료(API 호출 요금과 별도)',fr:'Abonnement web (distinct de l’API)',de:'Web-Abo (nicht API-Aufrufpreis)',es:'Plan web (no es precio de API)',pt:'Plano web (não é preço da API)',ar:'اشتراك الويب (ليس سعر استدعاء API)'} as Record<Language,string>)[l]}</strong>
    <p>{localizedCatalogFact(id,l,'price',api.subscriptionZh)}</p>{api.subscriptionSource&&<a href={api.subscriptionSource} target="_blank" rel="noopener noreferrer">{w[7]} ↗</a>}</div>:null}
  </section>
  {videos.length>0?<section className="marketLocalizedVideoRates"><h2>{videoTitle}</h2><div className="marketLocalizedRatesScroll"><table><thead><tr><th>{w[3]}</th><th>{l==='zh'?'分辨率':'Quality'}</th><th>{w[2]}</th><th>{w[7]}</th></tr></thead><tbody>{videos.map(v=>{
  const expired=Boolean(v.promoEnds)&&Date.now()>Date.parse(v.promoEnds+'T23:59:59+08:00');
  const cost=expired?(l==='zh'?'活动价已过期':'Offer expired'):v.billing==='credits'?v.creditsPerSecond+' credits/s':v.billing==='plan-equivalent'?v.currency+' '+v.perSecond+' /s '+(l==='zh'?'套餐折合促销价':'promotional plan equivalent'):v.billing==='token-only'?v.currency+' '+v.apiPerMillionNoVideo+'/1M video tokens':v.currency+' '+v.perSecond+' /s';
  return <tr key={v.id}><td>{videoName(l,v)}</td><td>{v.resolution}</td><td>{cost}{v.promoEnds?' · '+v.promoEnds:''}</td><td><a href={v.source} target="_blank" rel="noopener noreferrer">{w[7]} ↗</a></td></tr>;})}</tbody></table></div></section>:null}
  <footer><a target="_blank" rel="noopener noreferrer" href={p.website}>{w[6]} ↗</a><p>{w[8]}: {date} · {w[10]}</p></footer>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonld).replace(/</g,'\\u003c')}}/>
 </main>;
}
