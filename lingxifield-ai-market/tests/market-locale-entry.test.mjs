import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('all supported language home entry routes redirect to localized market',()=>{
 const source=read('app/[lang]/page.tsx');
 assert.match(source,/marketLocales\.map\(lang=>\(\{lang\}\)\)/);
 assert.ok(source.includes("permanentRedirect('/'+lang+'/ai')"));
 assert.ok(source.includes("marketLocales.includes(lang as MarketLocale)"));
});
test('product navigation preserves current user language',()=>{
 const source=read('app/market-workbench.tsx');
 assert.ok(source.includes("router.push('/'+language+'/platform/'+encodeURIComponent(p.id))"));
 assert.ok(!source.includes("router.push('/platform/'+encodeURIComponent(p.id))"));
});
