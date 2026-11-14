import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
test('reference homepage composition removes retired homepage blocks and preserves destinations',()=>{
 const home=read('app/page.tsx'),localized=read('app/[locale]/page.tsx'),hub=read('components/HomeProblemHub.tsx'),growth=read('components/HomeGlobalGrowth.tsx'),seo=read('components/HomeSeoAnswers.tsx'),nav=read('components/Nav.tsx'),css=read('app/home-reference-20261114.css');
 assert.match(home,/<HomeProblemHub\/>/);assert.match(localized,/<HomeProblemHub\/>/);assert.match(hub,/<HomeGlobalGrowth lang=\{lang\}\/>/);assert.match(home,/#global-growth-entrances/);
 assert.match(nav,/homeLayout\s*\?/);assert.match(nav,/data-home-sidebar/);assert.match(nav,/lx-home-fixed-sidebar/);assert.match(nav,/lx-home-fixed-topbar/);assert.match(nav,/PublicAnnouncementTicker/);assert.match(nav,/function homeNavHref/);assert.doesNotMatch(nav,/lx-home-nav-links/);assert.match(home,/<main>/);assert.match(localized,/<main>/);
 assert.match(hub,/<SiaiSearchDiscovery variant="home"\/>/);assert.match(hub,/SIAI_DISCOVERY\[lang\]/);assert.doesNotMatch(hub,/FOOTER_CATALOG|taskTitle|finishNow/);
 assert.match(hub,/全球智能服务与实用工具平台/);assert.match(hub,/<HomeHeroVisual\/>/);assert.match(growth,/data-testid="home-siai-categories"/);assert.match(growth,/lx-home-siai-category-card/);assert.match(hub,/const globalSiaiEntry=\{href:"\/siai",icon:"products"\}/);assert.match(hub,/data-testid="home-global-siai-entry"/);assert.doesNotMatch(hub,/<a href="\/(?:siai|tools\/pass)"/);
 assert.match(growth,/<HomeToolPassMembership\/>/);assert.match(growth,/lx-home-distribution-globe/);assert.match(growth,/全球智能分发与合作/);for(const label of ["AI 搜索说明","完整平台资料","公开数据接口","WordPress 插件","网站嵌入组件","排行榜更新订阅","二维码分享","分享来源统计"])assert.ok(growth.includes(label),"growth link missing "+label);
 const packageJson=JSON.parse(read("package.json")),pluginBuilder=read("scripts/prepare-wordpress-plugin.cjs");
 for(const destination of ["/llms.txt","/llms-full.txt","/siai-openapi.json","/downloads/lingxifield-siai-wordpress.zip","/widgets/lingxifield-v1.js","/siai/updates.xml","/partners"])assert.ok(growth.includes(destination),"missing public destination "+destination);
 assert.ok(pluginBuilder.includes('"public","downloads","lingxifield-siai-wordpress.zip"'));assert.match(packageJson.scripts.prebuild,/prepare-wordpress-plugin/);
 assert.equal(read("public/widgets/lingxifield-v1.js"),read("integrations/wordpress/lingxifield-widgets/assets/lingxifield-v1.js"));
 const zh=growth.slice(growth.indexOf(' zh:{'),growth.indexOf(' en:{'));
 const copyStart=growth.indexOf("const COPY:Record"),copyEnd=growth.indexOf("const SECURITY_COPY",copyStart),copySource=growth.slice(copyStart,copyEnd),locales=["zh","en","ja","ko","fr","de","es","pt","ar"];
 for(let i=0;i<locales.length;i++){const start=copySource.indexOf(" "+locales[i]+":{"),end=i+1<locales.length?copySource.indexOf(" "+locales[i+1]+":{",start+1):copySource.indexOf("\n};",start);assert.ok(start>=0,"missing locale "+locales[i]);assert.equal((copySource.slice(start,end<0?copySource.length:end).match(/icon:"/g)||[]).length,5,"feature icons "+locales[i]);}
 assert.doesNotMatch(zh,/tag:"(?:SEO|GEO|NETWORK|STORIES)"|description:"[^"]*(?:WordPress|JS Widget|RSS|API)[^"]*"/i);
 assert.equal((growth.match(/className="lx-home-market-card"/g)||[]).length,5);assert.match(growth,/icon:"privacy"/);assert.match(growth,/const features:Feature\[\]=\[\.\.\.copy\.features,\{icon:"privacy"/);assert.match(growth,/const features:Feature\[\]=/);assert.match(growth,/data-growth-inventory="[^"]*九语言搜索入口/);assert.doesNotMatch(growth,/data-growth-inventory="[^"]*(?:Celestial 小仙女|JS Widget;API;RSS)/);assert.match(growth,/growthCardIcons:LingxiIconName\[\]/);assert.match(growth,/marketIcons:LingxiIconName\[\]/);assert.match(css,/\.lx-home-feature-strip\{display:grid;grid-template-columns:repeat\(6/);assert.match(css,/\.lx-home-growth-card-icon\{/);
 assert.match(seo,/lx-home-faq-layout/);assert.match(seo,/FAQ_ASIDE/);assert.match(seo,/FAQ_ICONS/);
 for(const q of ["ChatGPT、Claude、Gemini 这些 AI，到底选哪个？","哪个 AI 工具免费？免费额度用完会怎样？","AI 视频生成 10 秒多少钱？720p、1080p、4K 怎么算？","AI 生成的视频有水印吗？能拿去商用吗？","有些 AI 工具在我所在地区打不开，哪里能先查？","SASI 软件市场有哪些商品？","开发者如何在 SASI 发布软件？","PDF 合并、拆分、压缩，要安装软件吗？","扫描版 PDF 不能选中文字，怎么提取内容？","图片太大上传不了，或者 HEIC 照片打不开怎么办？","购买软件后如何获取源码和授权？","PDF 太大，怎么压缩后还能看清？","临时邮箱和阅后即焚分别能做什么？","AI 工具价格、免费额度和商用条件在哪里比较？"])assert.ok(seo.includes(q),"FAQ missing: "+q);
 assert.match(css,/\.lx-home-hero-copy h1\{[^}]*font-size:clamp\(36px,3\.1vw,48px\)/);assert.match(css,/\.lx-home-feature-strip\{display:grid;grid-template-columns:repeat\(6/);assert.match(css,/\.lx-home-toolpass-wrap\{width:100%;margin:0\}/);assert.match(css,/\.lx-home-feature-copy strong\{font-size:14px\}\.lx-home-feature-copy small\{font-size:12px\}/);assert.match(css,/\.lx-home-market-card strong\{font-size:13px\}\.lx-home-market-card small\{font-size:12px\}/);assert.equal((zh.match(/icon:"/g)||[]).length,5);
 assert.match(css,/\.lx-seo-question-grid\{display:grid;grid-template-columns:repeat\(3/);assert.match(css,/\.lx-home-faq-copy p\{[^}]*font-size:15px/);
});
test('SASI marketplace and seller workspace retain verified data and readable reference styling',()=>{
 const market=read('components/SasiOpenMarketplace.tsx'),css=read('components/SasiOpenMarketplace.module.css');
 assert.match(market,/publishedCount/);assert.match(market,/pendingCount/);assert.match(market,/cnyGross/);assert.match(market,/studioMountedRef/);
 assert.match(market,/styles\.sellerWorkspaceGrid/);assert.match(market,/styles\.sellerGuideColumn/);assert.match(market,/styles\.featuredVisual/);assert.match(market,/const featuredSide=visible\.slice\(0,2\)/);assert.match(market,/remainingVisible\.map/);assert.match(market,/featuredMiniCard/);assert.match(market,/images\[item\.id\]/);
 assert.doesNotMatch(market,/99\.6%|虚构销售额/);
 assert.doesNotMatch(market,/SASI \/ FEATURED|01 \/ SOFTWARE|02 \/ PUBLISH & DELIVERY|03 \/ SELLER STUDIO|04 \/ SELLER EARNINGS|SASI · SELLER CENTER/);
 assert.match(css,/\.main \.card p\{font-size:14px/);
 assert.match(css,/\.marketFeature strong\{font-size:17px/);
 assert.match(css,/\.sellerBenefits small\{font-size:13px/);
 assert.match(css,/\.sellerGuideSteps small\{font-size:13px/);
 assert.match(market,/styles\.uploadGrid/);
 assert.match(market,/styles\.uploadTile/);
 assert.match(market,/activeDraft/);
 assert.match(market,/ZIP_REQUIRED_MAX_30MB/);
 assert.match(market,/LICENSE_PDF_TXT_PNG_MAX_20MB/);
 assert.ok(market.includes("SASI_LICENSE/"));
 assert.match(market,/许可文件可单独选择/);
 assert.match(market,/详情图（可选，最多4张）/);
 assert.match(market,/styles\.detailUploadRow/);
 assert.match(css,/\.detailUploadRow\{/);
 assert.match(css,/\.uploadGrid\{display:grid;grid-template-columns:repeat\(3/);
 assert.match(css,/\.uploadTile\{position:relative/);
 assert.match(css,/\.featuredShelf\{display:grid;grid-template-columns:minmax\(0,1\.55fr\)/);assert.match(css,/\.featuredMiniCard\{/);assert.match(css,/\.sellerWorkspaceGrid\{grid-template-columns:minmax\(250px/);assert.match(css,/\.sellerGuideCard p\{font-size:15px/);
 assert.match(css,/\.marketFeature strong\{font-size:16px/);assert.match(css,/\.sellerHeroCopy h1\{font-size:clamp\(32px/);
});


test('reference-scale homepage and seller typography remains readable',()=>{
 const home=read('app/home-reference-20261114.css');
 const seller=read('components/SasiOpenMarketplace.module.css');
 assert.match(home,/\.lx-home-hero-copy h1\{font-size:clamp\(40px,3\.35vw,54px\)/);
 assert.match(home,/\.lx-home-hero-lead\{font-size:18px/);
 assert.match(home,/\.lx-home-faq-copy h3\{font-size:18px!important/);
 assert.match(home,/\.lx-home-faq-copy p\{font-size:16px!important/);
 assert.match(home,/\.lx-seo-question-grid\{display:grid;grid-template-columns:repeat\(3/);
 assert.match(seller,/\.formCard input:not\(\[type="checkbox"\]\),\.formCard textarea,\.formCard select,\.payoutForm input,\.payoutForm select\{font-size:15px/);
 assert.match(seller,/\.sellerGuideCard p\{font-size:14px/);
 assert.match(seller,/\.sellerGuideSteps strong\{font-size:14px/);
 assert.match(seller,/\.sellerBenefits strong\{font-size:13px/);
});
