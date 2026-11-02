import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SiaiRankingHome,{type SiaiHomeRow} from "@/components/SiaiRankingHome";
import {PRIMARY_SITE} from "@/lib/seo/site-domains";
import {MARKET_API_PRODUCTS} from "../lingxifield-ai-market/lib/market-api-service-catalog";
import {findPlatform} from "../lingxifield-ai-market/lib/platform-repository";
import {researchedFact} from "../lingxifield-ai-market/lib/market-researched-facts";
import {companyPresentationFor} from "../lingxifield-ai-market/lib/market-company-evidence";
import {questionForProduct} from "../lingxifield-ai-market/lib/market-user-task-queries.mjs";

export const dynamic="force-dynamic";
export const revalidate=0;
export const metadata:Metadata={
 title:"全球 SIAI 排行榜｜AI 工具、厂商、免费额度与价格｜灵犀场",
 description:"全球 SIAI AI 工具行情与厂商排行榜：比较真实官方价格、免费额度、主要功能、地区可用、付款方式、法律主体、上市状态和商用条件。查看官网直接使用。",
 alternates:{canonical:PRIMARY_SITE+"/"},
 openGraph:{title:"全球 SIAI 排行榜｜灵犀场",description:"全球 AI 工具与厂商行情，先找到适合自己任务的工具，再看价格和使用条件。",url:PRIMARY_SITE+"/"},
 robots:{index:true,follow:true}
};

function getCuratedRows():SiaiHomeRow[]{
 return MARKET_API_PRODUCTS.flatMap(id=>{
  const platform=findPlatform(id);
  if(!platform)return [];
  const publisher=companyPresentationFor(id,platform.company);
  const fact=researchedFact(id);
  return [{
   id:platform.id,name:platform.name,company:publisher.name,legal:publisher.legalEntity,
   legalScope:publisher.legalEntityScope,kind:publisher.kind,listing:publisher.listingState,
   ipoFiling:Boolean(publisher.ipoFiling),year:publisher.year,
   companySource:publisher.companySource,legalSource:publisher.legalEntitySource,
   listingSource:publisher.ipoFilingSource||publisher.listingSource,yearSource:publisher.yearSource,
   category:platform.category,about:platform.about,strength:platform.guide?.strengths||platform.about,
   searchTerms:questionForProduct(id),
   features:platform.features,free:fact?.free||platform.free||"—",freeSource:fact?.freeSource||null,
   price:fact?.price||platform.price||"—",priceSource:fact?.priceSource||null,
   region:fact?.region||platform.location||"—",regionSource:fact?.regionSource||null,
   payment:fact?.payments?.join(" · ")||"—",
   paymentSource:fact?.paymentSource||null,
   models:fact?.models||platform.features.slice(0,3).join(" · "),modelsSource:fact?.modelsSource||null,
   commercial:fact?.commercial||"查看官网商用条件",commercialSource:fact?.commercialSource||null,
   website:platform.website
  }];
 });
}

export default function Home(){
 const rows=getCuratedRows();
 const jsonld={"@context":"https://schema.org","@type":"CollectionPage",name:"全球 SIAI 排行榜",
  url:PRIMARY_SITE+"/",description:"32 个经过编辑收录的 AI 工具及其官方资料与厂商信息。",
  mainEntity:{"@type":"ItemList",numberOfItems:rows.length,itemListElement:rows.map((r,i)=>({
   "@type":"ListItem",position:i+1,name:r.name,url:r.website
  }))}};
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonld)}}/><Nav/><SiaiRankingHome rows={rows}/><Footer/></>;
}
