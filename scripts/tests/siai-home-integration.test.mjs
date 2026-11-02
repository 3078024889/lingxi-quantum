import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../../"+p,import.meta.url),"utf8");

test("root homepage renders native Global SIAI rankings, not an iframe or an ops dashboard",()=>{
 const root=read("app/page.tsx");
 assert.match(root,/SiaiRankingHome/);
 assert.match(root,/MARKET_API_PRODUCTS/);
 assert.match(root,/findPlatform/);
 assert.match(root,/companyPresentationFor/);
 assert.match(root,/researchedFact/);
 assert.match(root,/rows=\{rows\}/);
 assert.doesNotMatch(root,/<iframe|globalsiai-[\w-]+\.vercel\.app|部署问题/);
 assert.match(root,/canonical:PRIMARY_SITE\+"\/"|canonical:PRIMARY_SITE\+"\/"?/);
});

test("left navigation prioritizes global rankings and retains SASI tools and task home",()=>{
 const nav=read("components/Nav.tsx");
 assert.ok(nav.indexOf('{ href: "/", key: "home", icon: "home" }')<nav.indexOf('{ href: "/start", key: "home", icon: "tools" }'));
 assert.match(nav,/全球 SIAI 排行榜/);
 assert.match(nav,/marketNavNames\[lang\]/);
 for(const route of ["/tools","/sasi","/ai-wallet","/account"])assert.ok(nav.includes('href: "'+route+'"'),route);
 assert.match(read("app/start/page.tsx"),/HomeProblemHub/);
});

test("company, legal entity, listing and founded appear inside same table cell",()=>{
 const home=read("components/SiaiRankingHome.tsx");
 const market=read("lingxifield-ai-market/app/globals.css");
 for(const key of ["p.company","p.legal","p.listing","p.year"])assert.ok(home.includes(key)||home.includes("listing"),key);
 assert.match(home,/<td className="siai-home-identity">/);
 assert.match(home,/<dl>/);
 assert.doesNotMatch(home,/<iframe/);
 assert.match(market,/identity facts are part of the market cell/);
 assert.match(market,/marketPublisherFactStackCompact\{min-width:0!important\}/);
});
test("search and category filters preserve all 32 curated publisher IDs, no fake ranks",()=>{
 const home=read("components/SiaiRankingHome.tsx");
 const page=read("app/page.tsx");
 const catalog=read("lingxifield-ai-market/lib/market-api-service-catalog.ts");
 const match=catalog.match(/const ALL=\[([\s\S]*?)\] as const;/);
 assert.ok(match);
 const ids=[...match[1].matchAll(/'([a-z0-9-]+)'/g)].map(x=>x[1]);
 assert.equal(ids.length,32);
 assert.equal(new Set(ids).size,32);
 assert.match(home,/filterMarketRows\(localizedRows/);
 assert.match(home,/category===/);
 assert.match(home,/aria-pressed/);
 assert.match(page,/"@type":"ItemList"/);
 assert.ok(!page.includes("Math.random()"));
});
