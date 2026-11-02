import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const appRoot=fileURLToPath(new URL('../',import.meta.url));
const repoRoot=resolve(appRoot,'..');
const workflowDir=resolve(repoRoot,'.github/workflows');
const allowed={
 'actions/checkout':new Set(['08c6903cd8c0fde910a37f88322edcfb5dd907a8']),
 'actions/setup-node':new Set(['a0853c24544627f65ddf259abe73b1d18a591444'])
};

test('standalone SIAI app has a path-scoped release gate and isolated PostgreSQL security gate',()=>{
 const files=readdirSync(workflowDir).filter(name=>name.startsWith('ai-market-')&&name.endsWith('.yml')).sort();
 assert.deepEqual(files,['ai-market-discover-companies.yml','ai-market-postgres-isolated.yml','ai-market-standalone-gate.yml']);
 const discovery=readFileSync(resolve(workflowDir,'ai-market-discover-companies.yml'),'utf8');
 assert.match(discovery,/github\.ref == 'refs\/heads\/main'/);
 assert.match(discovery,/refs\/heads\/bot\/siai-discovery/);
 assert.match(discovery,/discover-ai-publishers\.mjs/);
 assert.match(discovery,/discover-ai-publishers\.test\.mjs/);
 assert.match(discovery,/productionPublishAllowed/);
 assert.doesNotMatch(discovery,/refs\/heads\/main.*git push/);
 const discoveryActions=[...discovery.matchAll(/uses:\s*(actions\/(?:checkout|setup-node|upload-artifact))@([^\s#]+)/g)];
 assert.equal(discoveryActions.length,3);
 for(const [,action,sha] of discoveryActions){
  assert.match(sha,/^[a-f0-9]{40}$/,action+': discovery action must be pinned');
  if(action==='actions/upload-artifact')assert.equal(sha,'ea165f8d65b6e75b540449e92b4886f43607fa02');
  else assert.ok(allowed[action]?.has(sha),action+': discovery action must be pinned to audited release');
 }
 const release=readFileSync(resolve(workflowDir,'ai-market-standalone-gate.yml'),'utf8');
 const postgres=readFileSync(resolve(workflowDir,'ai-market-postgres-isolated.yml'),'utf8');
 assert.match(release,/working-directory:\s*lingxifield-ai-market/);
 assert.match(release,/lingxifield-ai-market\/\*\*/);
 assert.match(release,/npm run gate/);
 assert.match(postgres,/image:\s*postgres:17/);
 assert.match(postgres,/lingxifield-ai-market\/sql\//);
 assert.match(postgres,/Verify visitor feedback HMAC provisioning, submission and moderation in isolated PostgreSQL/);
 let checkout=0,setupNode=0;
 for(const [name,source] of [['release',release],['postgres',postgres]]){
  for(const match of source.matchAll(/uses:\s*(actions\/(?:checkout|setup-node))@([^\s#]+)/g)){
   const action=match[1],sha=match[2];
   assert.match(sha,/^[a-f0-9]{40}$/,name+': '+action+' must be pinned');
   assert.ok(allowed[action]?.has(sha),name+': '+action+' must use an audited immutable release');
   if(action==='actions/checkout')checkout++;
   if(action==='actions/setup-node'){
    setupNode++;
    assert.match(source,/package-manager-cache:\s*false/);
   }
  }
 }
 assert.equal(checkout,2);
 assert.equal(setupNode,1);
});
