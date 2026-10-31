import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('unused module audit is non-destructive and stays in AI market directory',async()=>{
 const audit=await read('scripts/audit-obsolete-workspace.mjs');
 assert.match(audit,/const projectRoot=path\.resolve\(path\.dirname\(fileURLToPath\(import\.meta\.url\)\),'\.\.'\)/);
 assert.match(audit,/deletionPerformed:false/);
 assert.match(audit,/status:'REVIEW_NOT_DELETE'/);
 assert.match(audit,/No deletion is performed/);
 for(const command of [/rmSync\s*\(/,/unlinkSync\s*\(/,/rmdirSync\s*\(/,/execSync\s*\(/,/spawnSync\s*\(/])assert.doesNotMatch(audit,command);
 assert.match(audit,/\.env/);
 assert.match(audit,/D:\\\\CQWE/);
});

test('staging indexing is blocked unless an explicit reviewed-locale allowlist is enabled',async()=>{
 const policy=await read('lib/market-index-policy.ts');
 const robots=await read('app/robots.ts'),sitemap=await read('app/sitemap.ts');
 const layout=await read('app/layout.tsx'),localized=await read('app/[lang]/ai/page.tsx');
 assert.match(policy,/AI_MARKET_INDEX_READY/);
 assert.match(policy,/AI_MARKET_INDEXED_LOCALES/);
 assert.match(policy,/VERCEL_ENV!=='preview'/);
 assert.match(policy,/marketCanonicalOrigin=verifiedMarketOrigin\(\)\|\|/);
 assert.match(policy,/AI_MARKET_DOMAIN_VERIFIED/);
 assert.match(policy,/marketLocales=\['zh','en','ja','ko','fr','de','es','pt','ar'\]/);
 assert.match(robots,/disallow:'\/'/);
 assert.match(robots,/mayIndexMarket/);
 assert.match(sitemap,/indexableMarketLocales/);
 assert.match(layout,/mayIndexMarket\(\)/);
 assert.match(localized,/alternatesForMarket/);
});
