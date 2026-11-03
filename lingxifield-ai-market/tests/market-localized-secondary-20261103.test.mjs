import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('localized apps, model quotes and vendor submission pages share nine-language UI and live APIs',async()=>{
 const [a,m,v,copy,vendor,home]=await Promise.all([
  read('app/[lang]/apps/page.tsx'),read('app/[lang]/models/page.tsx'),
  read('app/[lang]/vendor/claim/page.tsx'),read('lib/market-secondary-i18n.ts'),
  read('lib/market-vendor-i18n.ts'),read('app/market-workbench.tsx')
 ]);
 assert.match(a,/\/api\/v1\/products\/all/);assert.match(m,/\/api\/v1\/models\/groups/);
 assert.match(v,/\/api\/vendor\/submit/);assert.match(v,/response\.status!==202/);
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar']){
  assert.match(copy,new RegExp('"'+lang+'":'));assert.match(vendor,new RegExp('"'+lang+'":'));
 }
 assert.ok(home.includes('language+"/apps"'));assert.ok(home.includes('language+"/models"'));
 assert.ok(home.includes('language+"/vendor/claim"'));
 assert.match(v,/language==='ar'\?'rtl':'ltr'/);
});
test('user-facing SEO routes index only via official market release gate; vendor forms never index',async()=>{
 const [r,s,apps,models,claim]=await Promise.all([
  read('app/robots.ts'),read('app/sitemap.ts'),read('app/[lang]/apps/layout.tsx'),
  read('app/[lang]/models/layout.tsx'),read('app/[lang]/vendor/claim/layout.tsx')
 ]);
 assert.match(r,/marketLocales\.map/);
 assert.match(s,/\['apps','models'\]/);
 assert.match(apps,/mayIndexMarket\(lang\)/);assert.match(models,/mayIndexMarket\(lang\)/);
 assert.match(apps,/from '\.\.\/\.\.\/\.\.\/lib\/market-index-policy'/);
 assert.match(models,/from '\.\.\/\.\.\/\.\.\/lib\/market-secondary-i18n'/);
 assert.match(claim,/index:false,follow:false/);
});
