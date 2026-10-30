import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const [source,component,row,home,decision]=await Promise.all([
 read('lib/global-region-market.ts'),read('app/market-global-access.tsx'),
 read('app/market-matrix-row.tsx'),read('app/market-workbench.tsx'),read('app/market-decision-cards.tsx')
]);
test('all nine UI languages independently translate region access and payments',()=>{
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar']){
  assert.match(source,new RegExp('\\b'+lang+':\\{region:'));
 }
 assert.match(source,/regionName\(country:RegionCode,lang:Language\)/);
 assert.match(source,/Intl\.DisplayNames/);
 assert.match(source,/type RegionCode='GLOBAL'/);
 assert.match(component,/dir=\{language==='ar'\?'rtl':'ltr'\}/);
});
test('user-selected country does not derive from UI language',()=>{
 assert.match(home,/useState<RegionCode>\('GLOBAL'\)/);
 assert.match(home,/<MarketRegionSelect language=\{language\} region=\{region\} onChange=\{setRegion\}\/>/);
 assert.match(home,/<MarketGlobalAccess platform=\{target\} language=\{language\} region=\{region\} onChange=\{setRegion\}\/>/);
 assert.match(home,/<MarketMatrixRow language=\{language\} region=\{region\}/);
 assert.doesNotMatch(source,/lang==='zh'\?'CN'/);
});
test('official support differs from direct reachability tests',()=>{
 assert.match(source,/reachability:'not_tested'/);
 assert.match(source,/const unsupported=/);
 assert.match(source,/CN:unsupported\(OPENAI_REGIONS\)/);
 assert.match(source,/CN:unsupported\(CLAUDE_REGIONS\)/);
 assert.match(source,/status:'conditional'.*GEMINI_REGIONS/s);
 assert.match(source,/paymentNote:'Publisher lists payment methods globally; not all methods are available in every country.'/);
});
test('payments depend on product, country and checkout route',()=>{
 assert.match(source,/Kakao Pay/);
 assert.match(source,/Naver Pay/);
 assert.match(source,/UPI \(Go \/ Plus only\)/);
 assert.match(source,/Pix \(Go \/ Plus \/ Pro\)/);
 assert.match(source,/Apple App Store \(mobile\)/);
 assert.match(source,/WeChat Pay/);
 assert.match(source,/Alipay/);
 assert.match(source,/Stripe Instant Bank Payments \(US only\)/);
 assert.match(source,/const isUnsupported=policy.status==='unsupported'/);
 assert.match(source,/isUnsupported\?\[\]/);
});
test('obsolete vague region/payment placeholders are not in product fact cards',()=>{
 assert.doesNotMatch(decision,/<h3>哪些地区能用<\/h3>/);
 assert.doesNotMatch(decision,/<h3>怎么付费<\/h3>/);
 assert.match(row,/globalRegionFact\(p.id,region\)/);
 assert.match(row,/regionName\(region,language\)/);
 assert.match(row,/localizedPaymentName\(x,language\)/);
 assert.match(component,/x\.policy\.source/);
 assert.match(component,/x\.payments\.source/);
});

test('top navigation uses nine localized labels without mutating underlying search tabs',async()=>{
 const nav=await read('lib/market-global-navigation.ts');
 for(const code of ['zh','en','ja','ko','fr','de','es','pt','ar'])assert.match(nav,new RegExp('\\b'+code+':\\{tabs:'));
 assert.match(home,/NAV_TABS\.map\(t=>/);
 assert.match(home,/navUi\.tabs\[t\]/);
 assert.match(home,/navUi\.downloads/);
 assert.match(home,/navUi\.claim/);
});
test('all ISO 3166-1 countries are selectable but not automatically declared supported',()=>{
 assert.match(source,/export const ALL_REGIONS/);
 const match=source.match(/'([A-Z]{2}(?:,[A-Z]{2}){230,})'\.split/);
 assert.ok(match);
 assert.ok(match[1].split(',').length>=240);
 assert.match(source,/p\?\.countries\[region\]\|\|p\?\.globalPolicy\|\|unknown/);
});
