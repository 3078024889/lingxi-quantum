import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../app/robots.ts',import.meta.url),'utf8');

test('production robots explicitly allows search crawlers and ChatGPT search bot',()=>{
 assert.ok(source.includes("userAgent:'*'"));
 assert.ok(source.includes("userAgent:'OAI-SearchBot'"));
 assert.ok(source.includes("allow:'/'"));
 assert.ok(source.includes("const crawlerPaths=['/api/','/vendor/'"));
 assert.ok(source.includes("marketLocales.map"));
 assert.ok(source.includes("if(!mayIndexMarket())return {rules:{userAgent:'*',disallow:'/'}}"));
 assert.ok(source.includes("sitemap:marketCanonicalOrigin+'/sitemap.xml'"));
});

test('GPTBot training policy is not silently coupled to OAI SearchBot search policy',()=>{
 assert.ok(!source.includes("userAgent:'GPTBot'"));
});
