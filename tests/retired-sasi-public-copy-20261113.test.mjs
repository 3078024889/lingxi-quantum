import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const files=[
 "app/layout.tsx","lib/lingxi-i18n.ts","components/HomeProblemHub.tsx",
 "components/SasiLegalBody.tsx","miniapp/README.md","docs/seo/keyword-map-v216.md",
 "public/seo-keywords-9lang.json","public/llms.txt","public/llms-full.txt"
];
const forbidden=[
 /AI短剧|短剧生成|AI视频生成|文生视频|图生视频|书本智能体|学习智能体|科研智能体|AI网站生成/i,
 /AI short drama generator|AI video generator|book to AI agent|AI research assistant|AI study assistant|AI website builder/i,
 /AI ショートドラマ|AI 動画生成|書籍 AI|研究 AI|学習 AI|AI Webサイト作成/i,
 /AI 숏폼 드라마|AI 영상 생성|책 AI 에이전트|AI 연구 도우미|AI 학습 도우미|AI 웹사이트 만들기/i,
 /mini-série IA|livre agent IA|assistant recherche IA|assistant étude IA|créateur site IA/i,
 /KI Kurzdrama|Buch KI Agent|KI Forschungsassistent|KI Lernassistent|KI Website erstellen/i,
 /minidrama IA|livro para agente IA|assistente pesquisa IA|assistente estudo IA|criar site com IA/i,
 /دراما قصيرة بالذكاء الاصطناعي|كتاب إلى وكيل ذكاء اصطناعي|مساعد بحث بالذكاء الاصطناعي|مساعد دراسة بالذكاء الاصطناعي|إنشاء موقع بالذكاء الاصطناعي/i
];
for(const file of files){
 const content=readFileSync(file,"utf8");
 for(const pattern of forbidden)assert.doesNotMatch(content,pattern,file+" contains retired product copy");
}
const terms=["全球SIAI排行榜","全球AI行情平台","全球AI排行榜","全球SI排行榜","全球SI行情平台","全球SIAI行情平台"];
for(const file of ["app/layout.tsx","docs/seo/keyword-map-v216.md","public/seo-keywords-9lang.json","public/llms.txt","public/llms-full.txt"]){
 const content=readFileSync(file,"utf8");
 for(const term of terms)assert.ok(content.includes(term),file+" missing "+term);
}
const home=readFileSync("components/HomeProblemHub.tsx","utf8");
assert.doesNotMatch(home,/aivideo|texttovideo|imagetovideo|视频生成|文生视频|图生视频/i);
const market=readFileSync("components/SasiOpenMarketplace.tsx","utf8");
assert.match(market,/\/images\/sasi\/sasi-market-hero-lingxifield\.png/);
console.log("RETIRED_SASI_PUBLIC_COPY_AND_SIX_GEO_TERMS=PASS");


const keywordMap=JSON.parse(readFileSync("public/seo-keywords-9lang.json","utf8"));
for(const locale of ["zh","en","ja","ko","fr","de","es","pt","ar"]){
 assert.ok(Array.isArray(keywordMap[locale])&&keywordMap[locale].length>=22,"missing nine-language SEO keyword set: "+locale);
}

const legalCopy=readFileSync("components/SasiLegalBody.tsx","utf8");
assert.doesNotMatch(legalCopy,/short drama|Kurzdrama|séries courtes|dramas y vídeos|dramas e vídeos|الدراما والفيديو الجديدة|동영상 신규 생성|SI9\\.5|SI 9\\.5/i);
assert.match(legalCopy,/Copernicus SI 11\\.6/);
