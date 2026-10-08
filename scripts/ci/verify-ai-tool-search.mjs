import assert from "node:assert/strict";
import {searchToolItems,scoreToolIntent} from "../../lib/tools/search-intents-v44r2.mjs";
const tools=[
 {href:"/tools/ai-image-check",titleZh:"AI 图片检测",titleEn:"AI Image Analysis",descZh:"分析图片可能的 AI 生成痕迹"},
 {href:"/tools/ai-video-audio-check",titleZh:"AI 视频与音频检测",titleEn:"AI Video and Audio Analysis",descZh:"分析视频画面和人声"},
 {href:"/tools/file-type-detector",titleZh:"文件真实格式检测",titleEn:"File Type Detector",descZh:"检测文件格式"}
];
const cases=[
 ["AI图片","ai-image-check"],["AI图像检测","ai-image-check"],["图片是不是AI生成","ai-image-check"],
 ["AI视频","ai-video-audio-check"],["AI视频检测","ai-video-audio-check"],["AI音频","ai-video-audio-check"],
 ["AI换脸检测","ai-video-audio-check"],["deepfake video","ai-video-audio-check"],
 ["文件格式检测","file-type-detector"]
];
for(const [query,slug] of cases){
 const result=searchToolItems(tools,query,"all",()=> "all",()=> "");
 assert.equal(result[0]?.href,`/tools/${slug}`,`Search failed: ${query}`);
 assert.ok(scoreToolIntent(tools.find(t=>t.href===`/tools/${slug}`),query)>0);
}
console.log(`AI_TOOL_SEARCH_PASS cases=${cases.length}`);
