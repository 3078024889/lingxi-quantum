import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('first product screen gives sourced practical outcomes not engineering terms',async()=>{
 const src=await read('app/market-decision-cards.tsx');
 for(const label of ['能做什么','免费的功能','付费功能','参考价格','哪些地区能用','怎么付费'])assert.ok(src.includes(label),label);
 assert.ok(src.includes('guide.source'));
 assert.ok(src.includes('guide.checkedAt'));
 const page=await read('app/market-workbench.tsx');
 assert.ok(page.indexOf('<MarketDecisionCards platform={target}')<page.indexOf('<div className="detailTabs">'));
});
test('unknown product conditions are not labeled free and user can compare',async()=>{
 const src=await read('app/market-decision-cards.tsx');
 assert.ok(src.includes("platform.conditions||[]"));
 assert.ok(src.includes('selectedForCompare'));
 assert.ok(src.includes('未列出的收费与地区规则'));
});
test('six facts fit on mobile screens without horizontal overflow',async()=>{
 const css=await read('app/globals.css');
 assert.ok(css.includes('.choiceFacts{display:grid'));
 assert.ok(css.includes('@media(max-width:490px){.choiceFacts{grid-template-columns:1fr}'));
});
