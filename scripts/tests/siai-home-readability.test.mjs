import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');

test('both SIAI tables keep full data in detail while compact previews prevent tall rows',()=>{
 const home=read('components/SiaiRankingHome.tsx');
 const css=read('app/siai-home.css');
 const market=read('lingxifield-ai-market/app/globals.css');
 for(const render of ['displayStrength(p)','displayFact(p,"price")','displayFact(p,"free")','displayRegion(p)','displayPayment(p)','displayFact(p,"models")','displayCommercial(p)']){
  assert.ok(home.includes('title={'+render+'}'),render+' localized full fact tooltip missing');
 }
 assert.doesNotMatch(home,/title=\{p\.(?:price|free|region|payment|models|commercial)\}/);
 assert.match(home,/expanded===p\.id/);
 assert.match(home,/siai-home-expanded-row/);
 assert.match(home,/colSpan=\{10\}/);
 assert.match(home,/aria-controls=\{"siai-detail-"\+p\.id\}/);
 assert.doesNotMatch(home,/shown\.some\(p=>p\.id===expanded\)/);
 assert.match(home,/<Source href=\{p\.priceSource\}/);
 assert.match(home,/<Source href=\{p\.paymentSource\}/);
 assert.match(home,/\[p\.paymentSource,t\.payment\]/);
 assert.match(home,/\[t\.payment,\(p:SiaiHomeRow\)=>displayPayment\(p\),\(p:SiaiHomeRow\)=>p\.paymentSource\]/);
 assert.match(home,/p\.commercialSource/);
 assert.match(css,/siai-cell-preview.*-webkit-box/);
 assert.match(css,/-webkit-line-clamp:4/);
 assert.match(market,/Compact legacy market matrix/);
 assert.match(market,/marketOverviewPrice>strong/);
 assert.doesNotMatch(market,/\.marketV36Model,\.marketV36Business/);
});
test('multilingual category selector reuses shared locale vocabulary',()=>{
 const home=read('components/SiaiRankingHome.tsx');
 const vocab=read('lingxifield-ai-market/lib/market-home-i18n.ts');
 assert.match(home,/import \{localizedCategory\}/);
 assert.match(home,/localizedCategory\(lang,c\)/);
 assert.match(home,/localizedProductSummary\(p\.id,lang\)/);
 assert.match(home,/localizedCatalogFact\(p\.id,lang,scope,p\[scope\]\)/);
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar'])assert.ok(home.includes(lang+':{title:'),lang);
 assert.match(vocab,/export function localizedCategory/);
});
test('market table supports safe sticky columns and scroll without compacting the legal fact cell',()=>{
 const css=read('app/siai-home.css'),market=read('lingxifield-ai-market/app/globals.css');
 assert.match(css,/\.siai-home-table-scroll\{[^}]*overflow-x:auto/);
 assert.match(css,/inset-inline-start:45px/);
 assert.match(css,/@media\(max-width:550px\)/);
 assert.match(market,/marketPublisherFactStackCompact\{background:transparent!important;border:0!important/);
 assert.match(market,/\.marketPublisherFactStackCompact\{min-width:0!important/);
});

test('task-first SIAI comparison shows evidenced review freshness without inventing live payment or user checkout tests',()=>{
 const home=read('components/SiaiRankingHome.tsx');
 const page=read('app/page.tsx');
 const model=read('lingxifield-ai-market/lib/market-researched-facts.ts');
 assert.match(page,/checkedAt:fact\?marketProductReviewedAt\(id\):null/);
 assert.match(home,/checkedAt:string\|null/);
 assert.match(home,/REVIEWED_COPY:Record<LingxiLang,string>/);
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar'])assert.ok(home.includes(lang+':'),lang);
 assert.match(home,/<time dateTime=\{p.checkedAt\}>\{p.checkedAt\}<\/time>/);
 assert.match(home,/className="siai-checked-date"/);
 assert.match(model,/lovable:'2026-11-03'/);
 assert.match(model,/replit:'2026-11-02'/);
 assert.match(model,/midjourney:'2026-11-02'/);
 assert.doesNotMatch(home,/Math\.random\(/);
});

test('verified payment conditions are not stripped by a Stripe Link shortcut',()=>{
 const home=read('components/SiaiRankingHome.tsx');
 assert.match(home,/p\.payment\.split\(' · '\)\.map\(s=>localizedPaymentName\(s,lang\)\)/);
 assert.doesNotMatch(home,/Link（Stripe\/\.test/);
 assert.match(home,/title=\{displayPayment\(p\)\}/);
});

test('all SIAI homepage visible labels including 550px mobile facets meet minimum 14px text contract',()=>{
 const css=read('app/siai-home.css');
 for(const match of css.matchAll(/font-size:(\d+)px/g))
  assert.ok(Number(match[1])>=14,'unreadably small source/menu/company/label text: '+match[0]);
 assert.match(css,/\.siai-home-identity dt\{[^}]*font-size:14px/);
 assert.match(css,/\.siai-source\{[^}]*font-size:14px/);
 assert.match(css,/\.siai-home-actions>a,\.siai-home-actions>button\{[^}]*font-size:14px/);
 assert.match(css,/@media\(max-width:550px\)/);
 assert.match(css,/\.siai-filter-line>strong\{font-size:14px\}/);
});

test('Runway corporate legal entity is sourced to Trust Center rather than inferred from product name',()=>{
 const src=read('lingxifield-ai-market/lib/market-company-evidence.ts');
 assert.match(src,/runway:\{kind:'company',publisherSource:'https:\/\/trust.runwayml.com\/',legalEntity:fact\('Runway AI, Inc\.'/);
 assert.match(src,/legalEntityScope:'service_operator',founded:/);
 assert.match(src,/fact\('Runway AI, Inc\.','https:\/\/trust.runwayml.com\/','2026-11-03'\)/);
});

test('nine-language product detail breadcrumbs and official evidence links are readable at 14px or above',()=>{
 const css=read('app/siai-detail.css');
 for(const match of css.matchAll(/font-size:(\d+)px/g))
  assert.ok(Number(match[1])>=14,'detail text below 14px: '+match[0]);
 assert.match(css,/\.siai-detail-facts dd a\{[^}]*font-size:14px/);
});
