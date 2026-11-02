import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {marketRegistryParams,marketIdParam} from '../lib/market-registry-params.mjs';
const s=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('publisher identity derives from one reviewed parent company map and never tool name heuristics',()=>{
 const e=s('lib/market-company-evidence.ts'),registry=s('lib/market-publisher-registry.ts');
 assert.match(e,/export function publisherIdentityFor\(productId:string\)/);
 assert.match(e,/const key=map\[productId\]/);
 assert.match(registry,/publisherIdentityFor\(id\)/);
 assert.match(registry,/companiesMap\.get\(owner\.id\)/);
 assert.match(registry,/COMPANY_KIND_MISMATCH/);
 assert.match(registry,/MARKET_API_PRODUCTS/);
 assert.doesNotMatch(registry,/company-intake\/batch-001|import .*candidate/i);
});
test('one company can supply several products, but SDK and open-source projects are separate from legal companies',()=>{
 const e=s('lib/market-company-evidence.ts');
 for(const r of ["'openai-python':'openai'","chatgpt:'openai'","whisper:'openai'","'anthropic-sdk-python':'anthropic'","claude:'anthropic'"])
 assert.ok(e.includes(r),r);
 const registry=s('lib/market-publisher-registry.ts');
 assert.match(registry,/kind==='company'/);
 assert.match(registry,/kind==='open_source_project'/);
 assert.match(registry,/kind==='software_library'/);
 assert.match(registry,/company\.productIds\.push\(id\)/);
});
test('model and developer API offers preserve unit, region, source, date and independent records',()=>{
 const registry=s('lib/market-publisher-registry.ts');
 for(const symbol of ['API_RATES','VIDEO_RATES','API_UNIT_RATES','rateOffers','modelRateOffers','region:r.region',
  'checkedAt:r.checkedAt','priceInPerMillion','pricePerSecond','billing','source:r.source'])
 assert.ok(registry.includes(symbol),symbol);
 assert.match(registry,/Rate offers are pricing rows, not distinct model counts/);
 assert.match(registry,/CURATED_PUBLISHER_EVIDENCE_MISSING/);
});
test('API never exposes unpublished next-ten staging or grants a paid ranking',()=>{
 const company=s('app/api/v1/companies/route.ts'),detail=s('app/api/v1/companies/[id]/route.ts'),rates=s('app/api/v1/model-offers/route.ts');
 for(const code of [company,detail,rates]){
  assert.doesNotMatch(code,/service_role|AI_MARKET_BILLING_ENABLED|company-intake\/batch|merchant_order/);
  assert.match(code,/X-Content-Type-Options/);
 }
 assert.match(detail,/PUBLISHER_NOT_IN_CURATED_32/);
});
test('public query parser bounded and rejects malformed ids and pagination',()=>{
 assert.deepEqual(marketRegistryParams(new URLSearchParams('q=OpenAI&limit=5&cursor=2')),{q:'OpenAI',limit:5,cursor:2});
 for(const input of ['limit=-1','limit=0','limit=51','limit=1e2','cursor=-1','cursor=1.9','cursor=100001','q='+ 'a'.repeat(121)])
 assert.equal(marketRegistryParams(new URLSearchParams(input)),null,input);
 assert.equal(marketIdParam('openai'), 'openai');
 for(const id of ['../../admin','DROP TABLE','a%2Fb','', 'ΑBC'])assert.equal(marketIdParam(id),null,id);
});
test('company directory uses all nine languages, organic linked products and real publisher URLs',()=>{
 const page=s('app/[lang]/companies/page.tsx'),copy=s('lib/market-company-directory-copy.ts');
 for(const l of ['zh','en','ja','ko','fr','de','es','pt','ar'])assert.ok(copy.includes(l+':{'),l);
 assert.match(page,/MARKET_COMPANIES/);assert.match(page,/mayIndexMarket\(lang\)/);
 assert.match(page,/c\.officialSource/);assert.match(page,/c\.productIds\.map\(/);
 assert.match(page,/lang==='ar'\?'rtl':'ltr'/);
 assert.match(s('app/market-workbench.tsx'),/\/"\+language\+"\/companies"/);
});
