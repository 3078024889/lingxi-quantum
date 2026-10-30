// Measure source-backed fact fields for ALL existing products (seed + catalog).
// Uses TypeScript syntax tree, not regexp guesses about fields. No network or production writes.
import ts from 'typescript';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFile(resolve(root,path),'utf8');
const catalog=JSON.parse(await read('data/catalog.json'));
const seed=await read('lib/data.ts'),factsSrc=await read('lib/reviewed-product-facts.ts');
const factKeys=['purpose','free','price','region','watermark','commercial','failure','refund','phone','card','models'];
const parse=(str,name)=>ts.createSourceFile(name,str,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const prop=(n,key)=>n?.properties?.find(x=>(x.name?.text||x.name?.getText())===key)?.initializer;
const string=n=>ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)?n.text:null;
const rows=new Map();
const add=(id,name,category,website)=>{if(id&&!rows.has(id))rows.set(id,{id,name,category,website})};
const catalogIDs=new Set(catalog.map(p=>p.id));
for(const x of catalog)add(x.id,x.name,x.category,x.website);
const seedAst=parse(seed,'data.ts');
const scanSeed=n=>{if(ts.isObjectLiteralExpression(n)){const id=string(prop(n,'id'));if(id&&prop(n,'website'))add(id,string(prop(n,'name')),string(prop(n,'category')),string(prop(n,'website')))}ts.forEachChild(n,scanSeed)};
scanSeed(seedAst);
const grouped=new Map(),factAst=parse(factsSrc,'reviewed-product-facts.ts');
function collect(n){
 if(ts.isObjectLiteralExpression(n)&&prop(n,'product')&&prop(n,'facts')){
  const id=string(prop(n,'product')),values=prop(n,'facts');
  if(id&&values&&ts.isObjectLiteralExpression(values)){
   const dateExpr=prop(n,'observedAt');
   const date=string(dateExpr)||'DATED_IN_SOURCE';
   const list=grouped.get(id)||[];
   const keys=values.properties.map(p=>p.name?.text||p.name?.getText()).filter(x=>factKeys.includes(x));
   list.push({date,fields:keys});
   grouped.set(id,list);
  }
 }
 ts.forEachChild(n,collect);
}
collect(factAst);
const records=[...rows.values()].map(x=>{
 const snapshots=grouped.get(x.id)||[];
 const verifiedFields=[...new Set(snapshots.flatMap(x=>x.fields))].sort();
 return {...x,fromCuratedCatalog:catalogIDs.has(x.id),snapshotCount:snapshots.length,
 sourceBackedFieldCount:verifiedFields.length,sourceBackedFields:verifiedFields,
 missingFields:factKeys.filter(x=>!verifiedFields.includes(x)),
 priceBacked:verifiedFields.includes('price'),freeBacked:verifiedFields.includes('free'),
 limitBacked:['region','commercial','failure','watermark'].some(x=>verifiedFields.includes(x)),
 note:'Source code presence is not real-time checking or confirmation that commercial terms remain unchanged.'};
}).sort((a,b)=>a.name?.localeCompare(b.name)||a.id.localeCompare(b.id));
const num=key=>records.filter(x=>x[key]).length;
const total=records.length, pct=n=>total?Math.round(n*10000/total)/100:0;
const summary={schema:'lingxifield_existing_fact_coverage_v2',generatedAt:new Date().toISOString(),
 allExistingProducts:total,curatedCatalogProducts:catalog.length,seedOnlyProducts:total-catalog.length,
 withSomeSourceBackedFields:num('snapshotCount'),priceWithSource:num('priceBacked'),
 freeWithSource:num('freeBacked'),someUsageLimitsWithSource:num('limitBacked'),
 coveragePercent:{someSourceBackedFields:pct(num('snapshotCount')),price:pct(num('priceBacked')),
 free:pct(num('freeBacked')),someUsageLimits:pct(num('limitBacked'))},
 missingSourceBackedFacts:records.reduce((s,x)=>s+x.missingFields.length,0),
 limitation:'Source-backed means a dated official citation exists in repo, NOT that current terms are independently rechecked, correct across regions, or connected to production.'};
const dir=resolve(root,'reports/existing-product-gate');await mkdir(dir,{recursive:true});
const file=resolve(dir,'reviewed-coverage-summary.json');
await writeFile(file,JSON.stringify({summary,records},null,2)+'\n');
console.log(JSON.stringify({...summary,file},null,2));
