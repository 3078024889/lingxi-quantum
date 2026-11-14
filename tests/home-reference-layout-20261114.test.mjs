import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
test('reference homepage composition removes retired homepage blocks and preserves destinations',()=>{
 const home=read('app/page.tsx'),localized=read('app/[locale]/page.tsx'),hub=read('components/HomeProblemHub.tsx'),growth=read('components/HomeGlobalGrowth.tsx'),seo=read('components/HomeSeoAnswers.tsx'),nav=read('components/Nav.tsx'),css=read('app/home-reference-20261114.css');
 assert.match(home,/<HomeProblemHub\/>/);assert.match(localized,/<HomeProblemHub\/>/);assert.match(hub,/<HomeGlobalGrowth lang=\{lang\}\/>/);assert.match(home,/#global-growth-entrances/);
 assert.match(nav,/homeLayout\s*\?/);assert.match(nav,/HOME_NAV_HREFS\.map/);
 assert.doesNotMatch(hub,/SiaiSearchDiscovery|SIAI_DISCOVERY|FOOTER_CATALOG|taskTitle|finishNow/);
 assert.match(hub,/全球智能服务与实用工具平台/);assert.match(hub,/<HomeHeroVisual\/>/);
 assert.match(growth,/<HomeToolPassMembership\/>/);assert.match(growth,/lx-home-distribution-globe/);assert.match(growth,/全球智能分发与合作/);
 const zh=growth.slice(growth.indexOf(' zh:{'),growth.indexOf(' en:{'));
 assert.doesNotMatch(zh,/tag:"(?:SEO|GEO|NETWORK|STORIES)"|description:"[^"]*(?:WordPress|JS Widget|RSS|API)[^"]*"/i);
 assert.equal((growth.match(/className="lx-home-market-card"/g)||[]).length,5);
 assert.match(seo,/lx-home-faq-layout/);assert.match(seo,/FAQ_ASIDE/);assert.match(seo,/FAQ_ICONS/);
 for(const q of ["ChatGPT、Claude、Gemini 这些 AI，到底选哪个？","哪个 AI 工具免费？免费额度用完会怎样？","AI 视频生成 10 秒多少钱？720p、1080p、4K 怎么算？","AI 生成的视频有水印吗？能拿去商用吗？","有些 AI 工具在我所在地区打不开，哪里能先查？","SASI 软件市场有哪些商品？","开发者如何在 SASI 发布软件？","PDF 合并、拆分、压缩，要安装软件吗？","扫描版 PDF 不能选中文字，怎么提取内容？","图片太大上传不了，或者 HEIC 照片打不开怎么办？","购买软件后如何获取源码和授权？","PDF 太大，怎么压缩后还能看清？","临时邮箱和阅后即焚分别能做什么？","AI 工具价格、免费额度和商用条件在哪里比较？"])assert.ok(seo.includes(q),"FAQ missing: "+q);
 assert.match(css,/\.lx-home-hero-copy h1\{[^}]*font-size:clamp\(34px,2\.7vw,44px\)/);assert.match(css,/\.lx-home-feature-strip\{display:grid;grid-template-columns:repeat\(5/);assert.match(css,/\.lx-home-toolpass-wrap\{width:100%;margin:0\}/);assert.equal((zh.match(/icon:"/g)||[]).length,5);
 assert.match(css,/\.lx-seo-question-grid\{display:grid;grid-template-columns:repeat\(3/);assert.match(css,/\.lx-home-faq-copy p\{[^}]*font-size:15px/);
});
test('SASI marketplace and seller workspace retain verified data and readable reference styling',()=>{
 const market=read('components/SasiOpenMarketplace.tsx'),css=read('components/SasiOpenMarketplace.module.css');
 assert.match(market,/publishedCount/);assert.match(market,/pendingCount/);assert.match(market,/cnyGross/);assert.match(market,/studioMountedRef/);
 assert.match(market,/styles\.sellerWorkspaceGrid/);assert.match(market,/styles\.sellerGuideColumn/);assert.match(market,/styles\.featuredVisual/);assert.match(market,/const featuredSide=visible\.slice\(0,2\)/);assert.match(market,/remainingVisible\.map/);assert.match(market,/featuredMiniCard/);assert.match(market,/images\[item\.id\]/);
 assert.doesNotMatch(market,/99\.6%|虚构销售额/);
 assert.match(css,/\.featuredShelf\{display:grid;grid-template-columns:minmax\(0,1\.55fr\)/);assert.match(css,/\.featuredMiniCard\{/);assert.match(css,/\.sellerWorkspaceGrid\{grid-template-columns:minmax\(250px/);assert.match(css,/\.sellerGuideCard p\{font-size:15px/);
 assert.match(css,/\.marketFeature strong\{font-size:16px/);assert.match(css,/\.sellerHeroCopy h1\{font-size:clamp\(32px/);
});
