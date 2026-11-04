import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const raw=read("lib/siai-search-discovery.ts");
const start=raw.indexOf("={",raw.indexOf("export const SIAI_DISCOVERY"));
const langs=JSON.parse(raw.slice(start+1).trim().replace(/;\s*$/,""));
test("all nine market discovery descriptions explain features, not unrelated stock data or internal process",()=>{
 assert.equal(Object.keys(langs).length,9);
 for(const [lang,c]of Object.entries(langs)){
  assert.equal(c.topics.length,6);
  const visible=[c.homeIntro,c.rankIntro,...c.topics.flatMap(x=>[x.home,x.rank])].join(" ");
  assert.doesNotMatch(visible,/股票|株価|주가|stock quotes|stock market|cours de bourse|Börsenkurse|cotizaciones bursátiles|preço das ações|أسهم/iu,lang);
  assert.doesNotMatch(visible,/未完成实测|未证实|研究预览|technical debt|发布门禁|审核状态/iu,lang);
  assert.doesNotMatch(visible,/\b(?:CI|QA)\b/u,lang);
  assert(c.topics.every(x=>x.rank.length>=25),lang);
 }
});
test("footer describes capabilities once in a full-width panel and avoids duplicate SEO paragraphs",()=>{
 const footer=read("components/Footer.tsx");
 assert.doesNotMatch(footer,/copy\[lang\]\.lead/);
 assert.equal((footer.match(/PUBLIC_FEATURE_COPY\[lang\]\.description/g)||[]).length,0);
 assert.doesNotMatch(footer,/lx-footer-trio/);
 assert.doesNotMatch(footer,/discovery\.footerNote/);
 assert.match(footer,/<section className="lx-footer-unified lx-footer-v3-showcase"/);
 assert.doesNotMatch(footer,/lang==="zh"&&<p lang="en"/);
 assert.match(read("components/SiaiRankingHome.tsx"),/<SiaiSearchDiscovery variant="ranking"\/>/);
 assert.match(footer,/discovery\.topics\.map\(\(topic,i\)=>/);
});
test("preview rows present clear product information without internal test-state prose or blanket region denials",()=>{
 const component=read("components/SiaiRankingHome.tsx");
 const candidate=read("app/siai/candidate-public.ts");
 assert.doesNotMatch(component,/官网资料 · 内容补充中|官网资料补充中|内容补充中/);
 assert.doesNotMatch(component,/尚未完成实际使用测试|real use untested/);
 assert.match(component,/previewValue\(p\[scope\]\)/);
 assert.match(component,/PREVIEW_RAW_LABEL/);
 assert.match(component,/const hasFact=/);
 assert.match(component,/value\?\.trim\(\)!=="尚无可靠资料"/);
 assert.match(component,/!hasFact\(value\)\?"":/);
 assert.doesNotMatch(component,/PREVIEW_FIELD/);
 assert(candidate.includes('region:regionSupplement?.localized.zh||text(region)'));
 assert.doesNotMatch(candidate,/并非逐国注册或支付验证/);
});
