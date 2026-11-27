import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';

test('SASI scene is a complete opaque banner with real localized controls',async()=>{
 const component=readFileSync('components/SasiOpenMarketplace.tsx','utf8');
 const sharp=(await import('sharp')).default;
 const css=readFileSync('components/SasiOpenMarketplace.module.css','utf8');
 const heroRules=[...css.matchAll(/\.main \.hero\{([^}]*)\}/g)].map(m=>m[1]);
 const heroRule=heroRules.find(rule=>rule.includes('aspect-ratio:'));
 assert.ok(heroRule&&/aspect-ratio:3\s*\/\s*1/.test(heroRule),'SASI hero must preserve the approved 3:1 banner ratio');
 const artRules=[...css.matchAll(/\.main \.heroArtwork\{([^}]*)\}/g)].map(m=>m[1]);
 const artRule=artRules.find(rule=>rule.includes('object-fit:'));
 assert.ok(artRule&&/object-fit:contain/.test(artRule),'SASI hero artwork must not be stretched or flattened');
 assert.doesNotMatch(artRule,/object-fit:fill/);
 const asset=readFileSync('public/images/global-scene-20261114.webp');
 const metadata=await sharp(asset).metadata();
 assert.equal(metadata.format,'webp');
 assert.ok(metadata.width>=2000&&metadata.width/metadata.height>=2.8);
 assert.equal(metadata.hasAlpha,false,'approved complete scene must not be a cutout');
 assert.ok(asset.length<500000,'hero should remain small enough for both sites');
 assert.match(component,/<h1 id="sasi-market-title">/);
 const marketBlock=component.split("{!sellerOnly&&<>")[1]?.split("{sellerOnly&&<>")[0]??"";
 const sellerBlock=component.split("{sellerOnly&&<>")[1]??"";
 assert.ok(marketBlock.includes('href="#products"'));
 assert.ok(!marketBlock.includes("/sasi/seller"));
 assert.doesNotMatch(marketBlock,/发布产品|Publish software|开发者发布/);
 assert.ok(sellerBlock.includes('data-testid="seller-workspace-section"'));
 assert.doesNotMatch(component,/styles\.(browseHotspot|publishHotspot)/);
 assert.equal((component.match(/className=\{styles\.marketFeatures\}/g)||[]).length,1);
});

test('SASI GEO facts describe software products and SIAI keeps independent video pricing data',()=>{
 const facts=readFileSync('lib/seo/site-facts.ts','utf8');
 const marketApi=readFileSync('lingxifield-ai-market/lib/market-api-service-catalog.ts','utf8');
 const marketRates=readFileSync('lingxifield-ai-market/lib/market-rate-catalog.ts','utf8');
 assert.match(facts,/SASI is LINGXIFIELD’s intelligent software marketplace/);
 assert.match(facts,/MT5 EAs, trading source code, source licenses/);
 assert.ok(marketApi.includes('VIDEO_RATES'));assert.ok(marketApi.includes('videoRates'));
 assert.ok(marketRates.includes('VIDEO_RATES'));assert.ok(marketApi.includes('Video/audio API charged per declared unit'));
 for(const pattern of [
  /SASI[^\n]{0,90}短剧/,
  /SASI[^\n]{0,90}网站/,
  /SASI[^\n]{0,90}书本/,
  /SASI[^\n]{0,90}学习/,
  /SASI[^\n]{0,90}科研/,
  /SASI[^\n]{0,100}drama[^\n]{0,40}website/i,
  /SASI[^\n]{0,100}book[^\n]{0,40}learning/i
 ])assert.doesNotMatch(facts,pattern);
});

test('LLM discovery exposes SASI seller and delivery facts',()=>{
 const dynamic=readFileSync('app/llms.txt/route.ts','utf8');
 const published=readFileSync('public/llms.txt','utf8');
 assert.match(dynamic,/SASI seller workspace/);
 assert.match(dynamic,/SASI delivery policy/);
 assert.match(published,/SASI 卖家工作台/);
 assert.match(published,/SASI 软件交付说明/);
});
