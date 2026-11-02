import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildOfficialGapQueue,gapQueueMarkdown} from '../lib/market-official-gap-queue.mjs';
const get=n=>JSON.parse(readFileSync(new URL('../data/company-intake/batch-'+n+'-official-observations.json',import.meta.url),'utf8'));
const batch=['001','002','003'].map(get);
test('27 outstanding first-party facts are enumerated and cannot be auto published',()=>{
 const report=buildOfficialGapQueue(batch,'2026-11-02');
 assert.equal(report.candidates,30);
 assert.equal(report.missingFields,27);
 assert.equal(report.perField.regions,22);
 assert.equal(report.missingFields-report.perField.regions,5);
 assert.equal(report.items.length,27);
 assert.ok(report.items.every(x=>x.query.startsWith('site:'+x.host+' ')));
 assert.ok(report.items.every(x=>x.sourceRequired&&x.independentAccountTestRequired&&!x.directPublicationAllowed));
 assert.equal(report.noAutomatedWebScraping,true);
 assert.equal(report.notPublished,true);
 assert.match(gapQueueMarkdown(report),/blocked-country list/);
});
test('source query builder rejects duplicate candidate and corrupted/forged host',()=>{
 const duplicated=structuredClone(batch);
 duplicated[0].products[1].id=duplicated[0].products[0].id;
 assert.throws(()=>buildOfficialGapQueue(duplicated,'2026-11-02'),/DUPLICATE_CANDIDATE/);
 const bad=structuredClone(batch);
 bad[0].products[0].officialHosts=['cursor.com;evil.site'];
 assert.throws(()=>buildOfficialGapQueue(bad,'2026-11-02'),/INVALID_OFFICIAL_HOST/);
 const published=structuredClone(batch);
 published[0].products[0].reviewStatus='approved';
 assert.throws(()=>buildOfficialGapQueue(published,'2026-11-02'),/CANDIDATE_SOURCE_IS_NOT_HELD/);
});
test('CLI writes actionable official-only gap queue files without network or mutation',()=>{
 const dir=mkdtempSync(join(tmpdir(),'siai-queries-'));
 try{
  const json=join(dir,'gaps.json'),markdown=join(dir,'gaps.md');
  const p=spawnSync(process.execPath,[new URL('../scripts/report-official-gap-queue.mjs',import.meta.url).pathname,
   '--json='+json,'--markdown='+markdown],{encoding:'utf8',timeout:15000});
  assert.equal(p.status,0,p.stdout+'\n'+p.stderr);
  const report=JSON.parse(readFileSync(json,'utf8'));
  assert.equal(report.missingFields,27);
  assert.ok(report.items.every(x=>x.sourceRequired));
  assert.match(readFileSync(markdown,'utf8'),/Official/);
 }finally{rmSync(dir,{recursive:true,force:true})}
});
