import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {filterMarketRows,hasSourcedFreeOffer,toggleMarketComparison,MAX_COMPARISONS,
 TASK_FACETS,PAYMENT_FACETS,EVIDENCE_FACETS,SORT_OPTIONS} from '../../lib/siai-home-facets.ts';
const sample=(id,overrides={})=>({
 id,name:id,company:'Publisher '+id,legal:null,kind:'company',listing:'unconfirmed',year:null,category:'综合助手',
 about:'AI assistant for research',strength:'研究与文献搜索',features:['联网研究'],models:'Model X',region:'US',
 payment:'银行卡',paymentSource:'https://example.com/payments',free:'免费基础方案',
 freeSource:'https://example.com/free',price:'$20/mo',commercial:'Read terms',...overrides
});
const read=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');

test('free access filter requires source and affirmative offer; cannot infer it from unknowns',()=>{
 assert.equal(hasSourcedFreeOffer(sample('yes')),true);
 assert.equal(hasSourcedFreeOffer(sample('unknown',{freeSource:null})),false);
 assert.equal(hasSourcedFreeOffer(sample('paid',{free:'无免费方案'})),false);
 assert.equal(hasSourcedFreeOffer(sample('paid2',{free:'No free plan available'})),false);
 assert.equal(hasSourcedFreeOffer(sample('dash',{free:'—'})),false);
});
test('payment match requires an actual source for supported checkout rails',()=>{
 const rows=[
  sample('alipay',{payment:'支付宝 · 微信支付',paymentSource:'https://vendor.com/help'}),
  sample('unsourced',{payment:'Alipay',paymentSource:null}),
  sample('paypal',{payment:'PayPal · Credit card',paymentSource:'https://vendor.com/pricing'}),
 ];
 const base={query:'',category:'*',task:'all',payment:'alipay',evidence:'all',sort:'catalog'};
 assert.deepEqual(filterMarketRows(rows,base).map(p=>p.id),['alipay']);
 assert.deepEqual(filterMarketRows(rows,{...base,payment:'paypal'}).map(p=>p.id),['paypal']);
 assert.deepEqual(filterMarketRows(rows,{...base,payment:'wechat'}).map(p=>p.id),['alipay']);
});
test('task, categories, corporate state and query refine actual evidence without dropping original ordering',()=>{
 const rows=[
  sample('video',{category:'视频生成',about:'生成短视频',strength:'视频生成',features:['图生视频'],listing:'listed_parent'}),
  sample('code',{category:'编程开发',about:'网页编程',strength:'代码',features:['本地部署'],kind:'open_source_project',freeSource:null}),
  sample('research',{category:'搜索研究',about:'搜索研究与来源引用',strength:'文献研究',features:['搜索'],year:'2018'}),
 ];
 const base={query:'',category:'*',task:'all',payment:'any',evidence:'all',sort:'catalog'};
 assert.deepEqual(filterMarketRows(rows,{...base,task:'video'}).map(x=>x.id),['video']);
 assert.deepEqual(filterMarketRows(rows,{...base,task:'code'}).map(x=>x.id),['code']);
 assert.deepEqual(filterMarketRows(rows,{...base,category:'搜索研究'}).map(x=>x.id),['research']);
 assert.deepEqual(filterMarketRows(rows,{...base,evidence:'listed_parent'}).map(x=>x.id),['video']);
 assert.deepEqual(filterMarketRows(rows,{...base,evidence:'open_source'}).map(x=>x.id),['code']);
 assert.deepEqual(filterMarketRows(rows,{...base,query:'文献'}).map(x=>x.id),['research']);
 assert.deepEqual(filterMarketRows(rows,base).map(x=>x.id),['video','code','research']);
});
test('founded sorts leave unknown last instead of inventing a year or popularity rank',()=>{
 const rows=[sample('unknown'),sample('new',{year:'2024'}),sample('old',{year:'2007-02-01'})];
 const base={query:'',category:'*',task:'all',payment:'any',evidence:'all',sort:'oldest'};
 assert.deepEqual(filterMarketRows(rows,base).map(x=>x.id),['old','new','unknown']);
 assert.deepEqual(filterMarketRows(rows,{...base,sort:'newest'}).map(x=>x.id),['new','old','unknown']);
});
test('comparison rejects unknown IDs and caps entries at three while preserving selection order',()=>{
 const known=['a','b','c','d'];
 let ids=[];
 for(const id of ['a','b','c','d','forged'])ids=toggleMarketComparison(ids,id,known);
 assert.equal(MAX_COMPARISONS,3);
 assert.deepEqual(ids,['a','b','c']);
 ids=toggleMarketComparison(ids,'b',known);
 assert.deepEqual(ids,['a','c']);
 ids=toggleMarketComparison(ids,'d',known);
 assert.deepEqual(ids,['a','c','d']);
});
test('homepage has four actual always-present filter lanes, verified payments, compare sources and RTL',()=>{
 const home=read('components/SiaiRankingHome.tsx'),css=read('app/siai-home.css'),server=read('app/page.tsx');
 assert.match(home,/siai-home-four-filters/);
 assert.equal((home.match(/className="siai-filter-line"/g)||[]).length,4);
 for(const key of ['TASK_FACETS','PAYMENT_FACETS','EVIDENCE_FACETS','SORT_OPTIONS','filterMarketRows','toggleMarketComparison'])
  assert.ok(home.includes(key));
 assert.match(home,/siai-compare-scroller/);
 assert.match(home,/compareIds\.length>=MAX_COMPARISONS/);
 assert.match(home,/aria-pressed=\{compareIds\.includes\(p\.id\)\}/);
 assert.match(server,/paymentSource:fact\?\.paymentSource\|\|null/);
 assert.match(css,/siai-filter-options\{[^}]*flex-wrap:wrap/);
 assert.match(css,/@media\(max-width:900px\)/);
 assert.match(css,/\[dir="rtl"\]/);
 assert.equal(TASK_FACETS.length,8);
 assert.equal(PAYMENT_FACETS.length,6);
 assert.equal(EVIDENCE_FACETS.length,5);
 assert.equal(SORT_OPTIONS.length,4);
});
test('all nine languages have translated labels for every facet option',()=>{
 const source=read('lib/siai-home-facet-labels.ts');
 for(const locale of ['zh','en','ja','ko','fr','de','es','pt','ar'])
  assert.ok(source.includes(locale+':{category:'),locale);
 for(const key of ['taskLabels','paymentLabels','evidenceLabels','sortLabels'])assert.ok(source.includes(key));
});
