import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

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
test("SASI keeps original user high-dimensional imagery and only reviewed real listings",()=>{
 const img=fs.readFileSync("public/images/sasi/hero-art-20261112.avif");
 assert.equal(img.toString("ascii",4,8),"ftyp");
 assert.ok(img.toString("latin1").includes("auxC"));
 assert.ok(img.byteLength>8000);
 assert.match(artwork,/data-testid="sasi-transparent-hero"/);
 assert.match(artwork,/src="\/images\/sasi\/hero-art-20261112\.avif"/);
 assert.match(artwork,/styles\.heroArtwork/);
 assert.doesNotMatch(artwork,/styles\.laptopScene/);
 assert.match(style,/\.main \.heroArtwork\{[^}]*width:100%;height:100%/);
 assert.match(style,/aspect-ratio:3\/1/);
 assert.match(style,/2026-11-12: open, transparent SASI hero/);
 assert.match(artwork,/\bsetListings\(values\[0\]\.items\)/);
 assert.ok(artwork.includes("<em>SASI</em>"),"headline uses original SASI wordmark");
 assert.match(artwork,/智能软件/);
 assert.match(artwork,/开发者作品/);
 assert.match(artwork,/自动交付/);
 assert.match(artwork,/source|源码/i);
 assert.match(style,/\.main \.benefits\{grid-template-columns:repeat\(5/);
 assert.match(style,/\.main \.steps\{grid-template-columns:repeat\(4/);
 assert.doesNotMatch(artwork,/¥2,888|2,888|非源码版本|1,268|4\.9\s*\(/);
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
