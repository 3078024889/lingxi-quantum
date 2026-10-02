import {LINGXIFIELD_RELEASE} from "@/lib/release/version";
export const SITE="https://lingxifield.com";
export const BRAND={
  name:"灵犀场 LINGXIFIELD",
  categoryZh:"SASI智能生态与全球智能工具平台",
  categoryEn:"Global Intelligent Tools & SASI Creative Ecosystem",
  slogan:"一键创造，一念即达。",
  descriptionZh:"AI短剧生成、网站构建、书本SASI、学习SASI、科研SASI，以及PDF、图片、视频、OCR、临时邮箱、阅后即焚等实用工具。",
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
