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
// Catch syntax mistakes in the GEO/metadata routes before an expensive Next.js build.
for(const candidate of ['app/llms.txt/route.ts','app/sitemap.ts','app/robots.ts','lib/seo/sitemap-build.ts','lib/seo/siai-domain-policy.ts']){
 const source=fs.readFileSync(path.join(root,candidate),'utf8');
 const parsed=ts.createSourceFile(candidate,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
 assert.equal(parsed.parseDiagnostics.length,0,`syntax in ${candidate}: ${parsed.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join('; ')}`);
}
const seo=load('lib/seo/global-seo.ts'),registry=load('lib/tools/registry.ts');
const indexing=load('lib/seo/indexing.ts');
const {buildSiteSitemap}=load('lib/seo/sitemap-build.ts');
const {seoSiteForRequest,siaiLanguageAlternates}=load('lib/seo/siai-domain-policy.ts');
const siaiPolicy=load('lib/siai-seo-policy.ts');
const sitemap=buildSiteSitemap(seo.SITE,true);
const cnSitemap=buildSiteSitemap('https://lingxifield.cn',true);
assert.equal(siaiPolicy.siaiLandingShouldIndex({NODE_ENV:'production'}),true,'Cloudflare/ECS production must publish the regional SIAI sitemap');
assert.equal(siaiPolicy.siaiLandingShouldIndex({NODE_ENV:'production',VERCEL_ENV:'preview'}),false,'Vercel previews remain noindex');
assert.equal(siaiPolicy.siaiLandingShouldIndex({NODE_ENV:'development'}),false,'local development remains noindex');
assert.equal(siaiPolicy.siaiLandingShouldIndex({NODE_ENV:'development',VERCEL_ENV:'production'}),true,'explicit Vercel production remains indexable');
assert.equal(siaiPolicy.siaiSeoEnabled({NODE_ENV:'production',SIAI_MAIN_INDEX_READY:'1'}),true,'Cloudflare/ECS production may index only when the evidence gate is enabled');
assert.equal(siaiPolicy.siaiSeoEnabled({NODE_ENV:'production',VERCEL_ENV:'preview',SIAI_MAIN_INDEX_READY:'1'}),false,'preview deployments never index SIAI details');
assert.deepEqual(cnSitemap.map(x=>x.url),['https://lingxifield.cn/siai']);
assert.equal(seoSiteForRequest('lingxifield.cn'),'https://lingxifield.cn');
assert.equal(seoSiteForRequest('www.lingxifield.cn'),'https://lingxifield.cn');
assert.equal(seoSiteForRequest('lingxifield.com','lingxifield.cn'),'https://lingxifield.cn');
assert.equal(seoSiteForRequest('lingxifield.cn','lingxifield.com'),'https://lingxifield.com');
assert.equal(seoSiteForRequest('evil.invalid','lingxifield.cn'),'https://lingxifield.cn');
assert.equal(seoSiteForRequest('evil.invalid','evil.invalid'),'https://lingxifield.com');
assert.equal(siaiLanguageAlternates()['zh-CN'],'https://lingxifield.cn/siai');
assert.equal(siaiLanguageAlternates()['zh'],'https://lingxifield.com/siai');
assert.equal(siaiLanguageAlternates()['x-default'],'https://lingxifield.com/siai');
const urls=new Set(sitemap.map(x=>x.url));assert.equal(urls.size,sitemap.length,'duplicate canonical URLs');
const redirectedLegacy=['/tools/image-to-pdf-pro','/sasi/drama','/sasi/build','/sasi/assemble','/sasi/chat','/sasi/connections','/sasi/director','/sasi/image','/sasi/marketplace','/sasi/operator','/sasi/operator/v5','/sasi/project-dna','/sasi/series','/sasi/variants','/sasi/pricing','/ai-knowledge','/ai-learning','/ai-research'];
for(const p of redirectedLegacy)assert(!urls.has(seo.SITE+p),`redirected URL in sitemap: ${p}`);
for(const p of ['/sasi','/sasi/delivery','/about','/privacy','/terms','/refunds','/legal/sasi','/release'])
  assert(urls.has(seo.SITE+p),`indexable public route absent: ${p}`);
for(const slug of ['pdf-editor','batch-image','video-transcription','temp-mail','e-sign-pdf','food-calorie'])
  assert(urls.has(seo.SITE+'/tools/'+slug),`core public tool missing from sitemap: ${slug}`);
for(const row of sitemap){
 assert(!row.lastModified,'do not pretend every page changed at build time');
 assert(!indexing.privateSearchPath(new URL(row.url).pathname));
 for(const url of Object.values(row.alternates?.languages||{}))
  assert(urls.has(url)||cnSitemap.some(x=>x.url===url),`alternate absent from cross-domain sitemaps: ${url}`);
}
for(const t of seo.GLOBAL_TOOL_CATALOG){
 if(t.slug==='image-to-pdf-pro'){
  for(const locale of Object.keys(seo.SEO_LOCALES))assert(!urls.has(seo.SITE+seo.localePath(locale,'/tools/'+t.slug)),'redirected legacy tool in sitemap');
  continue;
 }
 const direct=path.join(root,'app','tools',t.slug,'page.tsx');
 if(fs.existsSync(direct)){
  const code=fs.readFileSync(direct,'utf8');
  assert(!/\bredirect\s*\(/.test(code),`redirecting tool included in sitemap: ${t.slug}`);
  assert(/export\s+const\s+metadata\b|generateMetadata\s*\(/.test(code),`dedicated tool metadata missing: ${t.slug}`);
  assert(/canonical|buildToolMetadata|buildSearchOptimizedToolMetadata|publicPageMetadata/.test(code),`dedicated tool canonical missing: ${t.slug}`);
 }
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
assert.equal(facts.SERVICE_FACTS['sasi-software-marketplace'].target,'/sasi');
assert.equal(facts.SERVICE_FACTS['mt5-ea-source-code'].target,'/sasi');
assert.equal(facts.SERVICE_FACTS['software-licensing-delivery'].target,'/sasi/delivery');
assert.equal(facts.SERVICE_FACTS['developer-software-publishing'].target,'/sasi/seller');
for(const retired of ['ai-short-drama-generator','book-to-ai-agent','document-ai-agent','learning-ai-agent','research-ai-agent','ai-website-builder'])assert(!(retired in seo.SEO_TOPICS),`retired SASI topic still indexed: ${retired}`);
console.log(`PASS: canonical-only sitemap and GEO guide with 2 domains (.com global + .cn SIAI), ${seo.GLOBAL_TOOL_CATALOG.length} tools, ${Object.keys(facts.SERVICE_FACTS).length} SASI product guides, 9 languages, ${urls.size} canonical URLs, reciprocal sitemap alternates, real entry routes and private-page exclusions.`);
