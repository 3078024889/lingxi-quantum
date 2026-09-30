import {LINGXIFIELD_RELEASE} from "@/lib/release/version";
export const SITE="https://lingxifield.com";
export const BRAND={
  name:"灵犀场 LINGXIFIELD",
  categoryZh:"全球智能工具与 SASI 创作生态平台",
  categoryEn:"Global Intelligent Tools & SASI Creative Ecosystem",
  slogan:"一键创造，一念即达。",
  descriptionZh:"灵犀场把文件、图片、视频、网页、资料与创作需求直接处理成可继续使用的结果，并提供 SASI 创作、学习、科研与网站构建能力。",
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
