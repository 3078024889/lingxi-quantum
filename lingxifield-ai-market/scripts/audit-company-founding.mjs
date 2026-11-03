/** Read-only, deterministic audit of 32 source-backed product-to-publisher mappings. */
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const evidence=read('lib/market-company-evidence.ts');
const market=read('lib/market-api-service-catalog.ts');
const block=evidence.split('const parent={')[1]?.split('} as const satisfies')[0]||'';
const companies=new Map([...block.matchAll(/^\s+([a-z0-9]+):\{kind:'(company|open_source_project|software_library)'([^\n]*)/gm)]
 .map(([,key,kind,rest])=>[key,{kind,
   founded:rest.match(/founded:fact\('([12]\d{3})'/)?.[1]||null,
   projectSince:rest.match(/projectStarted:fact\('[^']*?((?:19|20)\d{2})/)?.[1]||null,
   foundedSource:rest.match(/founded:fact\('[^']+','([^']+)'/)?.[1]||null,
   headquarters:rest.includes('headquarters:fact('),funding:rest.includes('funding:fact('),listing:rest.includes('listing:fact(')}]));
const mapping=evidence.split('const map:Record<string,keyof typeof parent>={')[1]?.split('};')[0]||'';
const lookup=new Map([...mapping.matchAll(/(?:'([^']+)'|\b([a-z0-9-]+)):'([a-z0-9]+)'/g)].map(m=>[m[1]||m[2],m[3]]));
const ids=market.match(/const ALL=\[([^\]]+)\] as const;/)?.[1].match(/'[^']+'/g).map(s=>s.slice(1,-1))||[];
const rows=ids.map(id=>{const owner=lookup.get(id),data=companies.get(owner);if(!owner||!data)throw Error('MISSING_COMPANY_MAPPING: '+id);return {id,publisher:owner,...data};});
if(rows.length!==32||new Set(rows.map(x=>x.id)).size!==32)throw Error('EXPECTED_32_CURATED_PRODUCTS');
for(const x of rows)if(x.founded&&!x.foundedSource)throw Error('UNSOURCED_FOUNDING_DATE '+x.id);
const outstanding=[...new Set(rows.filter(x=>x.kind==='company'&&!x.founded).map(x=>x.publisher))];
const report={auditedProducts:rows.length,distinctPublishers:companies.size,companyFoundingYearMissing:outstanding,productsWithoutCorporateHeadquartersEvidence:rows.filter(x=>x.kind==='company'&&!x.headquarters).map(x=>x.id),productsWithoutCorporateFundingEvidence:rows.filter(x=>x.kind==='company'&&!x.funding).map(x=>x.id),productEvidence:rows};
process.stdout.write(JSON.stringify(report,null,2)+'\n');
