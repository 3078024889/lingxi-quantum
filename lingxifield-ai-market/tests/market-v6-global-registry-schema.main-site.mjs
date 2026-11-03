import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sql=readFileSync(new URL('../../supabase/migrations/20261102140000_ai_market_global_registry_staging.sql',import.meta.url),'utf8');
test('global company, product, verified facts, model offers and private batches use RLS',()=>{
 for(const table of ['ai_market_publishers_v1','ai_market_products_v1','ai_market_product_facts_v1',
 'ai_market_model_rate_offers_v1','ai_market_intake_batches_v1']){
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.'+table),table);
  assert.ok(sql.includes('ALTER TABLE public.'+table+' ENABLE ROW LEVEL SECURITY'),table);
  assert.ok(sql.includes('REVOKE ALL ON public.'+table+' FROM PUBLIC,anon,authenticated'),table);
 }
 assert.match(sql,/CHECK\(planned_products BETWEEN 1 AND 10\)/);
 assert.match(sql,/PRODUCT_FACTS_NOT_COMPLETE/);
 assert.match(sql,/PUBLISHER_NOT_APPROVED/);
 assert.doesNotMatch(sql,/GRANT (?:INSERT|UPDATE|DELETE) ON public\.ai_market_[a-z_0-9]+ TO anon,authenticated/);
});
test('global registry publisher/product roles cannot collapse company onto every product',()=>{
 assert.match(sql,/publisher_key text PRIMARY KEY/);
 assert.match(sql,/product_key text PRIMARY KEY/);
 assert.match(sql,/REFERENCES public\.ai_market_publishers_v1\(publisher_key\)/);
 assert.match(sql,/CHECK\(kind IN \('company','open_source_project','software_library'\)\)/);
 assert.match(sql,/count\(DISTINCT fact_key\)/);
});
test('protected public facts and offers cannot leak when publisher retired',()=>{
 assert.match(sql,/ai_market_product_facts_v1_public/);
 assert.match(sql,/ai_market_model_rate_offers_v1_public/);
 assert.match(sql,/publication_state='published'/);
 assert.match(sql,/review_state='verified'/);
 const ci=readFileSync(new URL('../../.github/workflows/ai-market-postgres-isolated.yml',import.meta.url),'utf8');
 for(const must of ['UNAPPROVED_COMPANY_PUBLISHED_PRODUCT','UNVERIFIED_FACTS_PUBLISHED_PRODUCT',
 'RETIRED_COMPANY_STILL_VISIBLE','CATALOG_CLIENT_WRITE_OR_INTAKE_READ'])assert.ok(ci.includes(must),must);
});
