import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("Nine language legal notice and actual software offering",()=>{
 const legal=read("components/SasiLegalBody.tsx");
 for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"])
  assert.match(legal,new RegExp("^"+lang+":\\{","m"),lang);
 const catalog=read("lib/sasi-software/catalog.ts");
 assert.match(catalog,/sasi-copernicus-si95-source/);
 assert.doesNotMatch(catalog,/sasi-copernicus-si95-mt5/);
});
test("Old drama/image generation is not an active entrypoint",()=>{
 for(const path of ["app/sasi/image/page.tsx","app/sasi/drama/page.tsx"]){
  const s=read(path);assert.match(s,/redirect\("\/sasi"\)/);assert.match(s,/index:false/);
 }
 const nav=read("components/Nav.tsx");
 assert.doesNotMatch(nav,/href="\/sasi" className="lx11-top-link"/);
 assert.doesNotMatch(nav,/href="\/account\/software" className="lx11-top-link"/);
});
test("Public notices appear in the notification bell and account inbox",()=>{
 const helper=read("lib/notifications/unified-public-feed.ts");
 assert.match(helper,/\/api\/site-announcements/);
 assert.match(helper,/map\.has\(key\)/);
 assert.match(helper,/row\.platform==="miniapp"/);
 for(const path of ["components/NotificationBell.tsx","components/AccountNotificationsPanel.tsx"])
  assert.match(read(path),/loadUnifiedNotificationFeed/);
 const api=read("app/api/site-announcements/route.ts");
 assert.match(api,/lingxifield_announcements/);
});
test("Seller revenue split only in agreement, never public hero",()=>{
 const market=read("components/SasiOpenMarketplace.tsx");
 const [hero,consent]=market.split('const [adult,setAdult]');
 assert.doesNotMatch(hero,/85%|15%/);
 assert.match(market,/termsAccepted:terms/);
 assert.match(market,/平台收取 15% 服务费/);
 const meta=read("app/sasi/marketplace/page.tsx");
 assert.doesNotMatch(meta,/成交佣金15%/);
});
test("Real software checkout and tool passes remain fail-closed",()=>{
 const pass=read("app/api/tools/pass/route.ts");
 assert.match(pass,/PASS_COMMERCE_NOT_READY/);
 assert.match(pass,/isSameOriginMutation/);
 const software=read("components/SasiSoftwareMarket.tsx");
 assert.match(software,/available===true/);
 const imagery=read("components/SasiOpenMarketplace.module.css");
 assert.match(imagery,/\.crystalCup/);assert.match(imagery,/\.alienPlant/);
});

test("All retired creation pages are noindexed redirects, with valid market SEO",()=>{
 for(const name of ["assemble","director","series","variants","build","chat","project-dna"]){
  const source=read("app/sasi/"+name+"/page.tsx");
  assert.match(source,/redirect\("\/sasi"\)/);
  assert.match(source,/index:false/);
 }
 assert.doesNotMatch(read("components/Footer.tsx"),/href="\/sasi\/(?:drama|build)"/);
 assert.doesNotMatch(read("app/page.tsx"),/"AI短剧生成"/);
 assert.doesNotMatch(read("lib/public-feature-copy.ts"),/Create SI\/AI short dramas with SASI/);
 const hub=read("components/HomeProblemHub.tsx");
 assert.doesNotMatch(hub,/words:\["短剧","剧本"/);
});
