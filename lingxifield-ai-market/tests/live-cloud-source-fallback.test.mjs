import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=async p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('cloud model comparison has a bounded official URL to public aggregated price fallback',async()=>{
 const text=await source('app/api/v1/models/groups/route.ts');
 assert.ok(text.includes("https://models.dev/api.json"));
 assert.ok(text.includes("next:{revalidate:3600}"));
 assert.ok(text.includes("raw.length>26000000"));
 assert.ok(text.includes("count>50000"));
 assert.ok(text.includes("sourceMode:'public_aggregator_live'"));
 assert.ok(text.includes("Prices are models.dev aggregator observations"));
 assert.ok(!text.includes("local_group_index_missing"));
});
test('cloud AI apps page can discover official Hugging Face Spaces without local D drive data',async()=>{
 const text=await source('app/api/v1/products/all/route.ts');
 for(const v of ["https://huggingface.co/api/spaces","source:'Hugging Face Spaces public API'","reviewStatus:'candidate'","partialCatalog:true","SOURCE_TEMPORARILY_UNAVAILABLE"])assert.ok(text.includes(v),v);
 assert.ok(text.includes("next:{revalidate:1800}"));
 assert.ok(text.includes("raw.length>4000000"));
 assert.ok(!text.includes("product_inventory_missing"));
});
test('evidence-first public cards are not dominated by engineering measurements',async()=>{
 const home=await source('app/market-workbench.tsx');
 const decisions=await source('app/market-decision-cards.tsx');
 assert.ok(home.includes('<PriceLeaderboards language={language}/>'));
 assert.ok(!home.includes('<HfModelRankings/>'));
 assert.ok(home.includes('hc.resultsTitle'));
 const headings=await source('lib/market-matrix-headings.ts');
 assert.ok(home.includes('marketRowTitles(language).map'));
 assert.ok(headings.includes('免费额度'));
 assert.ok(headings.includes('代表模型'));
 assert.ok(headings.includes('实际价格'));
 assert.ok(headings.includes('SEO · GEO'));
 assert.ok(!home.includes('<div className="marketUtility">'));
 assert.ok(decisions.includes('guide.source'));
 assert.ok(decisions.includes('guide.free'));
 assert.ok(!decisions.includes('{covered}/6'));
});
