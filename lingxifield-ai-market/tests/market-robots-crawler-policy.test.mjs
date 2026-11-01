import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../app/robots.ts',import.meta.url),'utf8');

test('production robots explicitly allows search crawlers and ChatGPT search bot',()=>{
 assert.match(source,/userAgent:'\\*'/);
 assert.match(source,/userAgent:'OAI-SearchBot'/);
 assert.match(source,/allow:'\\/'/);
 assert.match(source,/crawlerPaths=\\['\\/api\\/','\\/vendor\\/'\\]/);
 assert.match(source,/if\\(!mayIndexMarket\\(\\)\\)return \\{rules:\\{userAgent:'\\*',disallow:'\\/'\\}\\}/);
 assert.match(source,/sitemap:marketCanonicalOrigin\\+'\\/sitemap\\.xml'/);
});

test('GPTBot training policy is not silently coupled to OAI SearchBot search policy',()=>{
 assert.doesNotMatch(source,/userAgent:'GPTBot'/);
});
