import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('single compact market row has official, desktop, mobile, detail, comparison and claim',async()=>{
 const main=await read('app/market-workbench.tsx');
 const actions=await read('app/market-row-actions.tsx');
 assert.ok(main.includes('className="marketDirectoryTable"'));
 assert.ok(main.includes('id="tools-list"'));
 assert.ok(main.includes('<MarketRowActions platform={p}'));
 assert.ok(main.includes('官网 · 下载 · 认领'));
 assert.ok(main.includes('免费和付费能做什么'));
 assert.ok(main.includes('价格 · 水印'));
 assert.ok(actions.includes("platformLinks(platform.id).links.filter(safePublisherLink)"));
 assert.ok(actions.includes('电脑下载'));
 assert.ok(actions.includes('手机下载'));
 assert.ok(actions.includes('vendorRowClaim'));
 assert.ok(actions.includes('onToggleCompare'));
 assert.ok(actions.includes("'/vendor/claim?'"));
});
test('no separate card downloads maze; legacy path opens the homepage list',async()=>{
 const page=await read('app/downloads/page.tsx');
 const home=await read('app/market-workbench.tsx');
 assert.ok(page.includes("redirect('/#tools-list')"));
 assert.ok(!page.includes('downloadCards'));
 assert.ok(home.includes('href="/#tools-list"'));
 assert.ok(home.includes('href="/vendor/claim"'));
});
test('action controls fit in a narrow two-column cell',async()=>{
 const css=await read('app/globals.css');
 assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
 assert.ok(css.includes('.marketDirectoryTable th:nth-child(5)'));
 assert.ok(css.includes('.vendorRowClaim'));
});
