import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('single compact market row has official, desktop, mobile, detail, comparison and claim',async()=>{
 const main=await read('app/market-workbench.tsx');
 const actions=await read('app/market-row-actions.tsx');
 const row=await read('app/market-matrix-row.tsx');
 const headings=await read('lib/market-matrix-headings.ts');
 assert.ok(main.includes('className="marketOverviewTable"'));
 assert.ok(main.includes('id="tools-list"'));
 assert.ok(main.includes('<MarketMatrixRow language={language} region={region} paymentFilter={paymentFilter} key={p.id}'));
 for(const label of ['官网 · 下载','免费额度','实际价格'])assert.ok(headings.includes(label));
 assert.ok(main.includes('marketRowTitles(language).map'));
 assert.ok(actions.includes("platformLinks(platform.id).links.filter(safePublisherLink)"));
 assert.ok(actions.includes("download:'官方下载'"));
 assert.ok(actions.includes("l.kind==='desktop'||l.kind==='ios'||l.kind==='android'"));
 assert.ok(main.includes('href="/vendor/claim"'));
 assert.ok(actions.includes('claimUrl'));
 assert.ok(actions.includes('onToggleCompare'));
 assert.ok(actions.includes('platform.websiteKind'));
 assert.ok(row.includes('onToggleCompare'));
 assert.ok(row.includes('onDetail'));
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
 assert.ok(css.includes('.marketMatrixTable th:nth-child(9)'));
 assert.ok(css.includes('.vendorRowClaim'));
});
