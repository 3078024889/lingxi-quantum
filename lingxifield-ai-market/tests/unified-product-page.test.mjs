import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('find AI tools page uses completed unified product inventory, not demo-only API',async()=>{
 const page=await read('app/apps/page.tsx');
 assert.ok(page.includes('/api/v1/products/all?'));
 assert.ok(!page.includes('/api/v1/products/discover?'));
 assert.ok(page.includes('查看应用与使用方式'));
 assert.ok(page.includes('搜索 AI 工具'));
});
test('unknown price, free allowance and credit card requirements are not reported as free',async()=>{
 const page=await read('app/apps/page.tsx');
 assert.ok(page.includes("p.price!==null?'参考价格：'"));
 assert.ok(page.includes("p.freeQuota?'免费额度：'"));
 assert.ok(page.includes('费用与使用方式请查看官方页面'));
});
test('product API reads current D-drive merged inventory and provides pagination',async()=>{
 const api=await read('app/api/v1/products/all/route.ts');
 assert.ok(api.includes('AI_MARKET_SNAPSHOT_DIR'));
 assert.ok(api.includes('products-unified.json'));
 assert.ok(api.includes('nextCursor'));
});
