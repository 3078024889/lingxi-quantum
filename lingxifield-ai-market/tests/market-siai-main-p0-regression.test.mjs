import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
test('ranking scrolls horizontally from both rails while header stays fixed in bounded viewport',()=>{
 const page=read('components/SiaiRankingHome.tsx'),css=read('app/siai-home.css');
 assert.match(page,/ref=\{topRef\}/);
 assert.match(page,/ref=\{gridRef\}/);
 assert.match(page,/onScroll=\{\(\)=>sync\("top"\)\}/);
 assert.match(page,/onScroll=\{\(\)=>sync\("table"\)\}/);
 assert.match(css,/\.siai-home-table-scroll\{height:min\(72dvh/);
 assert.match(css,/\.siai-home-table thead th\{position:sticky;top:0/);
 assert.match(css,/\.siai-home-top-track\{position:sticky/);
});
test('ranking provides existing sourced video and API cost calculator without a fixed platform count',()=>{
 const page=read('components/SiaiRankingHome.tsx'),calc=read('lingxifield-ai-market/app/market-cost-estimator.tsx');
 assert.ok(page.includes('<MarketCostEstimator language={lang}'));
 assert.ok(page.includes('siai-home-cost-accordion'));
 assert.ok(calc.includes("mode==='video'"));
 assert.ok(calc.includes("mode==='api'"));
 assert.ok(!calc.includes('全部 32 个平台'));
 assert.ok(!calc.includes('覆盖 32 个平台'));
});
test('no unnecessary product-detail route; official source, inline detail and vendor claim remain',()=>{
 const page=read('components/SiaiRankingHome.tsx'),map=read('app/sitemap.ts'),vendor=read('lingxifield-ai-market/app/[lang]/vendor/claim/page.tsx');
 assert.ok(!existsSync(new URL('../../app/siai/[lang]/[id]/page.tsx',import.meta.url)));
 assert.ok(!map.includes('siaiProductPath'));
 assert.ok(page.includes('siai-detail-backdrop'));
 assert.ok(page.includes('href={p.website}'));
 assert.ok(page.includes('https://globalsiai.com/'));
 assert.ok(vendor.includes("fetch('/api/vendor/submit'"));
});
test('policy and footer cover Global SIAI, external charges, vendor evidence and no repeat tagline',()=>{
 const footer=read('components/Footer.tsx'),privacy=read('app/privacy/page.tsx'),terms=read('app/terms/page.tsx'),refunds=read('app/refunds/page.tsx');
 assert.ok(!footer.includes('<p className="lx-footer-position">{c.brandLead}</p>'));
 assert.ok(footer.includes('/vendor/claim'));
 assert.ok(privacy.includes('厂商认领及资料更正'));
 assert.ok(terms.includes('7. 全球 SI／AI 排行榜'));
 assert.ok(refunds.includes('SIAI 排行榜与第三方费用'));
});
