import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL('../../'+path,import.meta.url),'utf8');
test('search reads actual identity status database column',async()=>{
 const schema=await read('supabase/migrations/20261029_ai_market_data_center_a.sql');
 const route=await read('app/api/ai-market/verified-search/route.ts');
 assert.match(schema,/status text not null default 'candidate'/);
 assert.match(route,/\.eq\('status','verified'\)/);
 assert.doesNotMatch(route,/verification_status/);
});
test('every public verified search proof is bound to the same product',async()=>{
 const source=await read('lib/ai-market/integration-read.mjs');
 const route=await read('app/api/ai-market/verified-search/route.ts');
 assert.match(source,/entity_id!==c\.entity_id/);
 assert.match(route,/id,entity_id,checked,source_url/);
});
test('Next 15 dynamic product routes await params',async()=>{
 const page=await read('app/ai-market/products/[id]/page.tsx');
 const api=await read('app/api/ai-market/products/[id]/route.ts');
 assert.match(page,/params:Promise<\{id:string\}>/);
 assert.match(page,/await params/);
 assert.match(api,/params:Promise<\{id:string\}>/);
 assert.match(api,/await params/);
});
test('public discovery is labeled non-ranking',async()=>{
 const source=await read('lib/ai-market/live-hub.mjs');
 const route=await read('app/api/ai-market/hub-live/route.ts');
 assert.match(source,/isRanking:false/);
 assert.match(route,/getLiveHub/);
});

test('CI install/typecheck are distinct YAML steps, not literal escaped newlines',async()=>{
 const ci=await read('.github/workflows/ai-market-review-gate.yml');
 assert.match(ci,/      - name: Install dependencies with lockfile\n        run: \|\n          corepack enable\n          pnpm install --frozen-lockfile\n      - name: TypeScript integration check\n        run: pnpm exec tsc --noEmit/);
 assert.doesNotMatch(ci,/lockfile\\\\n/);
});
