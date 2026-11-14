import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(p)=>readFileSync(p,"utf8");
test("public brand is SASI intelligent software and old shopping labels are retired",()=>{
 for(const p of ["components/SasiOpenMarketplace.tsx","app/sasi/page.tsx","app/sasi/marketplace/page.tsx","app/sasi/marketplace/[id]/page.tsx"]){
  const src=read(p);
  assert.doesNotMatch(src,/软件商城|SASI Marketplace/);
 }
 const page=read("components/SasiOpenMarketplace.tsx");
 assert.ok(page.includes('data-hero-asset="sasi-market-hero-lingxifield.png"'),"the exact supplied hero is the marketplace brand surface");
 assert.ok(page.includes('src="/images/sasi/sasi-market-hero-lingxifield.png"'));
 assert.ok(page.includes("灵犀场 SASI 智能软件市场"),"accessible brand description matches the supplied artwork");
 assert.match(read("app/sasi/page.tsx"),/canonical:"\/sasi"/);
 assert.match(read("app/sasi/marketplace/page.tsx"),/permanentRedirect\("\/sasi"\)/);
 const nav=read("components/Nav.tsx"),footer=read("lib/footer-unified-copy.ts");
 assert.match(nav,/SASI 智能软件市场/);assert.match(nav,/SASI Intelligent Software Marketplace/);
 assert.doesNotMatch(footer,/短剧制作成本|short-film production|短編制作|단편 제작|courts-métrages|Kurzfilm|cortos y créditos|curtas-metragens|الأفلام القصيرة/);
 const llms=read("app/llms.txt/route.ts"),staticLlms=read("public/llms.txt");
 for(const source of [llms,staticLlms]){assert.match(source,/SASI Software Marketplace/);assert.doesNotMatch(source,/AI Short Drama Generator|book-to-ai-agent|learning-ai-agent|research-ai-agent|ai-website-builder/);}
 for(const path of ["docs/R6_GROWTH_SEO_GEO_BLUEPRINT.md","docs/R8_GLOBAL_GROWTH_SASI_STRATEGY.md","docs/SASI-PLATFORM-STRATEGY.md"]){
  const source=read(path);assert.doesNotMatch(source,/短剧创作|短剧制作|书本智能体|学习智能体|科研智能体|short drama|short-film production|book-to-ai-agent|learning-ai-agent|research-ai-agent|ai-website-builder/);
 }
});
test("Copernicus SI only offers the source-code license across catalogue and delivery copy",()=>{
 const cat=read("lib/sasi-software/catalog.ts"),delivery=read("app/sasi/delivery/page.tsx");
 assert.match(cat,/priceCny:6900,priceUsd:6900/);
 assert.match(cat,/kind:"source" as const/);
 assert.doesNotMatch(delivery,/标准授权|可选源码授权|标准安装包与源码版本分别授权/);
 assert.match(delivery,/当前仅提供源码授权版，不提供非源码版本/);
 assert.match(delivery,/以实时商品信息和订单记录为准/);
});
