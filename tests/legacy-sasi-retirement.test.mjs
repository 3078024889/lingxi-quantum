import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const report=JSON.parse(readFileSync('docs/operations/legacy-sasi-retirement-20261108.json','utf8'));
test('retired endpoints cannot create provider jobs or run the radar',async()=>{
 for(const file of report.retiredRoutes){
  const source=readFileSync(file,'utf8');
  assert(!/\bimport\b|\bfetch\s*\(/.test(source),file);
  const route=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
  for(const method of ['GET','POST']){
   const response=await route[method](new Request('https://lingxifield.com/retired',{method}));
   assert.equal(response.status,410);
   assert.equal(response.headers.get('cache-control'),'no-store');
   assert.deepEqual(await response.json(),{error:'SASI_CREATION_RETIRED',replacement:'/sasi'});
  }
 }
});
test('retired SASI pages are permanent redirects and never render creation modules',()=>{
 const pages=[
  'app/sasi/assemble/page.tsx','app/sasi/build/page.tsx','app/sasi/chat/page.tsx',
  'app/sasi/connections/page.tsx','app/sasi/director/page.tsx','app/sasi/drama/page.tsx',
  'app/sasi/image/page.tsx','app/sasi/marketplace/page.tsx','app/sasi/operator/page.tsx',
  'app/sasi/operator/v5/page.tsx','app/sasi/project-dna/page.tsx','app/sasi/series/page.tsx',
  'app/sasi/variants/page.tsx','app/ai-knowledge/page.tsx','app/ai-learning/page.tsx','app/ai-research/page.tsx'
 ];
 for(const file of pages){
  const source=readFileSync(file,'utf8');
  assert.match(source,/permanentRedirect\(/,file+' must use a server-side permanent redirect');
  assert.match(source,/robots:\s*\{index:false,follow:false\}/,file+' must not be indexed');
  assert.doesNotMatch(source,/Sasi(?:OneSurface|UnifiedLauncher|MultiEpisodeWorkspace|SeriesStudio|ChatCreationStudio|VideoAssembler)/,file+' must not import retired creation UI');
 }
 const pricing=readFileSync('app/sasi/pricing/page.tsx','utf8');
 assert.match(pricing,/permanentRedirect\("\/ai-wallet"\)/);
});
test('software marketplace and historical delivery remain available in source',()=>{
 for(const file of ['app/sasi/page.tsx','app/sasi/delivery/page.tsx','app/api/sasi/software/download/route.ts','app/api/sasi/marketplace/download/route.ts','app/api/internal/sasi/market/release-due/route.ts'])assert(existsSync(file),file);
 assert(readFileSync('app/sasi/page.tsx','utf8').includes('SasiOpenMarketplace'));
 const config=JSON.parse(readFileSync('vercel.json','utf8'));
 assert(!config.crons.some(x=>x.path==='/api/cron/sasi-v5-radar'));
 assert(config.crons.some(x=>x.path==='/api/cron/privacy-cleanup'));
 assert(config.crons.some(x=>x.path==='/api/cron/withdrawal-reconcile'));
});


test('retired legacy source files and media are absent from the repository and source manifests',()=>{
 for(const file of report.removed)assert.equal(existsSync(file),false,'retired source remains: '+file);
 for(const name of ['LINGXIFIELD_PROTECTED_MANIFEST.json','LINGXIFIELD_SOURCE_INVENTORY.json']){
  const manifest=JSON.parse(readFileSync(name,'utf8'));
  const stale=(manifest.files||[]).filter(row=>report.removed.includes(row.path));
  assert.equal(stale.length,0,name+' still lists retired files: '+stale.map(x=>x.path).join(','));
 }
});

test('legacy URL-to-video creation is permanently redirected and excluded from discovery',()=>{
 const page=readFileSync('app/tools/url-to-video/page.tsx','utf8');
 const config=readFileSync('next.config.js','utf8');
 const catalog=readFileSync('lib/seo/global-seo.ts','utf8');
 const hub=readFileSync('lib/tools/advanced-catalog.ts','utf8');
 assert.match(page,/permanentRedirect\("\/tools"\)/);
 assert.match(config,/source: "\/tools\/url-to-video", destination: "\/tools", permanent: true/);
 assert.match(config,/source: "\/:lang\(en\|ja\|ko\|fr\|de\|es\|pt\|ar\)\/tools\/url-to-video"/);
 assert.doesNotMatch(catalog,/slug:"url-to-video"/);
 assert.doesNotMatch(hub,/\/tools\/url-to-video/);
});


test('current product copy and global styles do not expose retired SASI creation modules',()=>{
 const home=readFileSync('components/HomeProblemHub.tsx','utf8');
 const legal=readFileSync('components/SasiLegalBody.tsx','utf8');
 const mini=readFileSync('miniapp/README.md','utf8');
 const css=readFileSync('app/globals.css','utf8');
 const llms=readFileSync('public/llms.txt','utf8')+'\n'+readFileSync('public/llms-full.txt','utf8');
 assert.doesNotMatch(home,/ai短剧|短剧生成/);
 assert.doesNotMatch(legal,/短剧|short drama|Kurzdrama|séries courtes|dramas y vídeos|dramas e vídeos|الدراما والفيديو الجديدة|동영상 신규 생성/i);
 assert.doesNotMatch(mini,/SASI 创作|短剧|书本|学习|科研|资料智库/);
 assert.doesNotMatch(css,/\.sasi-(?:hero-surface|home-tile|balance|connect|cangxuan|orchestration|works-|account-|start-path|utility-links|recharge-|send|header-topup|checkout-)|\.cangxuan-|\.lx-sasi-center|\.lx-sasi-hero|\.lx-sasi-prompt-panel|\.lx-sasi-entry-card|\.lx-knowledge-modebar|\.lx-knowledge-answer|\.lx-knowledge-recharge/);
 assert.doesNotMatch(llms,/short[- ]drama|book SASI|learning SASI|research SASI|短剧生成|书本智能体|学习智能体|科研智能体/i);
 const market=readFileSync('components/SasiOpenMarketplace.tsx','utf8');
 assert.match(market,/\/images\/sasi\/sasi-market-hero-lingxifield\.png/);
});


test('first-party Copernicus product is SI 11.6 and source-code only',()=>{
 const catalog=readFileSync('lib/sasi-software/catalog.ts','utf8');
 const market=readFileSync('components/SasiOpenMarketplace.tsx','utf8');
 assert.match(catalog,/哥白尼 SI 11\\.6/);
 assert.match(catalog,/Copernicus SI 11\\.6/);
 assert.match(catalog,/kind:"source"/);
 assert.doesNotMatch(catalog,/SI9\\.5|SI 9\\.5/);
 assert.match(market,/SI 11\\.6/);
});
