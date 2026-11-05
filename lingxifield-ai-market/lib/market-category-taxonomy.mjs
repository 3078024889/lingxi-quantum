/**
 * Search-facing category aliases do not alter source categories or imply unsupported capabilities.
 * A product can have one canonical navigation group while maintaining multiple
 * independently verified feature tags. Keep this map exhaustive and reviewed.
 */
export const NAVIGATION_GROUPS=Object.freeze([
 "综合助手","搜索研究","图片设计","视频生成","视频剪辑","语音音乐",
 "编程开发","企业智能体","自动化工具","办公演示","模型/API"
]);
export const CATEGORY_TO_GROUP=Object.freeze({
 "AI视频":"视频生成","视频":"视频生成","视频生成":"视频生成","数字人视频":"视频生成",
 "视频剪辑":"视频剪辑",
 "图片":"图片设计","图片设计":"图片设计","设计":"图片设计",
 "图片视频":"视频生成","多模态创作":"图片设计",
 "语音音乐":"语音音乐","语音API":"语音音乐",
 "编程":"编程开发","编程开发":"编程开发",
 "综合助手":"综合助手","系统智能助手":"综合助手",
 "搜索研究":"搜索研究","学术研究":"搜索研究","企业数据AI":"搜索研究",
 "企业智能体":"企业智能体",
 "自动化工具":"自动化工具",
 "办公工具":"办公演示","文档":"办公演示","演示":"办公演示",
 "演示文稿":"办公演示","写作营销":"办公演示",
 "企业模型API":"模型/API","模型API":"模型/API","模型托管API":"模型/API",
 "模型开发":"模型/API","聚合模型":"模型/API","图像音频API":"模型/API"
});
const LEGACY_ALIASES=Object.freeze({
 "图片创作":"图片设计","图片生成":"图片设计","图像生成":"图片设计","生成图片":"图片设计",
 "视频创作":"视频生成","短视频生成":"视频生成","文生视频":"视频生成",
 "智能代理":"企业智能体","Agent":"企业智能体","智能工作流":"自动化工具",
 "AI编程":"编程开发","编程建站":"编程开发",
 "语言模型API":"模型/API"
});
export function canonicalSiaiCategory(category){
 if(typeof category!=="string")return null;
 const label=category.normalize("NFKC").trim();
 return CATEGORY_TO_GROUP[label]||LEGACY_ALIASES[label]||null;
}
export function validateSiaiTaxonomy(products){
 if(!Array.isArray(products))throw Error("SIAI_TAXONOMY_INVALID_PRODUCTS");
 const unclassified=[],groups={},unknown=[];
 for(const p of products){
  const canonical=canonicalSiaiCategory(p?.category);
  if(!canonical){unclassified.push({id:p?.id,category:p?.category});continue}
  if(!NAVIGATION_GROUPS.includes(canonical))unknown.push({id:p?.id,canonical});
  groups[canonical]=(groups[canonical]||0)+1;
 }
 return {total:products.length,classified:products.length-unclassified.length,
  unclassified,unknown,groups,groupCount:Object.keys(groups).length};
}
