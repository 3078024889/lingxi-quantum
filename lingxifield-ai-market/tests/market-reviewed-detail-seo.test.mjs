import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('preview stays noindex while reviewed product pages can appear only after verified production release',async()=>{
 const detail=await read('app/platform/[id]/page.tsx');
 const policy=await read('lib/market-index-policy.ts');
 const sitemap=await read('app/sitemap.ts');
 assert.match(detail,/capabilityProfile\(id\)&&mayIndexMarket\('zh'\)/);
 assert.match(detail,/marketCanonicalOrigin\+'\/platform\/'/);
 assert.match(policy,/process\.env\.VERCEL_ENV!=='preview'/);
 assert.match(policy,/AI_MARKET_INDEX_READY==='1'/);
 assert.match(policy,/AI_MARKET_INDEXED_LOCALES/);
 assert.match(sitemap,/languages\.includes\('zh'\)/);
 assert.match(sitemap,/entries\.filter\(entry=>Boolean\(capabilityProfile\(entry\.id\)\)\)/);
});
