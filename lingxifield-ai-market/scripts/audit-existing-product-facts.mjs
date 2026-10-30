// Prioritize filling verified fields for existing catalog records before discovering more products.
// Read-only, no network calls, never confuses catalog metadata with verified commercial facts.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const catalog=JSON.parse(await readFile(resolve(root,'data/catalog.json'),'utf8'));
const factsSource=await readFile(resolve(root,'lib/reviewed-product-facts.ts'),'utf8');
const productIDs=new Set([...factsSource.matchAll(/\{product:\s*"([^"]+)",observedAt:/g)].map(x=>x[1]));
const keys=['purpose','free','price','region','watermark','commercial','failure','refund','phone','card','models'];
const results=catalog.map(p=>({
 id:p.id,name:p.name,category:p.category,site:p.website,
 reviewedFactSnapshotPresent:productIDs.has(p.id),missingSourceReview:!productIDs.has(p.id),
 // Static audit only: full facts and current validity require runtime or manual validation.
 priority:productIDs.has(p.id)?'RECHECK_EXISTING_FIELDS':'VERIFY_FIRST_FACTS',
 requiredFields:keys
}));
const summary={schema:'ai_market_existing_product_audit_v1',total:catalog.length,
 hasReviewedSnapshot:results.filter(x=>x.reviewedFactSnapshotPresent).length,
 noReviewedSnapshot:results.filter(x=>!x.reviewedFactSnapshotPresent).length,
 notice:'Presence is not validity; this audit does not assert current pricing, mainland availability or SEO/GEO.'};
const out=resolve(root,'reports/product-facts-coverage');await mkdir(out,{recursive:true});
await writeFile(resolve(out,'existing-product-coverage.json'),JSON.stringify({summary,results},null,2)+'\n');
console.log(JSON.stringify({...summary,report:resolve(out,'existing-product-coverage.json')},null,2));
