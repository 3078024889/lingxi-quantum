import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('detail first screen exposes the six practical decisions',async()=>{
 const component=await read('app/market-decision-cards.tsx');
 for(const label of ['免费额度','实际价格','失败会扣费吗？','地区与使用门槛','导出和水印','能否商用？']){
  assert.ok(component.includes(label),'missing '+label);
 }
 const page=await read('app/market-workbench.tsx');
 const cardAt=page.indexOf('<MarketDecisionCards platform={target}');
 const tabsAt=page.indexOf('<div className="detailTabs">');
 assert.ok(cardAt>0 && tabsAt>cardAt,'decision answers must precede detail tabs');
});

test('decision cards keep unknown values unknown and link official dated evidence',async()=>{
 const component=await read('app/market-decision-cards.tsx');
 assert.ok(component.includes("platform.conditions || []"));
 assert.ok(component.includes('known.map('));
 assert.ok(component.includes('missing.length>0'));
 assert.ok(!component.includes('已核验 {covered}/6'));
 assert.ok(component.includes('DECISION_TITLES[language]'));
 assert.ok(component.includes('href={card.fact.source}'));
 assert.ok(component.includes('card.fact.checkedAt'));
 assert.ok(component.includes('selectedForCompare'));
 assert.ok(component.includes('language?:Language'));
});

test('responsive cards do not force mobile horizontal overflow',async()=>{
 const css=await read('app/globals.css');
 assert.ok(css.includes('.decisionGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))'));
 assert.ok(css.includes('@media(max-width:600px){.decisionSurface{padding:14px}.decisionGrid{grid-template-columns:minmax(0,1fr)}'));
});
