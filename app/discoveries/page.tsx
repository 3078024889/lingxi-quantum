import type {Metadata} from "next";
import GrowthPageShell from "@/components/seo/GrowthPageShell";
import DiscoveriesHub,{DISCOVERIES_META} from "@/components/seo/DiscoveriesHub";
import {publicPageMetadata} from "@/lib/seo/page-metadata";

const meta=DISCOVERIES_META.zh;
export const metadata:Metadata=publicPageMetadata("zh","/discoveries",meta.title,meta.description);
export default function DiscoveriesPage(){
 return <GrowthPageShell locale="zh" eyebrow="DISCOVERY LAB · EVIDENCE FIRST" title={meta.title} description={meta.description}>
  <DiscoveriesHub locale="zh"/>
 </GrowthPageShell>;
}
