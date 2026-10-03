import {LINGXIFIELD_RELEASE} from "@/lib/release/version";
export const SITE="https://lingxifield.com";
export const BRAND={
  name:"灵犀场 LINGXIFIELD",
  categoryZh:"SASI智能生态与全球智能工具平台",
  categoryEn:"Global Intelligent Tools & SASI Creative Ecosystem",
  slogan:"一键创造，一念即达。",
  descriptionZh:"浏览器本地的免费工具和单独标明的付费工具，以及书本、学习与科研资料空间。SASI 是预充值余额，不是会员。短剧、导演和网站构建还不是已完成的产品。",
  release:LINGXIFIELD_RELEASE.website
} as const;
export const LOCALES=["zh","en","ja","ko","fr","de","es","pt","ar"] as const;
export function hreflang(path="/"){
 const p=path.startsWith("/")?path:`/${path}`;
 return Object.fromEntries(LOCALES.map(l=>[l==="zh"?"zh-CN":l,l==="zh"?`${SITE}${p}`:`${SITE}/${l}${p==="\/"?"":p}`]));
}
export function publicTemplateIndexable(v:{visibility?:string;review_status?:string}){
 return v.visibility==="public"&&v.review_status==="approved";
}
