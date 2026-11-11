import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const root=new URL("../",import.meta.url);
const read=(path)=>readFileSync(new URL(path,root),"utf8");
const catalog=read("lib/siai-search-discovery.ts");
const page=read("app/siai/page.tsx"),layout=read("app/layout.tsx");
const home=read("components/HomeProblemHub.tsx"),rank=read("components/SiaiRankingHome.tsx");
const footer=read("components/Footer.tsx");
const declaration=catalog.indexOf("export const SIAI_DISCOVERY");
const data=JSON.parse(catalog.slice(catalog.indexOf("={",declaration)+1).trim().replace(/;\s*$/,""));
const langs=["zh","en","ja","ko","fr","de","es","pt","ar"];
const keywords=["全球AI行情平台","全球AI排行榜","全球SI排行榜","全球SI行情平台","全球SIAI行情平台","全球SIAI排行榜"];
test("nine-language search-intent sections have six distinct human-readable topic answers",()=>{
 assert.deepEqual(Object.keys(data),langs);
 for(const lang of langs){
  const d=data[lang];assert.equal(d.topics.length,6);
  assert.equal(new Set(d.topics.map(t=>t.q)).size,6);
  for(const x of d.topics){
   assert(x.q.trim().length>=6);
   assert(x.home.trim().length>=25,x.q+" home text");
   assert(x.rank.trim().length>=25,x.q+" ranking text");
   assert.notEqual(x.home,x.rank);
  }
  assert.equal(d.trio.length,3);assert(d.extras.length>=5);
 }
 assert.deepEqual(data.zh.topics.map(t=>t.q),keywords);
 assert(!data.en.topics.some(t=>/[\u4e00-\u9fff]/.test(t.q)));
});
test("search terms visible in page title, center, footer and JSON-LD; exact canonical remains stable",()=>{
 for(const s of keywords)assert(layout.includes(s)||page.includes(s)||catalog.includes(s),s);
 assert.match(home,/SIAI_DISCOVERY\[lang\]\.hero/);
 assert.match(home,/<SiaiSearchDiscovery variant="home"\/>/);
 assert.match(rank,/<SiaiSearchDiscovery variant="ranking"\/>/);
 assert.match(footer,/discovery\.topics\.map\(\(topic,i\)=>/);
 assert.match(footer,/discovery\.topics\.map\(\(topic,i\)=>/);
 assert.match(footer,/href=\{"\/siai#siai-search-ranking-"\+i\}/);
 assert.match(footer,/FOOTER_BRAND_SHORT\[lang\]/);
 assert.match(page,/alternateName:SIAI_DISCOVERY\.zh\.topics/);
 assert.match(page,/"@type":"FAQPage"/);
 assert.match(read("app/llms.txt/route.ts"),/SIAI_DISCOVERY\.zh\.topics/);
 assert.match(read("public/llms-full.txt"),/Global AI \/ SI \/ SIAI rankings/);
 assert.match(page,/const \{curated,rows\}=getSiaiDirectoryRows\(\)/);
 assert.match(page,/itemListElement:curated\.map/);
 if(/seoSiteForRequest/.test(page)){
  assert.match(page,/const h=await headers\(\)/);
  assert.match(page,/const site=seoSiteForRequest\(h\.get\("host"\),h\.get\("x-forwarded-host"\),h\.get\("x-lingxi-public-host"\)\)/);
  assert.match(page,/alternates:\{canonical:site\+"\/siai",languages:/);
  assert.match(page,/const canonical=site\+"\/siai"/);
 }else{
  assert.match(page,/const SITE=seoSiteForBuild\(process\.env\.NEXT_PUBLIC_SITE_URL\)/);
  assert.match(page,/alternates:\{canonical:SITE\+"\/siai",languages:/);
 }
 assert.doesNotMatch(page,/index:false/);
});
test("eight sourced corporate-history entries remain honest about parent/launch differences",()=>{
 const company=read("app/siai/candidate-company-evidence.ts");
 assert.match(company,/"figma-make"/);
 assert.match(company,/"listing": "listed_company"/);
 assert.match(company,/2013（Canva 上线）/);
 assert.match(company,/2010（Freepik 起始）/);
 assert.match(company,/https:\/\/www\.synthesia\.io\/about/);
});

test("the footer does not duplicate English copy or ranking SEO panels and six links still reach useful answers",()=>{
 const footer=read("components/Footer.tsx"),cards=read("components/SiaiSearchDiscovery.tsx");
 assert.match(footer,/lang==="zh"/);
 assert.doesNotMatch(footer,/lang="en"/);
 assert.doesNotMatch(footer,/isRankingRoute/);
 assert.match(footer,/<section className="lx-footer-unified lx-footer-v3-showcase"/);
 assert(rank.indexOf('<SiaiSearchDiscovery variant="ranking"/>')>rank.indexOf('className="siai-home-table-scroll"'));
 assert.match(read("lib/public-feature-copy.ts"),/全球AI行情平台、全球AI排行榜、全球SI排行榜/);
 assert.equal((footer.match(/PUBLIC_FEATURE_COPY\[lang\]\.description/g)||[]).length,0);
 assert.match(footer,/discovery\.topics\.map\(\(topic,i\)=>/);
 assert.match(footer,/siai-search-ranking-/);
 assert.match(cards,/id=\{prefix\+"-"\+i\}/);
});
test("nine-language FAQ body follows the language selection and spaced keywords reach SIAI instead of tools",()=>{
 const home=read("components/HomeProblemHub.tsx"),faq=read("components/HomeSeoAnswers.tsx");
 assert.match(faq,/"use client"/);
 assert.match(faq,/useLingxiLang\(\)/);
 assert.match(faq,/lang\|\|initialLocale/);
 assert.match(home,/replace\(\/\\s\+\/g,""\)/);
 assert.match(home,/"ai视频"/);
 assert.match(home,/url\.searchParams\.set\("q",v\)/);
 assert.match(home,/data-testid="home-task-search"/);
 assert.match(rank,/params\.get\("q"\)/);
 assert.match(rank,/setQuery\(incomingQuery\.trim\(\)\)/);
});
