import type {Metadata} from "next";
import Nav from "@/components/Nav";
import SiaiPartnerLink from "@/components/SiaiPartnerLink";
import Footer from "@/components/Footer";
import SiaiRankingHome from "@/components/SiaiRankingHome";
import {getSiaiDirectoryRows} from "./catalog-data";
import {seoSiteForBuild,siaiLanguageAlternates} from "@/lib/seo/siai-domain-policy";
import {SIAI_DISCOVERY} from "@/lib/siai-search-discovery";
import {SHARE_IMAGE_URL,SHARE_IMAGES} from "@/lib/share-image";
import {siaiLandingShouldIndex} from "@/lib/siai-seo-policy";

const SITE=seoSiteForBuild(process.env.NEXT_PUBLIC_SITE_URL);
const BASE_METADATA:Metadata={
 title:{absolute:"全球AI排行榜与AI行情平台｜全球SI／SIAI排行榜｜灵犀场 LINGXIFIELD"},
 description:"找全球AI行情平台、全球AI排行榜、全球SI排行榜、全球SI行情平台、全球SIAI行情平台、全球SIAI排行榜？灵犀场按用途展示全球AI公司、模型、工具、免费额度、价格、地区和商用条件，并链接官方资料。",
 keywords:[...SIAI_DISCOVERY.zh.topics.map(t=>t.q),...SIAI_DISCOVERY.zh.extras,"灵犀场","LINGXIFIELD","全球AI工具行情","全球AI模型排行榜","AI工具推荐","AI模型API价格","AI视频生成平台","AI公司排行榜"],
 alternates:{canonical:SITE+"/siai",languages:siaiLanguageAlternates()},
 openGraph:{title:"全球AI排行榜与SIAI行情平台｜灵犀场",description:"全球AI、SI与SIAI工具目录：比较功能、价格、免费额度、地区条件和官方来源。",url:SITE+"/siai",images:SHARE_IMAGES},
 twitter:{card:"summary_large_image",images:[SHARE_IMAGE_URL]},
 robots:{index:siaiLandingShouldIndex(),follow:true}
};

export function generateMetadata():Metadata{
 const site=SITE;
 return {...BASE_METADATA,
  alternates:{canonical:site+"/siai",languages:siaiLanguageAlternates()},
  openGraph:{...BASE_METADATA.openGraph,url:site+"/siai"}
 };
}

export default function Home(){
 const canonical=SITE+"/siai";
 const {curated,rows}=getSiaiDirectoryRows();
 const faqld={"@context":"https://schema.org","@type":"FAQPage","@id":canonical+"#faq",
  mainEntity:SIAI_DISCOVERY.zh.topics.map(t=>({"@type":"Question",name:t.q,acceptedAnswer:{"@type":"Answer",text:t.rank}}))};
 const jsonld={"@context":"https://schema.org","@type":"CollectionPage",name:"全球 SIAI 排行榜",
  alternateName:SIAI_DISCOVERY.zh.topics.map(t=>t.q),keywords:[...SIAI_DISCOVERY.zh.topics.map(t=>t.q),...SIAI_DISCOVERY.zh.extras].join(", "),
  about:[{"@type":"Thing",name:"AI / SI tools"},{"@type":"Thing",name:"AI software pricing and free tiers"}],
  url:canonical,description:"灵犀场全球 SIAI 排行榜，按功能、模型、免费额度、价格、地区、付款方式及公司背景比较 SI/AI 工具与厂商。",
  mainEntity:{"@type":"ItemList",numberOfItems:curated.length,itemListElement:curated.map((r,i)=>({
   "@type":"ListItem",position:i+1,name:r.name,url:r.website
  }))}};
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonld).replace(/</g,"\\u003c")}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqld).replace(/</g,"\\u003c")}}/><Nav/><SiaiPartnerLink/><SiaiRankingHome rows={rows}/><Footer/></>;
}
