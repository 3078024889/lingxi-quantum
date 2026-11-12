import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('SASI hero uses the supplied transparent scene asset without an enclosing card',()=>{
 const component=readFileSync('components/SasiOpenMarketplace.tsx','utf8');
 const css=readFileSync('components/SasiOpenMarketplace.module.css','utf8');
 const asset=readFileSync('public/images/sasi/hero-art-20261112.avif');
 assert.match(component,/data-testid="sasi-transparent-hero"/);
 assert.match(component,/src="\/images\/sasi\/hero-art-20261112\.avif"/);
 assert.equal(asset.toString('ascii',4,8),'ftyp');
 assert.ok(asset.length>8000);
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
