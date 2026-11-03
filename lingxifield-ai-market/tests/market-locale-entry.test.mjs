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

test('brand identity is consistent across the homepage and all nine localized SEO entries',()=>{
 const locales=read('lib/locale-pages.ts');
 const ui=read('lib/market-ui-extra.ts');
 const home=read('app/market-workbench.tsx');
 const localized=read('app/[lang]/ai/page.tsx');
 assert.match(locales,/zh:\{headline:"灵犀场全球SIAI排行榜｜全球AI工具、模型与价格"/);
 assert.match(ui,/"zh":\{"findTools":"找 SI AI 伙伴".*?"headline":"灵犀场全球SIAI排行榜"/);
 assert.match(home,/<h1>\{ui\.headline\}<\/h1>/);
 assert.match(localized,/title:localeCopy\[lang as Locale\]\.headline/);
 for(const lang of ['en','ja','ko','fr','de','es','pt','ar']){
  assert.ok(locales.includes(lang+':{headline:"LINGXIFIELD'),lang+': localized SEO title must carry the brand');
  const localizedUiLine=ui.split(/\r?\n/).find(line=>line.startsWith('"'+lang+'":'));
  assert.ok(localizedUiLine?.includes('"headline":"LINGXIFIELD'),lang+': visible heading must carry the brand');
 }
});
