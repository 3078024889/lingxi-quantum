import type {Metadata} from "next";
import {notFound} from "next/navigation";
import Nav from "@/components/Nav";
import SiaiPartnerLink from "@/components/SiaiPartnerLink";
import Footer from "@/components/Footer";
import SiaiRankingHome from "@/components/SiaiRankingHome";
import {getSiaiDirectoryRows} from "../../siai/catalog-data";
import {SIAI_DISCOVERY} from "@/lib/siai-search-discovery";
import {PRIMARY_SITE} from "@/lib/seo/site-domains";
import {SHARE_IMAGE_URL,SHARE_IMAGES} from "@/lib/share-image";
import {LOCALIZED_LOCALES,SEO_LOCALES,isSeoLocale,localePath} from "@/lib/seo/global-seo";
import {siaiLanguageAlternates} from "@/lib/seo/siai-domain-policy";
import {siaiLandingShouldIndex} from "@/lib/siai-seo-policy";

export const dynamicParams=false;
type Props={params:Promise<{locale:string}>};
export function generateStaticParams(){return LOCALIZED_LOCALES.map(locale=>({locale}))}
const languages=siaiLanguageAlternates();
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {locale}=await params;
 if(!isSeoLocale(locale)||locale==="zh")return {robots:{index:false,follow:false}};
 const copy=SIAI_DISCOVERY[locale],url=PRIMARY_SITE+localePath(locale,"/siai");
 return {
  title:{absolute:copy.rankTitle+" | LINGXIFIELD"},
  description:copy.rankIntro+" "+copy.topics.map(t=>t.q).join(" · "),
  keywords:[...copy.topics.map(t=>t.q),...copy.extras,"LINGXIFIELD","SIAI"],
  alternates:{canonical:url,languages},
  openGraph:{title:copy.rankTitle+" | LINGXIFIELD",description:copy.rankIntro,url,images:SHARE_IMAGES},
  twitter:{card:"summary_large_image",title:copy.rankTitle+" | LINGXIFIELD",images:[SHARE_IMAGE_URL]},
  robots:{index:siaiLandingShouldIndex(),follow:true}
 };
}
export default async function LocalizedSiaiDirectory({params}:Props){
 const {locale}=await params;
 if(!isSeoLocale(locale)||locale==="zh")notFound();
 const c=SEO_LOCALES[locale],copy=SIAI_DISCOVERY[locale],canonical=PRIMARY_SITE+localePath(locale,"/siai");
 const {curated,rows}=getSiaiDirectoryRows();
 const jsonld={"@context":"https://schema.org","@type":"CollectionPage",
  name:copy.rankTitle,inLanguage:c.hreflang,url:canonical,
  description:copy.rankIntro,alternateName:copy.topics.map(t=>t.q),
  mainEntity:{"@type":"ItemList",numberOfItems:curated.length,itemListElement:curated.map((r,i)=>({
   "@type":"ListItem",position:i+1,name:r.name,url:r.website
  }))}};
 const faqld={"@context":"https://schema.org","@type":"FAQPage",
  "@id":canonical+"#faq",inLanguage:c.hreflang,
  mainEntity:copy.topics.map(t=>({"@type":"Question",name:t.q,acceptedAnswer:{"@type":"Answer",text:t.rank}}))};
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonld).replace(/</g,"\\u003c")}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqld).replace(/</g,"\\u003c")}}/><Nav/><SiaiPartnerLink/><div lang={c.hreflang} dir={c.dir}><div className="lx-growth-siai-page"><SiaiRankingHome rows={rows}/></div></div><Footer/></>;
}
