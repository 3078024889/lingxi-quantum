import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';

test('SASI hero uses the supplied transparent scene asset without an enclosing card',()=>{
 const component=readFileSync('components/SasiOpenMarketplace.tsx','utf8');
 const css=readFileSync('components/SasiOpenMarketplace.module.css','utf8');
 const asset=readFileSync('public/images/sasi/hero-art-20261112.avif');
 assert.match(component,/data-testid="sasi-transparent-hero"/);
 assert.match(component,/src="\/images\/sasi\/hero-art-20261112\.avif"/);
 assert.equal(asset.toString('ascii',4,8),'ftyp');
 assert.ok(asset.length>8000);
 assert.ok(asset.toString('latin1').includes('auxC'),'AVIF alpha auxiliary item missing');
 const assetSha256=createHash('sha256').update(asset).digest('hex');
 console.log('SASI_HERO_ASSET_SHA256='+assetSha256);
 assert.match(assetSha256,/^[a-f0-9]{64}$/);
 const retiredAssetName=['hero','original.webp'].join('-');
 assert.equal(existsSync(new URL('../public/images/sasi/'+retiredAssetName,import.meta.url)),false,'retired hero asset must not ship');
 const scanExtensions=new Set(['.ts','.tsx','.js','.mjs','.cjs','.json','.css','.md','.yml','.yaml','.sh','.ps1','.txt']);
 const staleReferences=[];
 function scanDirectory(dir){
  for(const entry of readdirSync(dir,{withFileTypes:true})){
   const full=path.join(dir,entry.name);
   if(entry.isDirectory()){if(!['.git','node_modules','.next'].includes(entry.name))scanDirectory(full);continue;}
   if(!entry.isFile()||!scanExtensions.has(path.extname(entry.name).toLowerCase()))continue;
   if(readFileSync(full,'utf8').includes(retiredAssetName))staleReferences.push(full);
  }
 }
 for(const root of ['app','components','lib','scripts','.github','tests','public'])scanDirectory(root);
 assert.deepEqual(staleReferences,[],'retired hero path must have no remaining source or test references');

 const override=css.slice(css.lastIndexOf('2026-11-12: open, transparent SASI hero'));
 assert.match(override,/\.main \.hero\{[^}]*background:transparent!important/);
 assert.match(override,/\.main \.hero\{[^}]*border:0!important/);
 assert.match(override,/\.main \.benefits\{[^}]*background:transparent!important/);
 assert.match(override,/@media\(max-width:770px\)/);
});

test('SASI GEO facts describe software products and SIAI video pricing only',()=>{
 const facts=readFileSync('lib/seo/site-facts.ts','utf8');
 assert.match(facts,/SASI is LINGXIFIELD’s intelligent software marketplace/);
 assert.match(facts,/SIAI video-model quote flow/);
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
