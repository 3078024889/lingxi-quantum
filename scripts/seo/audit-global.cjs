const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'../..'),cache=new Map();
function load(name){
 let file=path.resolve(root,name);if(!path.extname(file))file+='.ts';
 if(cache.has(file))return cache.get(file).exports;
 const mod={exports:{}};cache.set(file,mod);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 new Function('require','module','exports',code)(p=>p.startsWith('@/')?load(p.slice(2)):p.startsWith('.')?load(path.resolve(path.dirname(file),p)):require(p),mod,mod.exports);
 return mod.exports;
}
const seo=load('lib/seo/global-seo.ts'),registry=load('lib/tools/registry.ts');
const sitemap=load('app/sitemap.ts').default(),indexing=load('lib/seo/indexing.ts');
const urls=new Set(sitemap.map(x=>x.url));assert.equal(urls.size,sitemap.length,'duplicate canonical URLs');
for(const row of sitemap){
 assert(!row.lastModified,'do not pretend every page changed at build time');
 assert(!indexing.privateSearchPath(new URL(row.url).pathname));
 for(const url of Object.values(row.alternates?.languages||{}))assert(urls.has(url),`alternate absent from sitemap: ${url}`);
}
for(const t of seo.GLOBAL_TOOL_CATALOG){
 assert(fs.existsSync(path.join(root,`app/tools/${t.slug}/page.tsx`))||registry.getTool(t.slug)&&!registry.getTool(t.slug).dedicatedRoute,`missing route: ${t.slug}`);
 for(const locale of Object.keys(seo.SEO_LOCALES)){
  assert(seo.toolTitle(locale,t));assert(seo.toolDescription(locale,t));
  assert(urls.has(seo.SITE+seo.localePath(locale,`/tools/${t.slug}`)));
 }
}
for(const t of registry.TOOLS.filter(x=>x.status==='live'&&x.slug!=='number-energy'))assert(seo.getGlobalTool(t.slug),`live tool not indexed: ${t.slug}`);
for(const p of ['/en/sasi','/ja/ai-knowledge','/account','/checkout','/tools/burn-after-read/private'])assert(!urls.has(seo.SITE+p));
for(const p of ['/account','/account/withdrawals','/auth/login','/tools/admin','/tools/pay','/tools/burn-after-read/private','/share/private'])assert(indexing.privateSearchPath(p));
for(const p of ['/products','/tools/burn-after-read','/sasi/build'])assert(!indexing.privateSearchPath(p));
const facts=load('lib/seo/service-facts.ts');
for(const [topic,value] of Object.entries(facts.SERVICE_FACTS)){
 assert(fs.existsSync(path.join(root,'app',value.target,'page.tsx')),`missing service: ${topic}`);
 for(const locale of Object.keys(seo.SEO_LOCALES))assert(value.description[locale]?.length>30,`${topic}:${locale}`);
}
assert.equal(facts.SERVICE_FACTS['ai-website-builder'].target,'/sasi/build');
console.log(`PASS: ${seo.GLOBAL_TOOL_CATALOG.length} tools, ${Object.keys(facts.SERVICE_FACTS).length} SASI product guides, 9 languages, ${urls.size} canonical URLs, reciprocal sitemap alternates, real entry routes and private-page exclusions.`);
