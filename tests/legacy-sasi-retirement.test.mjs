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
