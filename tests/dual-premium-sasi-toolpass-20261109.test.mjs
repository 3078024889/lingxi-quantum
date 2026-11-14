import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";

const file=(path)=>fs.readFileSync(path,"utf8");
const pass=file("app/tools/pass/page.tsx");
const artwork=file("components/SasiOpenMarketplace.tsx");
const style=file("components/SasiOpenMarketplace.module.css");
const passStyle=file("app/tools/pass/ToolPassPremium.module.css");
const price=file("lib/tools/commerce/all-tools-pass.ts");

test("premium ToolPass four-price catalog stays authoritative and does not fabricate deals",()=>{
 for(const [days,value] of [[7,29],[30,99],[90,269],[365,899]])
  assert.ok(price.includes(`days:${days},price:${value}`),`offer ${days}`);
 assert.match(pass,/ALL_TOOLS_PASS_CATALOG\.map/);
 assert.match(pass,/畅享 100\+ 实用工具，划算又高效/);
 assert.match(pass,/premium\.hero/);
 assert.match(pass,/premium\.plans/);
 assert.match(pass,/premium\.modal/);
 assert.match(pass,/premium\.payFooter/);
 assert.match(passStyle,/\.planFeatured/);
 assert.match(passStyle,/\.overlay/);
 assert.match(passStyle, /\.root\{[^}]*width:100%;max-width:1500px/);
 assert.match(passStyle, /\.plans\{[^}]*margin:14px 0 0[^}]*gap:12px/);
 assert.match(passStyle, /\.plan\{[^}]*min-height:164px/);
 assert.match(passStyle, /\.lowerPanels\{[^}]*gap:14px;margin-top:14px/);
 const footerStyle=file("app/siai-home.css");
 assert.match(footerStyle, /\.lx-footer-v3 \.lx-footer-v3-showcase\{\s*max-width:1500px/);
 assert.match(footerStyle, /\.lx-footer-v3 \.lx-footer-v3-sasi\{max-width:1500px/);
 assert.match(footerStyle, /\.lx-footer-v3 \.lx-footer-v3-nav\{\s*max-width:1500px/);
 assert.match(passStyle,/@media\(max-width:700px\)/);
});
test("ToolPass modal is connected to verified real order and user balance, never hard-coded funds",()=>{
 for(const path of ["/api/tools/pass","/api/pay/providers","/api/money/summary","/api/pay/create"])
  assert.ok(pass.includes(path),path);
 assert.match(pass,/data\?\.available===true/);
 assert.match(pass,/wallet\?\.ok/);
 assert.match(pass,/Number\.isSafeInteger\(actual\)/);
 assert.match(pass,/selectedChoice\?\.ready/);
 assert.match(pass,/crypto\.randomUUID\(\)/);
 assert.match(pass,/PayPal/);
 assert.doesNotMatch(pass,/120\.00|1,268|\b532\b|模拟订单|sample balance/i);
});
test("fast currency switching cannot mix wallet balances or reuse stale merchant readiness",()=>{
 assert.match(pass,/latestRefresh=useRef\(0\)/);
 assert.match(pass,/const ticket=\+\+latestRefresh\.current/);
 assert.match(pass,/if\(ticket!==latestRefresh\.current\)return/);
 assert.match(pass,/setVerifiedCurrency\(currency\)/);
 assert.match(pass,/available&&verifiedCurrency===currency/);
 assert.match(pass,/verifiedCurrency!==currency\|\|walletBalanceMinor===null/);
 assert.match(pass,/cache:"no-store"/);
});
test("purchase dialog is keyboard accessible and restores focus",()=>{
 assert.match(pass,/aria-modal="true"/);
 assert.match(pass,/aria-describedby="toolpass-checkout-desc"/);
 assert.match(pass,/ref=\{modalRef\}/);
 assert.match(pass,/ref=\{closeRef\}/);
 assert.match(pass,/event\.key==="Escape"/);
 assert.match(pass,/event\.key!=="Tab"/);
 assert.match(pass,/prior\?\.focus\(\)/);
});
test("announcements show actual published API items and deep-links to individual messages",()=>{
 assert.match(pass,/fetch\("\/api\/site-announcements"/);
 assert.match(pass,/encodeURIComponent\(item\.id\)/);
 assert.match(pass,/premium\.lowerPanels/);
 assert.match(pass,/premium\.noticeRow/);
 assert.match(pass,/premium\.balanceBody/);
});
test("SASI uses a complete scene with real controls and reviewed real listings",()=>{
 const img=fs.readFileSync("public/images/global-scene-20261114.webp");
 assert.equal(img.subarray(0,4).toString(),"RIFF");
 assert.equal(img.subarray(8,12).toString(),"WEBP");
 assert.ok(artwork.includes('data-testid="sasi-transparent-hero"'));
 assert.ok(artwork.includes('data-hero-asset="global-scene-20261114.webp"'));
 assert.ok(artwork.includes('src="/images/global-scene-20261114.webp"'));
 assert.ok(artwork.includes("styles.heroArtwork"));
 assert.ok(artwork.includes('href="#products"'));
 assert.ok(artwork.includes('href="/sasi/seller"'));
 assert.ok(!artwork.includes("styles.laptopScene"));
 assert.ok(artwork.includes("styles.heroCopy"));
 assert.ok(!artwork.includes("styles.benefits"));
 assert.ok(style.includes(".main .heroArtwork{"));
 assert.ok(style.includes("object-fit:fill"));
 assert.ok(artwork.includes('<h1 id="sasi-market-title">'));
 assert.ok(artwork.includes("styles.marketFeatures"));
 for(const retiredSelector of [".laptopScene",".laptopDisplay",".laptopKeyboard",".laptopShadow",".alienPlant",".crystalCup"])
  assert.ok(!style.includes(retiredSelector),"retired laptop-scene CSS remains: "+retiredSelector);
 assert.ok(artwork.includes("setListings(values[0].items)"));
 assert.ok(artwork.includes("灵犀场 SASI 智能软件市场"));
 assert.ok(artwork.includes("开发者作品"));
 assert.ok(/source|源码/i.test(artwork));
 assert.ok(!style.includes(".main .benefits"),"the artwork already contains its five-feature strip");
 assert.ok(style.includes(".steps{display:grid;grid-template-columns:repeat(4"));
 for(const retired of ["¥2,888","2,888","非源码版本","1,268","4.9 ("])assert.ok(!artwork.includes(retired));
});
test("SASI seller revenue split is shown only upon consent, never in public product tiles",()=>{
 assert.match(artwork,/\{terms&&<p/);
 assert.match(artwork,/85%/);
 assert.match(artwork,/15%/);
 assert.match(artwork,/if\(!put\.ok\)/);
 assert.match(artwork,/submitReview/);
 assert.match(artwork,/<section id="featured" className=\{styles\.featured\}/);
 assert.match(artwork,/featuredReady&&\(featuredPayment\.wechat/);
 assert.match(artwork,/Product files and SHA-256 are being verified/);
 assert.match(artwork,/role="status" aria-live="polite"/);
});


test("homepage, SEO/GEO, ToolPass and footer use one transparent celestial surface system",()=>{
 const growth=file("app/growth-pages.css");
 const footer=file("app/siai-home.css");
 assert.match(growth,/--lx-growth-max:1500px/);
 assert.match(growth,/\.lx-home-v143-grid \.lx11-home-card[^}]*background:transparent!important/);
 assert.match(growth,/\.lx-growth-panel[^}]*background:transparent!important/);
 assert.match(growth,/\.lx-seo-question[^}]*background:transparent!important/);
 assert.match(passStyle,/container-type:inline-size;container-name:toolpass/);
 assert.match(passStyle,/\.frame\{[^}]*background:transparent!important/);
 assert.match(passStyle,/\.plan\{[^}]*background:transparent!important/);
 assert.match(passStyle,/\.lowerCard\{[^}]*background:transparent!important/);
 assert.match(footer,/\.lx-footer-v3 \.lx-footer-v3-showcase\{[^}]*background:transparent!important/);
 assert.match(footer,/\.lx11-footer\.lx-branded-footer\.lx-footer-v3[^}]*background:transparent!important/);
});
