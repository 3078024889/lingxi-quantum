import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('independent SERP and GEO comparisons require a shared raw capture group',()=>{
 const source=read('lib/seo-geo-observations.ts');
 assert.ok(source.includes('captureGroupId?:string'));
 assert.ok(source.includes("typeof o.captureGroupId!=='string'"));
 assert.ok(source.includes("row.captureGroupId||''"));
 assert.ok(source.includes('new Set(rows.map(x=>x.platformId)).size===rows.length'));
 assert.ok(source.includes("o.source==='independent_serp'||o.source==='ai_answer_citation'"));
 assert.ok(source.includes("o.rawCaptureSha256!=='string'"));
});

test('SEO board distinguishes owned Search Console average position from independent SERP rank',()=>{
 const board=read('app/seo-geo-board.tsx');
 assert.ok(board.includes('Google Search Console average position, impressions and clicks for our own pages'));
 assert.ok(board.includes('independent Google/Bing result ranks are measured separately'));
 assert.ok(board.includes('Google Search Console 统计本站平均排名、曝光与点击'));
 assert.doesNotMatch(board,/indexed pages|已收录页面|색인 페이지/);
});
