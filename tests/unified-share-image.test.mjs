import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync,statSync} from 'node:fs';
import sharp from 'sharp';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const miniAsset='miniapp/assets/share-lingxifield-20261105.jpg';
const ogAsset='public/og-lingxifield-20261113.jpg';
test('web OpenGraph, X and independent SIAI pages use the supplied global brand image',()=>{
 const share=read('lib/share-image.ts'),root=read('app/layout.tsx'),page=read('lib/seo/page-metadata.ts');
 const siai=read('app/siai/page.tsx'),localizedSiai=read('app/[locale]/siai/page.tsx');
 const separate=read('lingxifield-ai-market/app/(default)/layout.tsx'),localizedMarket=read('lingxifield-ai-market/app/[lang]/layout.tsx');
 const separateProduct=read('lingxifield-ai-market/app/[lang]/platform/[id]/page.tsx');
 const independentCard=read('lingxifield-ai-market/lib/share-card.ts');
 assert(share.includes('/og-lingxifield-20261113.jpg'));assert(share.includes('width:1200,height:675'));
 assert(root.includes('SHARE_IMAGE_URL'));assert(page.includes('SHARE_IMAGE_URL'));assert(root.includes('width:1200,height:675'));
 assert(siai.includes('images:SHARE_IMAGES'));assert(localizedSiai.includes('images:SHARE_IMAGES'));assert(localizedSiai.includes('summary_large_image'));
 assert(independentCard.includes('https://lingxifield.com/og-lingxifield-20261113.jpg'));assert(independentCard.includes('width:1200,height:675'));
 assert(independentCard.includes('SASI 智能软件市场'));assert.doesNotMatch(independentCard,/SASI 智能创作/);
 assert(separate.includes('images:MARKET_SHARE_IMAGES'));assert(localizedMarket.includes('images:MARKET_SHARE_IMAGES'));assert(localizedMarket.includes('summary_large_image'));
 assert(separateProduct.includes('images:MARKET_SHARE_IMAGES'));assert(separateProduct.includes('summary_large_image'));
 assert.equal(existsSync(new URL('../app/opengraph-image.tsx',import.meta.url)),false);
 assert.doesNotMatch(share,/opengraph-image\?v=/);assert.doesNotMatch(share,/og-lingxifield-20261105\.jpg/);
});
test('the supplied global OG asset is present, 1200x675 JPEG, and WeChat miniapp art remains intact',async()=>{
 const og=new URL('../'+ogAsset,import.meta.url);assert(existsSync(og),ogAsset);
 const ogMeta=await sharp(og.pathname).metadata();assert.equal(ogMeta.format,'jpeg');assert.equal(ogMeta.width,1200);assert.equal(ogMeta.height,675);
 assert(statSync(og.pathname).size<700*1024,'OG image should remain optimized for social previews');
 assert.equal(existsSync(new URL('../public/og-lingxifield-20261105.jpg',import.meta.url)),false);
 const mini=new URL('../'+miniAsset,import.meta.url);assert(existsSync(mini),miniAsset);
 const meta=await sharp(mini.pathname).metadata();assert.equal(meta.format,'jpeg');assert.equal(meta.width,600);assert.equal(meta.height,480);
});
test('WeChat forwarding of SIAI leaderboard keeps the public ranking page',()=>{
 const share=require('../miniapp/utils/share.js');
 assert.equal(share.publicWebPath('/siai'),'/siai');assert.equal(share.publicWebPath('/siai?evil=1'),'/siai');assert.equal(share.publicWebPath('/account'),'/');
 const web=read('miniapp/pages/web/index.js');assert(web.includes("const EXACT_ALLOWED=new Set(['/','/siai'"));assert(web.includes("'/siai':'灵犀场 · 全球 SIAI 排行榜'"));
});
