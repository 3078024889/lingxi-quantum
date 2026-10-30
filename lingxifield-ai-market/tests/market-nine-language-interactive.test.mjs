import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const languages=['zh','en','ja','ko','fr','de','es','pt','ar'];
test('all 9 languages have localized navigation, practical labels and no empty text',async()=>{
 const source=await read('lib/market-ui-extra.ts');
 for(const lang of languages)assert.ok(source.includes('"'+lang+'":{'),lang+' dictionary missing');
 for(const key of ['headline','searchPlaceholder','findTools','models','pricing','free','limits','back','noData'])assert.ok(source.includes('"'+key+'":'),key+' label missing');
});
test('all 9 locale URLs use same interactive market, not static dead-end cards',async()=>{
 const route=await read('app/[lang]/ai/page.tsx');
 const page=await read('app/market-workbench.tsx');
 assert.ok(route.includes("Home initialLanguage={lang as Locale} initialPlatforms={searchPlatforms"));
 assert.ok(route.includes("robots:{index:false,follow:false}"),'unreviewed market may not be indexed');
 assert.ok(page.includes('initialLanguage?:Language'));
 assert.ok(page.includes('MARKET_UI_EXTRA[language]'));
 assert.ok(page.includes("router.push('/'+next+'/ai')"));
});
test('Arabic uses RTL and language URLs are stable',async()=>{
 const route=await read('app/[lang]/ai/page.tsx');
 assert.ok(route.includes("lang==='ar'?'rtl':'ltr'"));
 const legacy=await read('lib/locale-pages.ts');
 for(const lang of languages)assert.ok(legacy.includes(' '+lang+':{'),'missing locale '+lang);
});
