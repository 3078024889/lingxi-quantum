// Existing product review queue: official URLs are hints, not auto-verified commercial facts.
// No network fetch, database mutation, discovery of new products, or fabricated SEO metrics.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const catalog=JSON.parse(await readFile(resolve(root,'data/catalog.json'),'utf8'));
const source=await readFile(resolve(root,'lib/reviewed-product-facts.ts'),'utf8');
const snapshots=[...source.matchAll(/\{product:\s*"([^"]+)",observedAt:/g)].map(x=>x[1]);
const byId=new Set(snapshots);
const fields=['purpose','free','price','region','watermark','commercial','failure','refund','phone','card','models','companyFounded','funding','listing','seo','geo','traffic','userExperience'];
const queue=catalog.map(p=>({
 productId:p.id,platform:p.name,company:p.company,category:p.category,site:p.website,
 existingSnapshot:byId.has(p.id),
 verificationRequired:fields.map(field=>({field,state:'not_confirmed_by_this_audit',source:null,checkedAt:null,reviewer:null})),
 note:byId.has(p.id)?'Existing evidence code needs per-field verification and freshness review.':'No reviewed evidence snapshot found.'
}));
const out=resolve(root,'reports/existing-product-gate');await mkdir(out,{recursive:true});
await writeFile(resolve(out,'review-queue.json'),JSON.stringify({schema:'lingxifield_existing_review_queue_v1',count:queue.length,fields,queue},null,2)+'\n');
console.log(JSON.stringify({products:queue.length,withSnapshot:queue.filter(x=>x.existingSnapshot).length,output:out}));
