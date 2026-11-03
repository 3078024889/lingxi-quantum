import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SiaiRankingHome,{type SiaiHomeRow} from "@/components/SiaiRankingHome";
import {SIAI_DISCOVERY} from "@/lib/siai-search-discovery";
import {getSiaiSourcePreviewRows} from "./candidate-public";
import {PRIMARY_SITE} from "@/lib/seo/site-domains";
import {siaiLandingShouldIndex} from "@/lib/siai-seo-policy";
import {MARKET_API_PRODUCTS} from "../../lingxifield-ai-market/lib/market-api-service-catalog";
import {findPlatform} from "../../lingxifield-ai-market/lib/platform-repository";
import {researchedFact,marketProductReviewedAt} from "../../lingxifield-ai-market/lib/market-researched-facts";
import {companyPresentationFor} from "../../lingxifield-ai-market/lib/market-company-evidence";
import {questionForProduct} from "../../lingxifield-ai-market/lib/market-user-task-queries.mjs";
import {capabilityProfile} from "../../lingxifield-ai-market/lib/capability-profiles";
import {productAnswerHeadline} from "../../lingxifield-ai-market/lib/market-result-headlines";

export const dynamic="force-dynamic";
export const revalidate=0;
export const metadata:Metadata={
 title:"全球AI排行榜与AI行情平台｜全球SI／SIAI排行榜｜灵犀场 LINGXIFIELD",
 description:"找全球AI行情平台、全球AI排行榜、全球SI排行榜、全球SI行情平台、全球SIAI行情平台、全球SIAI排行榜？灵犀场按用途展示全球AI公司、模型、工具、免费额度、价格、地区和商用条件，并链接官方资料。",
 keywords:[...SIAI_DISCOVERY.zh.topics.map(t=>t.q),...SIAI_DISCOVERY.zh.extras,"灵犀场","LINGXIFIELD","全球AI工具行情","全球AI模型排行榜","AI工具推荐","AI模型API价格","AI视频生成平台","AI公司排行榜"],
 alternates:{canonical:PRIMARY_SITE+"/siai"},
 openGraph:{title:"全球AI排行榜与SIAI行情平台｜灵犀场",description:"全球AI、SI与SIAI工具目录：比较功能、价格、免费额度、地区条件和官方来源。",url:PRIMARY_SITE+"/siai"},
 robots:{index:siaiLandingShouldIndex(),follow:true}
};

function getCuratedRows():SiaiHomeRow[]{
 return MARKET_API_PRODUCTS.flatMap(id=>{
  const platform=findPlatform(id);
  if(!platform)return [];
  const publisher=companyPresentationFor(id,platform.company);
  const fact=researchedFact(id);
  return [{
   id:platform.id,name:platform.name,company:publisher.name,legal:publisher.legalEntity,creator:publisher.creator,
   legalScope:publisher.legalEntityScope,kind:publisher.kind,listing:publisher.listingState,
   ipoFiling:Boolean(publisher.ipoFiling),year:publisher.year,checkedAt:fact?marketProductReviewedAt(id):null,
   companySource:publisher.companySource,legalSource:publisher.legalEntitySource,
   listingSource:publisher.ipoFilingSource||publisher.listingSource,yearSource:publisher.yearSource,
   category:platform.category,about:platform.about,
   strength:[productAnswerHeadline(id),capabilityProfile(id)?.differentiator].filter(Boolean).join(" ")||platform.guide?.strengths||platform.about,
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
 const curated=getCuratedRows();
 const rows=[...curated,...getSiaiSourcePreviewRows()];
 if(rows.length!==62||new Set(rows.map(r=>r.id)).size!==62)throw Error("SIAI_DIRECTORY_62_UNIQUE_ROWS_REQUIRED");
 const faqld={"@context":"https://schema.org","@type":"FAQPage","@id":PRIMARY_SITE+"/siai#faq",
  mainEntity:SIAI_DISCOVERY.zh.topics.map(t=>({"@type":"Question",name:t.q,acceptedAnswer:{"@type":"Answer",text:t.rank}}))};
 const jsonld={"@context":"https://schema.org","@type":"CollectionPage",name:"全球 SIAI 排行榜",
  alternateName:SIAI_DISCOVERY.zh.topics.map(t=>t.q),keywords:[...SIAI_DISCOVERY.zh.topics.map(t=>t.q),...SIAI_DISCOVERY.zh.extras].join(", "),
  about:[{"@type":"Thing",name:"AI / SI tools"},{"@type":"Thing",name:"AI software pricing and free tiers"}],
  url:PRIMARY_SITE+"/siai",description:"灵犀场全球 SIAI 排行榜，按功能、模型、免费额度、价格、地区、付款方式及公司背景比较 SI/AI 工具与厂商。",
  mainEntity:{"@type":"ItemList",numberOfItems:curated.length,itemListElement:curated.map((r,i)=>({
   "@type":"ListItem",position:i+1,name:r.name,url:r.website
  }))}};
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonld).replace(/</g,"\\u003c")}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqld).replace(/</g,"\\u003c")}}/><Nav/><SiaiRankingHome rows={rows}/><Footer/></>;
}
