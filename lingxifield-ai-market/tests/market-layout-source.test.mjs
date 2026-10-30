import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const page=await readFile(new URL('../app/market-workbench.tsx',import.meta.url),'utf8');
test('public source feeds stay behind optional disclosure below the product list',()=>{
 const catalog=page.indexOf('<div className="panel ranking">');
 const disclosure=page.indexOf('<details className="panel sourceDisclosure">');
 assert.ok(catalog>0 && disclosure>catalog);
 assert.ok(page.includes('<HfModelRankings/>'));
 assert.ok(page.includes('<MarketCoverageStrip/>'));
 assert.ok(page.includes('<PublicRepoSignals/>'));
 assert.ok(!page.includes('className="marketUtility"'));
});
test('catalog prioritizes free quota and price instead of blank traffic or SEO table cells',()=>{
 for(const f of ['主要用途','免费使用','价格与套餐','官网查看'])assert.ok(page.includes(f));
 assert.ok(!page.includes('<td>暂无可靠数据</td>'));
});
