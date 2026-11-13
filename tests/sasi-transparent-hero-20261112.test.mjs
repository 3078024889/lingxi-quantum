import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';

test('SASI hero ships the exact user-supplied transparent PNG and preserves its original pixels',()=>{
 const component=readFileSync('components/SasiOpenMarketplace.tsx','utf8');
 const css=readFileSync('components/SasiOpenMarketplace.module.css','utf8');
 const assetPath='public/images/sasi/sasi-market-hero-lingxifield.png';
 const retiredAssetName=['hero-art-20261112','avif'].join('.');
 const asset=readFileSync(assetPath);
 assert.deepEqual([...asset.subarray(0,8)],[137,80,78,71,13,10,26,10],'PNG signature mismatch');
 assert.equal(asset.readUInt32BE(16),1024,'original width changed');
 assert.equal(asset.readUInt32BE(20),341,'original height changed');
 assert.equal(asset[25],6,'original RGBA transparency channel missing');
 const assetSha256=createHash('sha256').update(asset).digest('hex');
 assert.equal(assetSha256,'d718ed0c5a4115b7eb4e47ba3a940ceeee2623fade73fe4beccefce1cc73d9cc','user-supplied PNG bytes changed');
 console.log('SASI_MARKET_HERO_SHA256='+assetSha256);
 assert.ok(component.includes('data-testid="sasi-transparent-hero"'));
 assert.ok(component.includes('data-hero-asset="sasi-market-hero-lingxifield.png"'));
 assert.ok(component.includes('src="/images/sasi/sasi-market-hero-lingxifield.png"'));
 assert.ok(component.includes('className={styles.browseHotspot}'));
 assert.ok(component.includes('href="#products"'));
 assert.ok(component.includes('className={styles.publishHotspot}'));
 assert.ok(component.includes('onClick={()=>setShowStudio(true)}'));
 assert.ok(!component.includes('className={styles.heroCopy}'),'baked-in title and copy must not be duplicated');
 assert.ok(!component.includes('className={styles.benefits}'),'baked-in feature strip must not be duplicated');
 assert.ok(!component.includes(retiredAssetName));
 assert.equal(existsSync(path.join('public/images/sasi',retiredAssetName)),false,'obsolete generated hero must be removed');
 const heroStart=css.lastIndexOf('Exact user-supplied SASI marketplace hero');
 const layoutStart=css.indexOf('/* Compact, transparent SASI marketplace and three-column seller workspace. */',heroStart);
 const heroCss=css.slice(heroStart,layoutStart>heroStart?layoutStart:css.length);
 for(const required of [
  'aspect-ratio:1024 / 341','object-fit:contain','height:auto',
  'background:transparent!important','border:0!important','box-shadow:none!important',
  '.main .browseHotspot{left:6.7%;width:16.2%}',
  '.main .publishHotspot{left:23.8%;width:13.2%}',
  '@media(max-width:620px)'
 ])assert.ok(heroCss.includes(required),'missing exact-hero CSS invariant: '+required);
 assert.doesNotMatch(heroCss,/linear-gradient|radial-gradient|mask-image|filter:/,'no overlay, mask or filter may alter the source artwork');
 for(const retiredSelector of [".laptopScene",".laptopDisplay",".laptopKeyboard",".laptopShadow",".alienPlant",".crystalCup",".heroCopy",".benefits"])
  assert.ok(!css.includes(retiredSelector),"retired hero panel selector remains: "+retiredSelector);
 const oldConsoleHero=['sasi-home-hero-v2','png'].join('.');
 assert.equal(existsSync('public/images/console/'+oldConsoleHero),false,'obsolete console hero must not ship');
 const scanExtensions=new Set(['.ts','.tsx','.js','.mjs','.cjs','.json','.css','.md','.yml','.yaml','.sh','.ps1','.txt']);
 const staleReferences=[];
 function scanDirectory(dir){
  if(!existsSync(dir))return;
  for(const entry of readdirSync(dir,{withFileTypes:true})){
   const full=path.join(dir,entry.name);
   if(entry.isDirectory()){if(!['.git','node_modules','.next'].includes(entry.name))scanDirectory(full);continue;}
   if(!entry.isFile()||!scanExtensions.has(path.extname(entry.name).toLowerCase()))continue;
   const text=readFileSync(full,'utf8');
   if(text.includes(retiredAssetName)||text.includes(oldConsoleHero))staleReferences.push(full);
  }
 }
 for(const root of ['app','components','lib','scripts','.github','tests','public'])scanDirectory(root);
 assert.deepEqual(staleReferences,[],'retired hero assets must have no remaining source or test references');
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
