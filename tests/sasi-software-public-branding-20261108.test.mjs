import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(p)=>readFileSync(p,"utf8");
test("public brand is SASI intelligent software and old shopping labels are retired",()=>{
 for(const p of ["components/SasiOpenMarketplace.tsx","app/sasi/page.tsx","app/sasi/marketplace/page.tsx","app/sasi/marketplace/[id]/page.tsx"]){
  const src=read(p);
  assert.doesNotMatch(src,/软件商城|SASI Software Marketplace|SASI Marketplace/);
 }
 assert.match(read("components/SasiOpenMarketplace.tsx"),/<h1><em>SASI<\\/em> \\{zh\\?"智能软件市场"/);
 assert.match(read("app/sasi/marketplace/page.tsx"),/canonical:"\/sasi"/);
});
test("Copernicus SI9.5 only offers the source-code license across catalogue and delivery copy",()=>{
 const cat=read("lib/sasi-software/catalog.ts"),delivery=read("app/sasi/delivery/page.tsx");
 assert.match(cat,/priceCny:6900,priceUsd:6900/);
 assert.match(cat,/kind:"source" as const/);
 assert.doesNotMatch(delivery,/标准授权|可选源码授权|标准安装包与源码版本分别授权/);
 assert.match(delivery,/仅提供 ¥6,900 源码授权版/);
});
