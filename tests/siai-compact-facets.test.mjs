import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {filterMarketRows,marketFacetCounts,taskMatches} from '../lib/siai-home-facets.ts';

const base={company:'Fixture',legal:null,kind:'company',listing:'unconfirmed',
 year:null,about:'',strength:'',models:'',region:'',payment:'',paymentSource:null,
 free:'',freeSource:null,price:'',commercial:'',features:[],category:'综合助手'};
const row=(id,parts={})=>({id,name:id,...base,...parts});
const rows=[
 row('video-only',{category:'视频生成',features:['图生视频','短剧视频'],free:'无免费额度'}),
 row('image-only',{category:'图片生成',features:['图片生成']}),
 row('both',{category:'视频生成',features:['文生视频','图片创作'],free:'免费额度每天更新',freeSource:'https://example.com/free',payment:'微信支付',paymentSource:'https://example.com/pay'}),
 row('editor-only',{category:'视频剪辑',features:['视频剪辑','音频转文字']}),
 row('wrong-pay',{category:'图片生成',features:['图片生成'],payment:'不支持微信支付',paymentSource:'https://example.com/pay'}),
 row('card-only',{category:'编程开发',features:['代码开发'],payment:'信用卡',paymentSource:'https://example.com/pay'}),
 row('prototype-only',{category:'设计',features:['AI原型','设计转应用']}),
 row('node-workflow-only',{category:'编程开发',features:['节点工作流']})
];
const criteria={query:'',category:'*',task:'all',payment:'any',evidence:'all',sort:'catalog'};
const match=(overrides={})=>filterMarketRows(rows,{...criteria,...overrides}).map(x=>x.id);

test('image generation and image creation are one capability; image-to-video is NOT image generation',()=>{
 assert.deepEqual(match({task:'image'}),['image-only','both','wrong-pay']);
 assert.deepEqual(match({query:'图片创作'}),['image-only','both','wrong-pay']);
 assert.deepEqual(match({query:'图片生成'}),['image-only','both','wrong-pay']);
 assert.equal(taskMatches(rows[0],'image'),false);
 assert.equal(taskMatches(rows[3],'video'),false);
 assert.equal(taskMatches(rows[6],'image'),false);
 assert.equal(taskMatches(rows[7],'agent'),false);
});
test('real user questions AND capabilities and respect sourced free/checkout evidence',()=>{
 assert.deepEqual(match({query:'能同时做图片和视频的平台'}),['both']);
 assert.deepEqual(match({query:'generate both images and videos'}),['both']);
 assert.deepEqual(match({query:'免费生成视频'}),['both']);
 assert.deepEqual(match({query:'free video generators'}),['both']);
 assert.deepEqual(match({query:'微信支付'}),['both']);
 assert.deepEqual(match({payment:'wechat'}),['both']);
 assert.deepEqual(match({payment:'card'}),['card-only']);
});
test('facet counts describe rows not brand marketing strings, and do not sum to 62',()=>{
 const counts=marketFacetCounts(rows,criteria);
 assert.equal(counts.task.all,8);
 assert.equal(counts.task.image,3);
 assert.equal(counts.task.video,2);
 assert.equal(counts.payment.wechat,1);
 assert.equal(counts.payment.card,1);
 const narrowed=marketFacetCounts(rows,{...criteria,task:'video'});
 assert.equal(narrowed.payment.wechat,1);
 assert.equal(narrowed.payment.card,0);
});
test('UI never edits 62-row source facts, table pinning or both synchronized scrollers',()=>{
 const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
 const component=read('components/SiaiRankingHome.tsx'),css=read('app/siai-home.css');
 const catalog=read('app/siai/catalog-data.ts');
 assert.match(catalog,/curated\.length!==32\|\|rows\.length!==62/);
 assert.match(component,/marketFacetCounts\(/);
 assert.match(component,/className="siai-home-four-filters siai-filter-compact"/);
 assert.doesNotMatch(component,/<strong>\{ui\.category\}<\/strong>/);
 assert.match(component,/siai-home-top-scroll/);
 assert.match(component,/siai-home-bottom-track/);
 assert.match(component,/siai-floating-header/);
 assert.match(css,/SIAI 2026-11-05: first-screen compact discovery/);
});
