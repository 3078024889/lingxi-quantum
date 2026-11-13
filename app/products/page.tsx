import type {Metadata} from "next";
import {publicPageMetadata} from "@/lib/seo/page-metadata";
import {pageGeoFact} from "@/lib/seo/site-facts";
import GrowthPageShell from "@/components/seo/GrowthPageShell";
import ProductDirectory from "@/components/seo/ProductDirectory";
import {SEO_LOCALES} from "@/lib/seo/global-seo";

const productsFact=pageGeoFact("products","zh");
export const metadata:Metadata=publicPageMetadata("zh","/products",productsFact.title,productsFact.description);

export default function Page(){
 return <GrowthPageShell locale="zh" eyebrow={SEO_LOCALES.zh.toolsTitle} title={productsFact.title} description={productsFact.description}>
  <ProductDirectory locale="zh"/>
 </GrowthPageShell>;
}
