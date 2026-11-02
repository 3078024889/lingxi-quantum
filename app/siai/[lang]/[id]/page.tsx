import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import {PRIMARY_SITE} from '@/lib/seo/site-domains';
import {SIAI_DETAIL_LOCALES,siaiProductPath,validSiaiDetailLang,siaiDetailShouldIndex,type SiaiDetailLocale} from '@/lib/siai-seo-policy';
import {MARKET_API_PRODUCTS} from '@/lingxifield-ai-market/lib/market-api-service-catalog';
import {findPlatform} from '@/lingxifield-ai-market/lib/platform-repository';
import {researchedFact} from '@/lingxifield-ai-market/lib/market-researched-facts';
import {companyPresentationFor} from '@/lingxifield-ai-market/lib/market-company-evidence';
import {localizedProductSummary} from '@/lingxifield-ai-market/lib/market-product-locale';
import {localizedCatalogFact} from '@/lingxifield-ai-market/lib/market-fact-locale';
import {globalRegionSummary} from '@/lingxifield-ai-market/lib/region-presentation';
import {commercialEvidence} from '@/lingxifield-ai-market/lib/market-commercial-evidence';
import {localizedPaymentName} from '@/lingxifield-ai-market/lib/market-localized-payment';
import {localizedCategory} from '@/lingxifield-ai-market/lib/market-home-i18n';
import {questionForProduct} from '@/lingxifield-ai-market/lib/market-user-task-queries.mjs';

export const dynamic='force-dynamic';
type Props={params:Promise<{lang:string;id:string}>};
type Words={back:string;source:string;official:string;intro:string;tasks:string;company:string;legal:string;listing:string;
 founded:string;strength:string;free:string;price:string;region:string;payment:string;models:string;commercial:string;
 parent:string;notVerified:string;listedParent:string;ipo:string;na:string};
