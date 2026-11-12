import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const retired=/短剧制作|短剧创作|短剧成本|书本智能体|学习智能体|科研智能体|short-film production|short drama|book-to-ai-agent|learning-ai-agent|research-ai-agent|ai-website-builder/i;

test("public SASI metadata and navigation describe the intelligent software marketplace",()=>{
 const page=read("app/sasi/page.tsx");
 const nav=read("components/Nav.tsx");
 const marketplace=read("components/SasiOpenMarketplace.tsx");
 assert.match(page,/SASI 智能软件市场/);
 assert.match(nav,/SASI 智能软件市场/);
 assert.match(nav,/SASI Intelligent Software Marketplace/);
 assert.match(marketplace,/智能软件市场/);
 for(const content of [page,nav,marketplace]) assert.doesNotMatch(content,retired);
});

test("public LLM discovery copy has no retired SASI workflow positioning",()=>{
 const generated=read("app/llms.txt/route.ts");
 const staticCopy=read("public/llms.txt");
 const fullGenerator=read("scripts/seo/growth/generate-llms-full.mjs");
 for(const content of [generated,staticCopy,fullGenerator]) assert.doesNotMatch(content,retired);
 assert.match(generated,/SASI Software Marketplace/);
 assert.match(generated,/MT5 EAs/);
});

test("SEO/GEO and SASI platform docs follow the current marketplace contract",()=>{
 const r6=read("docs/R6_GROWTH_SEO_GEO_BLUEPRINT.md");
 const r8=read("docs/R8_GLOBAL_GROWTH_SASI_STRATEGY.md");
 const platform=read("docs/SASI-PLATFORM-STRATEGY.md");
 for(const content of [r6,r8,platform]) assert.doesNotMatch(content,retired);
 assert.match(r6,/SEO \+ GEO/);
 assert.match(r8,/SASI 市场交易闭环/);
 assert.match(platform,/交易与交付不变量/);
});
