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
 const source=readFileSync(file,"utf8");
 // Search queries route to external model discovery; they are not product offers.
 const content=file==="components/HomeProblemHub.tsx"?source.replace(/function submit\(e:FormEvent\)\{[^\n]+/,""):source;
 for(const pattern of forbidden)assert.doesNotMatch(content,pattern,file+" contains retired product copy");
}
const terms=["全球SIAI排行榜","全球AI行情平台","全球AI排行榜","全球SI排行榜","全球SI行情平台","全球SIAI行情平台"];
for(const file of ["app/layout.tsx","docs/seo/keyword-map-v216.md","public/seo-keywords-9lang.json","public/llms.txt","public/llms-full.txt"]){
 const source=readFileSync(file,"utf8");
 // Search queries route to external model discovery; they are not product offers.
 const content=file==="components/HomeProblemHub.tsx"?source.replace(/function submit\(e:FormEvent\)\{[^\n]+/,""):source;
 for(const term of terms)assert.ok(content.includes(term),file+" missing "+term);
}
const home=readFileSync("components/HomeProblemHub.tsx","utf8");
assert.doesNotMatch(home.replace(/function submit\(e:FormEvent\)\{[^\n]+/,""),/aivideo|texttovideo|imagetovideo|视频生成|文生视频|图生视频/i);
assert.ok(home.includes('new URL("/siai",location.origin)'),"model queries must retain SIAI discovery routing");
const market=readFileSync("components/SasiOpenMarketplace.tsx","utf8");
assert.match(market,/\/images\/global-scene-20261114\.webp/);
console.log("RETIRED_SASI_PUBLIC_COPY_AND_SIX_GEO_TERMS=PASS");


const keywordMap=JSON.parse(readFileSync("public/seo-keywords-9lang.json","utf8"));
for(const locale of ["zh","en","ja","ko","fr","de","es","pt","ar"]){
 assert.ok(Array.isArray(keywordMap[locale])&&keywordMap[locale].length>=22,"missing nine-language SEO keyword set: "+locale);
}

const legalCopy=readFileSync("components/SasiLegalBody.tsx","utf8");
assert.doesNotMatch(legalCopy,/SI9[.]5|SI 9[.]5|SI\s*11[.]6/i);
assert.match(legalCopy,/Copernicus SI|哥白尼 SI/);
const firstPartyCatalog=readFileSync("lib/sasi-software/catalog.ts","utf8");
assert.ok(firstPartyCatalog.includes("Copernicus SI · MT5 Source Code License"));
assert.doesNotMatch(firstPartyCatalog,/SI9[.]5|SI 9[.]5|SI\s*11[.]6/i);

const growth=readFileSync("components/HomeGlobalGrowth.tsx","utf8");
for(const term of ["124 个工具目录","llms.txt","llms-full.txt","WordPress","JS Widget","Before / After","global-scene-20261114.webp","SIAI","SASI 智能软件市场"]){
 assert.ok(growth.includes(term),"homepage growth experience missing "+term);
}
assert.doesNotMatch(growth,/R6\s*\+?\s*R8|R6|R8|内部工程|部署平台|候选版本/i);
const homeCss=readFileSync("app/home-afternoon-20261114.css","utf8");
for(const selector of [".lx-home-hero-art",".lx-home-feature-strip",".lx-home-growth-grid",".lx-home-toolpass",".lx-home-plan-grid",".lx-home-popular-tools"]){
 assert.ok(homeCss.includes(selector),"homepage visual style missing "+selector);
}
const homePage=readFileSync("app/page.tsx","utf8");
assert.ok(homePage.includes("#global-growth-entrances"));
console.log("GLOBAL_HOME_GROWTH_ENTRANCES=PASS");
