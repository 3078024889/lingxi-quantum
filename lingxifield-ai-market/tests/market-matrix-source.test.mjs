import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const matrix=await read('app/market-matrix.tsx');
const home=await read('app/market-workbench.tsx');
const css=await read('app/market-matrix.css');
const facts=await read('lib/reviewed-product-facts.ts');

test('16 independent columns serve users instead of compressed marketing labels',()=>{
 const cols=matrix.match(/export const MATRIX_COLUMNS = \[([\s\S]*?)\] as const/);
 assert.ok(cols,'matrix column contract missing');
 const names=Array.from(cols[1].matchAll(/'([^']+)'/g),match=>match[1]);
 assert.equal(names.length,16);
 assert.equal(new Set(names).size,16);
 for(const name of ['models','reasoning','beginner','free','price','limits','regions','rights','access','visibility','official','actions'])assert.ok(names.includes(name),name);
 assert.match(home,/<MarketMatrix rows=\{filtered\}/);
 assert.doesNotMatch(home,/<th>#<\/th><th>AI 平台/);
});
test('labels cover nine languages, including Arabic RTL',()=>{
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar'])assert.match(matrix,new RegExp('\\b'+lang+':\\['));
 assert.match(matrix,/language==='ar'\?'rtl':'ltr'/);
 assert.match(css,/right:52px/);
});
test('evidence is linked and unknown ranking stays unscored',()=>{
 assert.match(matrix,/evidenceCell\(model,c.models\)/);
 assert.match(matrix,/evidenceCell\(reasoning,c.reasoning\)/);
 assert.match(matrix,/href=\{c.source\}/);
 assert.match(matrix,/No comparable SEO\/GEO ranking/);
 assert.match(matrix,/Row numbers are not rankings/);
 assert.doesNotMatch(matrix,/Math\.random\(|fakeScore|seoScore:9/);
});
test('open-source repository is not advertised as a downloaded app',()=>{
 assert.match(matrix,/new URL\(p.website\)\.hostname==='github.com'/);
 assert.match(matrix,/isRepo\?c.repository:c.open/);
 assert.match(matrix,/c.download/);
 assert.match(matrix,/noopener noreferrer/);
});
test('beginner browsing is functional but does not pretend to be a blind benchmark',()=>{
 assert.match(home,/tab==='新手友好榜'\?beginnerCandidates\(results\):results/);
 assert.match(home,/本页先显示有在线网站的产品/);
 assert.match(matrix,/rows.filter\(p=>!isDeveloperEntry\(p\)\)/);
 assert.match(home,/onCompare=\{toggle\}/);
 assert.match(css,/position:sticky/);
 assert.match(css,/overflow-x:auto/);
});
test('official model family claims keep product versus API scope',()=>{
 for(const name of ['chatgpt','claude','gemini','runway']) assert.match(facts,new RegExp('product:"'+name+'",observedAt:currentDay'));
 assert.match(facts,/API 模型目录；不是 Gemini App/);
 assert.match(facts,/不是独立跨平台胜负结论/);
 assert.match(facts,/推理与理解能力/);
});
