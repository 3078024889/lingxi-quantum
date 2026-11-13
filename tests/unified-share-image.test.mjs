import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import sharp from 'sharp';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const miniAsset='miniapp/assets/share-lingxifield-20261105.jpg';
test('web OpenGraph, X and independent SIAI pages use the new generated site-wide image',()=>{
 const share=read('lib/share-image.ts'),root=read('app/layout.tsx'),page=read('lib/seo/page-metadata.ts');
 const siai=read('app/siai/page.tsx'),localizedSiai=read('app/[locale]/siai/page.tsx');
 const separate=read('lingxifield-ai-market/app/(default)/layout.tsx'),localizedMarket=read('lingxifield-ai-market/app/[lang]/layout.tsx');
 const separateProduct=read('lingxifield-ai-market/app/[lang]/platform/[id]/page.tsx');
 const independentCard=read('lingxifield-ai-market/lib/share-card.ts'),og=read('app/opengraph-image.tsx');
 assert(share.includes('/opengraph-image?v=20261113'));assert(root.includes('SHARE_IMAGE_URL'));assert(page.includes('SHARE_IMAGE_URL'));
 assert(siai.includes('images:SHARE_IMAGES'));assert(localizedSiai.includes('images:SHARE_IMAGES'));assert(localizedSiai.includes('summary_large_image'));
 assert(independentCard.includes('https://lingxifield.com/opengraph-image?v=20261113'));assert(independentCard.includes('SASI 智能软件市场'));assert.doesNotMatch(independentCard,/SASI 智能创作/);
 assert(separate.includes('images:MARKET_SHARE_IMAGES'));assert(localizedMarket.includes('images:MARKET_SHARE_IMAGES'));assert(localizedMarket.includes('summary_large_image'));
 assert(separateProduct.includes('images:MARKET_SHARE_IMAGES'));assert(separateProduct.includes('summary_large_image'));
 assert.match(og,/new ImageResponse/);assert.match(og,/width:1200,height:630/);assert.match(og,/contentType="image\/png"/);
 assert.match(og,/images\/lingxifield-logo\.png/);assert.match(og,/images\/sasi\/sasi-market-hero-lingxifield\.png/);
 assert.doesNotMatch(share,/og-lingxifield-20261105\.jpg/);
});
test('retired static web OG is gone and WeChat miniapp image remains valid',async()=>{
 assert.equal(existsSync(new URL('../public/og-lingxifield-20261105.jpg',import.meta.url)),false);
 const mini=new URL('../'+miniAsset,import.meta.url);assert(existsSync(mini),miniAsset);
 const meta=await sharp(mini.pathname).metadata();assert.equal(meta.format,'jpeg');assert.equal(meta.width,600);assert.equal(meta.height,480);
});
test('WeChat forwarding of SIAI leaderboard keeps the public ranking page',()=>{
 const share=require('../miniapp/utils/share.js');
 assert.equal(share.publicWebPath('/siai'),'/siai');assert.equal(share.publicWebPath('/siai?evil=1'),'/siai');assert.equal(share.publicWebPath('/account'),'/');
 const web=read('miniapp/pages/web/index.js');assert(web.includes("const EXACT_ALLOWED=new Set(['/','/siai'"));assert(web.includes("'/siai':'灵犀场 · 全球 SIAI 排行榜'"));
});
