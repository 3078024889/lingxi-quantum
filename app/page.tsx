import {publicPageMetadata} from "@/lib/seo/page-metadata";
import {pageGeoFact} from "@/lib/seo/site-facts";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HomeProblemHub from "@/components/HomeProblemHub";
import {PUBLIC_FEATURE_COPY,PUBLIC_SEARCH_TITLES} from "@/lib/public-feature-copy";

export const dynamic="force-dynamic";
export const revalidate=0;

const homeFact=pageGeoFact("home","zh");
export const metadata:Metadata=publicPageMetadata("zh","/",PUBLIC_SEARCH_TITLES.zh,PUBLIC_FEATURE_COPY.zh.description);

const HOME_STRUCTURED_DATA=[
 {
  "@context":"https://schema.org",
  "@type":"WebSite",
  name:"灵犀场 LINGXIFIELD",
  alternateName:"LINGXIFIELD",
  url:homeFact.com,
  description:PUBLIC_FEATURE_COPY.zh.description,
  inLanguage:["zh-CN","en","ja","ko","fr","de","es","pt","ar"]
 },
 {
  "@context":"https://schema.org",
  "@type":"SoftwareApplication",
  name:"灵犀场 LINGXIFIELD",
  applicationCategory:"ProductivityApplication",
  operatingSystem:"Web",
  url:homeFact.com,
  description:PUBLIC_FEATURE_COPY.zh.description,
  featureList:[
   "SASI多模型智能创作",
   "AI短剧生成",
   "网站构建",
   "书本问答",
   "学习与科研",
   "100+免费在线实用工具",
   "PDF、图片、视频音频、文件表格、开发者与隐私工具"
  ]
 }
];

export default function Home(){return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(HOME_STRUCTURED_DATA)}}/><Nav/><HomeProblemHub/><Footer/></>;}
