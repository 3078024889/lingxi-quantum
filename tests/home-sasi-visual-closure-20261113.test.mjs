import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
test('homepage keeps one complete global-growth section and six platform pillars',()=>{
 const home=read('app/page.tsx'),localized=read('app/[locale]/page.tsx'),hub=read('components/HomeProblemHub.tsx');
 const growth=read('components/HomeGlobalGrowth.tsx'),css=read('app/growth-pages.css'),seo=read('components/HomeSeoAnswers.tsx');
 assert.doesNotMatch(home,/<HomeGlobalGrowth/);assert.doesNotMatch(localized,/<HomeGlobalGrowth/);
 assert.match(home,/<HomeProblemHub\/>/);assert.match(localized,/<HomeProblemHub\/>/);assert.match(hub,/<HomeGlobalGrowth lang=\{lang\}\/>/);
 assert.match(growth,/const SECURITY_COPY/);assert.match(growth,/const features=\[\.\.\.copy\.features/);assert.match(growth,/\{features\.map/);
 assert.match(growth,/title:"安全可靠服务"/);assert.match(growth,/title:"全球智能分发与合作"/);
 assert.equal((growth.match(/className="lx-home-market-card"/g)||[]).length,5);
 for(const term of ["WordPress","JS Widget","API","RSS","二维码","分享归因"])assert.ok(growth.includes(term),"growth channel missing "+term);
 assert.match(seo,/llms\.txt/);assert.match(seo,/llms-full\.txt/);assert.match(seo,/问题型/);
 assert.match(css,/\.lx-home-feature-strip\{grid-template-columns:repeat\(6/);assert.match(css,/\.lx-home-toolpass-wrap\{width:min/);
 assert.match(growth,/SASI SOFTWARE MARKET/);assert.match(growth,/PUBLISHED SOFTWARE/);assert.match(growth,/VERIFIED/);assert.doesNotMatch(growth,/99\.6%|>128</);
});
test('SASI marketplace is compact and seller workspace uses real data in a three-column layout',()=>{
 const market=read('components/SasiOpenMarketplace.tsx'),css=read('components/SasiOpenMarketplace.module.css');
 assert.match(market,/MARKET_FEATURES\.map/);assert.match(market,/styles\.marketFeatures/);assert.match(market,/styles\.sellerHero/);
 assert.match(market,/styles\.sellerWorkspaceGrid/);assert.match(market,/styles\.sellerGuideCard/);
 assert.match(market,/publishedCount/);assert.match(market,/pendingCount/);assert.match(market,/cnyGross/);assert.match(market,/studioMountedRef/);
 assert.match(market,/featuredVisualTitle/);assert.doesNotMatch(market,/SI 11\.6|99\.6%/);
 assert.match(css,/\.marketFeatures\{display:grid;grid-template-columns:repeat\(5/);
 assert.match(css,/\.sellerWorkspaceGrid\{display:grid;grid-template-columns:minmax\(225px/);
 assert.match(css,/\.main \.heroArtwork\{max-height:426px\}/);assert.match(css,/background:transparent/);
});
test('new social image uses the supplied global brand composition',()=>{
 const share=read('lib/share-image.ts');
 assert.ok(share.includes('og-lingxifield-20261113.jpg'));
 assert.ok(share.includes('width:1200,height:675'));
 assert.ok(!share.includes('opengraph-image'));
});
