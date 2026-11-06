import type {Metadata} from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SpendDiagnostic from "@/components/siai/SpendDiagnostic";
import {getVerifiedSiaiOptions} from "@/lib/siai/verified-spend-options";
import {siaiLandingShouldIndex} from "@/lib/siai-seo-policy";
import {PRIMARY_SITE} from "@/lib/seo/site-domains";
import {SEO_LOCALES,localePath,type SeoLocale} from "@/lib/seo/global-seo";
const languages=Object.fromEntries((Object.keys(SEO_LOCALES) as SeoLocale[]).map(l=>[SEO_LOCALES[l].hreflang,PRIMARY_SITE+localePath(l,"/siai/spend-diagnostic")]));
export const metadata:Metadata={
 title:"免费AI花费诊断｜检查订阅浪费与潜在节省｜灵犀场 LINGXIFIELD",
 description:"不上传账单，不连接银行，不需注册。免费估算SI/AI订阅支出、低使用率与可节省的费用。可查看计算逻辑与限制。",
 alternates:{canonical:PRIMARY_SITE+"/siai/spend-diagnostic",languages},
 robots:{index:siaiLandingShouldIndex(),follow:true}
};
export default function Page(){return <><Nav/><SpendDiagnostic candidates={getVerifiedSiaiOptions()}/><Footer/></>;}
