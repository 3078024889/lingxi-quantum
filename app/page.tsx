import {publicPageMetadata} from "@/lib/seo/page-metadata";
import {pageGeoFact} from "@/lib/seo/site-facts";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HomeProblemHub from "@/components/HomeProblemHub";
import HomeSeoAnswers from "@/components/HomeSeoAnswers";
import {PUBLIC_FEATURE_COPY,PUBLIC_SEARCH_TITLES} from "@/lib/public-feature-copy";

export const dynamic="force-dynamic";
export const revalidate=0;

const homeFact=pageGeoFact("home","zh");
export const metadata:Metadata=publicPageMetadata("zh","/",PUBLIC_SEARCH_TITLES.zh,PUBLIC_FEATURE_COPY.zh.description);

const HOME_STRUCTURED_DATA=[
 {
  "@context":"https://schema.org",
  "@type":"WebPage",
  "@id":homeFact.com+"#webpage",
  name:PUBLIC_SEARCH_TITLES.zh,
  url:homeFact.com,
  isPartOf:{"@id":homeFact.com+"#website"},
  description:PUBLIC_FEATURE_COPY.zh.description,
  inLanguage:"zh-CN",
  hasPart:[
   {"@type":"CollectionPage",name:"全球 SIAI 排行榜",url:homeFact.com+"siai"},
   {"@type":"WebPage",name:"SASI 智能软件市场",url:homeFact.com+"sasi"},
   {"@type":"CollectionPage",name:"免费在线实用工具",url:homeFact.com+"tools"}
  ]
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
   "全球 SIAI 排行榜：AI 公司、模型、功能、价格和免费额度对比",
   "SASI 智能软件市场与开发者发布",
   "MT5 EA与源码授权",
   "私有数字软件交付",
   "软件订单与授权管理",
   "100+在线实用工具，每日免费体验",
   "PDF、图片、视频音频、文件表格、开发者与隐私工具"
  ]
 }
];

export default function Home(){return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(HOME_STRUCTURED_DATA)}}/><Nav/><HomeProblemHub/><HomeSeoAnswers locale="zh"/><Footer/></>;}
