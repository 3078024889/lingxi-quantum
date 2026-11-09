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
test('software marketplace and historical delivery remain available in source',()=>{
 for(const file of ['app/sasi/page.tsx','app/sasi/delivery/page.tsx','app/api/sasi/software/download/route.ts','app/api/sasi/marketplace/download/route.ts','app/api/internal/sasi/market/release-due/route.ts'])assert(existsSync(file),file);
 assert(readFileSync('app/sasi/page.tsx','utf8').includes('SasiOpenMarketplace'));
 const config=JSON.parse(readFileSync('vercel.json','utf8'));
 assert(!config.crons.some(x=>x.path==='/api/cron/sasi-v5-radar'));
 assert(config.crons.some(x=>x.path==='/api/cron/privacy-cleanup'));
 assert(config.crons.some(x=>x.path==='/api/cron/withdrawal-reconcile'));
});
