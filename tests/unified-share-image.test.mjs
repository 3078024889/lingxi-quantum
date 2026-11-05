import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import sharp from 'sharp';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);

const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const imageWeb='public/og-lingxifield-20261105.jpg';
const imageMini='miniapp/assets/share-lingxifield-20261105.jpg';

test('every web, OpenGraph, X and WeChat share path points to the same visual',()=>{
 const url=read('lib/share-image.ts');
 const root=read('app/layout.tsx');
 const page=read('lib/seo/page-metadata.ts');
 const siai=read('app/siai/page.tsx');
 const localizedSiai=read('app/[locale]/siai/page.tsx');
 const separate=read('lingxifield-ai-market/app/(default)/layout.tsx');
 const localizedMarket=read('lingxifield-ai-market/app/[lang]/layout.tsx');
 const separateProduct=read('lingxifield-ai-market/app/[lang]/platform/[id]/page.tsx');
 const independentCard=read('lingxifield-ai-market/lib/share-card.ts');
 const mini=read('miniapp/utils/share.js');
 const minipage=read('miniapp/pages/share/index.js');
 assert(url.includes('/og-lingxifield-20261105.jpg'));
 assert(root.includes('SHARE_IMAGE_URL'));
 assert(page.includes('SHARE_IMAGE_URL'));
 assert(siai.includes('images:SHARE_IMAGES'));
 assert(localizedSiai.includes('images:SHARE_IMAGES'));
 assert(localizedSiai.includes('summary_large_image'));
 assert(independentCard.includes('https://lingxifield.com/og-lingxifield-20261105.jpg'));
 assert(separate.includes('images:MARKET_SHARE_IMAGES'));
 assert(localizedMarket.includes('images:MARKET_SHARE_IMAGES'));
 assert(localizedMarket.includes('summary_large_image'));
 assert(separateProduct.includes('images:MARKET_SHARE_IMAGES'));
 assert(separateProduct.includes('summary_large_image'));
 assert(mini.includes('/assets/share-lingxifield-20261105.jpg'));
 assert(mini.includes('imageUrl: SHARE_IMAGE'));
 assert(minipage.includes('imageUrl:SHARE_IMAGE'));
 assert(![url,root,page,separate,mini,minipage].some(x=>x.includes('20260928')));
});

test('both new assets exist, are sharp readable, and old OG/miniapp versions are deleted',async()=>{
 const sourceWeb=new URL('../'+imageWeb,import.meta.url);
 const sourceMini=new URL('../'+imageMini,import.meta.url);
 assert(existsSync(sourceWeb),imageWeb);
 assert(existsSync(sourceMini),imageMini);
 assert(!existsSync(new URL('../public/og-lingxifield-20260928.png',import.meta.url)));
 assert(!existsSync(new URL('../miniapp/assets/share-lingxifield-20260928.png',import.meta.url)));
 const [og,mini]=await Promise.all([sharp(sourceWeb.pathname).metadata(),sharp(sourceMini.pathname).metadata()]);
 assert.equal(og.format,'jpeg');
 assert.equal(og.width,1200);assert.equal(og.height,630);
 assert.equal(mini.format,'jpeg');
 assert.equal(mini.width,600);assert.equal(mini.height,480);
});

test('WeChat forwarding of SIAI leaderboard keeps the public ranking page',()=>{
 const share=require('../miniapp/utils/share.js');
 assert.equal(share.publicWebPath('/siai'),'/siai');
 assert.equal(share.publicWebPath('/siai?evil=1'),'/siai');
 assert.equal(share.publicWebPath('/account'),'/');
 const web=read('miniapp/pages/web/index.js');
 assert(web.includes("const EXACT_ALLOWED=new Set(['/','/siai'"));
 assert(web.includes("'/siai':'灵犀场 · 全球 SIAI 排行榜'"));
});
