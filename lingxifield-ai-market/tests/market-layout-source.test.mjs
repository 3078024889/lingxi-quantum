import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const page=await readFile(new URL('../app/market-workbench.tsx',import.meta.url),'utf8');
test('public homepage hides developer-only model-download tables',()=>{
 assert.ok(page.includes('<div className="panel ranking" id="tools-list">'));
 assert.ok(page.includes('<PriceLeaderboards/>'));
 assert.ok(!page.includes('<HfModelRankings/>'));
 assert.ok(!page.includes('sourceDisclosure'));
 assert.ok(!page.includes('className="marketUtility"'));
});
test('catalog explicitly tells users which features are free, paid and where to download',()=>{
 for(const f of ['免费与付费功能','价格 · 水印','官网 · 下载 · 认领','USER_TASKS','/#tools-list','MarketMatrixRow'])assert.ok(page.includes(f),f);
 assert.ok(!page.includes('<td>暂无可靠数据</td>'));
});
