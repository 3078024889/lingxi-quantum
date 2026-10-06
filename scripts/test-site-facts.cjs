const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);const source=fs.readFileSync(file,'utf8');const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','module','exports',code)(p=>{if(p==='server-only')return{};if(p.startsWith('@/')||p.startsWith('.')){const f=p.startsWith('@/')?path.resolve(p.slice(2)):path.resolve(path.dirname(file),p);return load(fs.existsSync(f)?f:f+'.ts')}return require(p)},m,m.exports);return m.exports}
const facts=load('lib/seo/site-facts.ts'),{GLOBAL_TOOL_CATALOG,SEO_LOCALES}=load('lib/seo/global-seo.ts'),{PUBLIC_PAID_TOOL_IDS}=load('lib/tools/paid-catalog.ts'),{allToolBillingPolicies}=load('lib/pricing/tool-policy.ts');
assert.deepEqual(facts.GEO_TOOL_SLUGS,GLOBAL_TOOL_CATALOG.map(t=>t.slug));
for(const locale of Object.keys(SEO_LOCALES)){
 for(const id of facts.GEO_PAGE_IDS){const f=facts.pageGeoFact(id,locale);assert(f.title&&f.description&&f.answer);assert(new URL(f.com));assert(new URL(f.cn));assert(f.answer.includes(f.com)&&f.answer.includes(f.cn))}
 for(const slug of facts.GEO_TOOL_SLUGS){const f=facts.toolGeoFact(slug,locale);assert(f.title&&f.description&&f.question&&f.answer);assert(f.com.includes('/tools/'+slug));if(PUBLIC_PAID_TOOL_IDS.includes(slug))assert(!f.kind.startsWith('free'),slug);if(allToolBillingPolicies().some(p=>p.toolId===slug&&p.billingClass==='DISABLED'))assert.equal(f.kind,'later',slug)}
 for(const slug of ['compress-image-to-100kb','heic-to-jpg','merge-pdf','remove-exif'])assert.equal(facts.toolGeoFact(slug,locale).kind,'free-local');
}
for(const slug of ['burn-after-read','temp-mail'])assert.equal(facts.toolGeoFact(slug,'en').kind,'paid-online');
assert.equal(facts.toolGeoFact('nonexistent-tool','en'),null);
const freeCount=facts.GEO_TOOL_SLUGS.filter(slug=>facts.toolGeoFact(slug,'zh').kind.startsWith('free')).length;
assert.equal(freeCount,97,'Update translated public counts when actual billing eligibility changes');
const {buildToolMetadata}=load('lib/tools/seo.ts');for(const slug of facts.GEO_TOOL_SLUGS){const meta=buildToolMetadata(slug);assert.equal(typeof meta.title,'string');assert.equal(typeof meta.description,'string');assert(meta.description.length>0)}
const response=load('app/llms.txt/route.ts').GET();response.text().then(s=>{assert(s.includes('CNY')&&s.includes('USD'));assert(s.includes('Paid processing'));assert(s.includes('Not open yet'));console.log('PASS: full tool catalog, six public pages, nine languages, paid/free/disabled distinctions, both hosts and actual llms.txt output.');}).catch(e=>{console.error(e);process.exitCode=1});