const WORDS:Record<SiaiDetailLocale,Words>={
 zh:{back:'返回全球 SIAI 排行榜',source:'查看官方来源',official:'前往工具官网',intro:'核心能力',tasks:'这些问题可能与你有关',company:'公司名称',legal:'法人主体',listing:'是否上市',founded:'成立时间',strength:'最擅长什么',free:'免费额度',price:'真实价格',region:'地区可用',payment:'付款方式',models:'代表模型',commercial:'商用条件',parent:'集团法人主体',notVerified:'未确认上市',listedParent:'所属集团已上市',ipo:'已申请上市，尚未挂牌',na:'不适用'},
 en:{back:'Back to Global SIAI Rankings',source:'Official source',official:'Official website',intro:'Core capabilities',tasks:'Related task questions',company:'Company',legal:'Legal entity',listing:'Listing',founded:'Founded',strength:'Best for',free:'Free usage',price:'Pricing',region:'Regions',payment:'Payments',models:'Models',commercial:'Commercial terms',parent:'Parent legal entity',notVerified:'Not confirmed listed',listedParent:'Listed parent',ipo:'IPO filed; not yet listed',na:'N/A'},
 ja:{back:'SIAIランキングに戻る',source:'公式資料',official:'公式サイト',intro:'主要機能',tasks:'関連する質問',company:'会社名',legal:'法人名',listing:'上場状況',founded:'設立',strength:'得意分野',free:'無料枠',price:'価格',region:'利用地域',payment:'支払',models:'モデル',commercial:'商用条件',parent:'親会社法人',notVerified:'未確認',listedParent:'上場親会社',ipo:'IPO申請中',na:'対象外'},
 ko:{back:'SIAI 순위로 돌아가기',source:'공식 출처',official:'공식 사이트',intro:'주요 기능',tasks:'관련 질문',company:'회사명',legal:'법인',listing:'상장',founded:'설립',strength:'강점',free:'무료',price:'가격',region:'지역',payment:'결제',models:'모델',commercial:'상업 이용',parent:'모기업',notVerified:'미확인',listedParent:'상장 그룹',ipo:'IPO 신청 중',na:'해당 없음'},
 fr:{back:'Retour au classement SIAI',source:'Source officielle',official:'Site officiel',intro:'Fonctions clés',tasks:'Questions associées',company:'Entreprise',legal:'Entité juridique',listing:'Cotation',founded:'Fondation',strength:'Points forts',free:'Gratuit',price:'Prix',region:'Régions',payment:'Paiement',models:'Modèles',commercial:'Usage commercial',parent:'Société mère',notVerified:'Non confirmé',listedParent:'Groupe coté',ipo:'IPO déposée',na:'Sans objet'},
 de:{back:'Zurück zum SIAI-Ranking',source:'Offizielle Quelle',official:'Offizielle Website',intro:'Funktionen',tasks:'Verwandte Fragen',company:'Unternehmen',legal:'Rechtsträger',listing:'Börse',founded:'Gründung',strength:'Stärken',free:'Kostenlos',price:'Preis',region:'Regionen',payment:'Zahlung',models:'Modelle',commercial:'Gewerbliche Nutzung',parent:'Muttergesellschaft',notVerified:'Nicht bestätigt',listedParent:'Börsennotierte Mutter',ipo:'IPO beantragt',na:'Nicht zutreffend'},
 es:{back:'Volver al ranking SIAI',source:'Fuente oficial',official:'Sitio oficial',intro:'Funciones',tasks:'Preguntas relacionadas',company:'Empresa',legal:'Entidad jurídica',listing:'Cotización',founded:'Fundación',strength:'Ventajas',free:'Gratis',price:'Precio',region:'Regiones',payment:'Pago',models:'Modelos',commercial:'Uso comercial',parent:'Matriz legal',notVerified:'Sin confirmar',listedParent:'Matriz cotizada',ipo:'IPO presentada',na:'No aplica'},
 pt:{back:'Voltar ao ranking SIAI',source:'Fonte oficial',official:'Site oficial',intro:'Funções',tasks:'Perguntas relacionadas',company:'Empresa',legal:'Entidade legal',listing:'Listagem',founded:'Fundação',strength:'Vantagens',free:'Grátis',price:'Preço',region:'Regiões',payment:'Pagamento',models:'Modelos',commercial:'Uso comercial',parent:'Empresa controladora',notVerified:'Não confirmado',listedParent:'Controladora listada',ipo:'IPO solicitada',na:'Não se aplica'},
 ar:{back:'العودة إلى ترتيب SIAI',source:'المصدر الرسمي',official:'الموقع الرسمي',intro:'الميزات الرئيسية',tasks:'أسئلة متعلقة',company:'الشركة',legal:'الكيان القانوني',listing:'الإدراج',founded:'التأسيس',strength:'المميزات',free:'مجاني',price:'السعر',region:'المناطق',payment:'الدفع',models:'النماذج',commercial:'الاستخدام التجاري',parent:'الشركة الأم',notVerified:'غير مؤكد',listedParent:'الشركة الأم مدرجة',ipo:'تم تقديم طلب اكتتاب',na:'لا ينطبق'}
};
function resolve(lang:string,id:string){
 if(!validSiaiDetailLang(lang)||!MARKET_API_PRODUCTS.includes(id))notFound();
 const p=findPlatform(id);if(!p)notFound();
 return {lang,p,facts:researchedFact(id),publisher:companyPresentationFor(id,p.company)};
}
const safe=(url:string|null|undefined)=>url&&/^https:\/\//i.test(url)?url:null;
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {lang,id}=await params;
 const {p,facts}=resolve(lang,id);
 const words=WORDS[lang as SiaiDetailLocale];
 const question=lang==='zh'?questionForProduct(id)[0]:null;
 const title=(question?question+'｜':'')+p.name+'｜'+words.price+' / '+words.free+'｜全球 SIAI';
 const description=localizedProductSummary(id,lang as SiaiDetailLocale)||p.about;
 const canonical=PRIMARY_SITE+siaiProductPath(lang as SiaiDetailLocale,id);
 const languages=Object.fromEntries(SIAI_DETAIL_LOCALES.map(l=>[l,PRIMARY_SITE+siaiProductPath(l,id)]));
 languages['zh-CN']=languages.zh;languages['x-default']=languages.en;
 const isIndexable=siaiDetailShouldIndex(facts);
 return {title,description,alternates:{canonical,languages},
  robots:{index:isIndexable,follow:true},openGraph:{type:'article',title,description,url:canonical}};
}
export default async function SiaiProductDetail({params}:Props){
 const {lang,id}=await params;
 const {p,facts,publisher}=resolve(lang,id),l=lang as SiaiDetailLocale,t=WORDS[l];
 const listing=publisher.kind==='company'?(publisher.ipoFiling?t.ipo:publisher.listingState==='listed_parent'?t.listedParent:t.notVerified):t.na;
 const strength=localizedProductSummary(id,l)||p.guide?.strengths||p.about;
 const paymentDisplay=l==='zh'?(facts?.payments?.join(' · ')||'—'):((facts?.payments||[]).map(method=>/Link（Stripe/.test(method)?'Link (Stripe Checkout)':localizedPaymentName(method,l)).join(' · ')||'—');
 const commercialDisplay=l==='zh'?(facts?.commercial||'—'):(commercialEvidence(id,l)?.condition||'—');
 const items=[
  {label:t.company,value:publisher.name,source:publisher.companySource},
  {label:publisher.legalEntityScope==='group_parent'?t.parent:t.legal,value:publisher.legalEntity||'—',source:publisher.legalEntitySource},
  {label:t.listing,value:listing,source:publisher.ipoFilingSource||publisher.listingSource},
  {label:t.founded,value:publisher.year||'—',source:publisher.yearSource},
  {label:t.strength,value:strength,source:p.website},
  {label:t.free,value:localizedCatalogFact(id,l,'free',facts?.free||p.free||'—'),source:facts?.freeSource},
  {label:t.price,value:localizedCatalogFact(id,l,'price',facts?.price||p.price||'—'),source:facts?.priceSource},
  {label:t.region,value:l==='zh'?(facts?.region||p.location||'—'):globalRegionSummary(id,l),source:facts?.regionSource},
  {label:t.payment,value:paymentDisplay,source:facts?.paymentSource},
  {label:t.models,value:localizedCatalogFact(id,l,'models',facts?.models||p.features.join(' · ')),source:facts?.modelsSource},
  {label:t.commercial,value:commercialDisplay,source:facts?.commercialSource}
 ];
 const publisherNode={ '@type':'Organization',name:publisher.name,
  ...(publisher.legalEntity&&safe(publisher.legalEntitySource)?{legalName:publisher.legalEntity}:{})};
 const schema={'@context':'https://schema.org','@type':'SoftwareApplication',name:p.name,
  applicationCategory:localizedCategory(l,p.category),description:strength,url:p.website,
  publisher:publisherNode};
 const jsonld=JSON.stringify(schema).replace(/</g,'\\u003c');
 return <><Nav/><main className="siai-detail-page" lang={l==='zh'?'zh-CN':l} dir={l==='ar'?'rtl':'ltr'}>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonld}}/>
  <nav aria-label={t.back}><Link href="/">{t.back}</Link></nav>
  <header><p>{localizedCategory(l,p.category)} · LINGXIFIELD SIAI</p><h1>{p.name}</h1><p>{strength}</p>
   <a href={p.website} target="_blank" rel="noopener noreferrer">{t.official} ↗</a></header>
  <section><h2>{t.intro}</h2><p>{l==='zh'?p.about:strength}</p>{l==='zh'&&<p>{p.features.join(' · ')}</p>}</section>
  <section className="siai-detail-facts"><h2>{t.source}</h2><dl>{items.map(item=><div key={item.label}><dt>{item.label}</dt><dd>{item.value}
   {safe(item.source)&&<a href={item.source!} target="_blank" rel="nofollow noopener noreferrer">{t.source} ↗</a>}</dd></div>)}</dl></section>
  {l==='zh'&&<section className="siai-detail-questions"><h2>{t.tasks}</h2><ul>{questionForProduct(id).slice(0,6).map((q:string)=><li key={q}>{q}</li>)}</ul></section>}
 </main><Footer/></>;
}
