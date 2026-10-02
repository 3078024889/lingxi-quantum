import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';

const root=process.cwd();
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'lingxi-git-hygiene-'));
const git=(...args)=>execFileSync('git',args,{cwd:fixture,encoding:'utf8'});
for(const file of ['package.json','pnpm-lock.yaml','package-lock.json','.gitignore','.github/workflows/production-gate.yml','scripts/ci/production-gate.mjs']){
 fs.mkdirSync(path.dirname(path.join(fixture,file)),{recursive:true});
 fs.copyFileSync(path.join(root,file),path.join(fixture,file));
}
fs.writeFileSync(path.join(fixture,'LINGXIFIELD_PROTECTED_MANIFEST.json'),'{"files":[]}');
git('init','--quiet');
const cache=path.join(fixture,'.pnpm-store/v11/index.db');
fs.mkdirSync(path.dirname(cache),{recursive:true});
fs.writeFileSync(cache,'test cache');
const audit=()=>spawnSync(process.execPath,[path.join(root,'scripts/audit/v38r2-repository-hardening.mjs')],{cwd:fixture,encoding:'utf8'});
assert.equal(audit().status,0,'ignored local cache must be allowed');
git('add','-f','--','.pnpm-store/v11/index.db');
git('update-index','--skip-worktree','--','.pnpm-store/v11/index.db');
fs.unlinkSync(cache);
const hidden=audit();
assert.notEqual(hidden.status,0,'tracked cache must fail even when absent locally');
assert.match(hidden.stderr,/GENERATED_TRACKED_RESIDUAL/);
git('rm','--cached','--sparse','--','.pnpm-store/v11/index.db');
assert.equal(audit().status,0,'removing cache from Git repairs the gate');
fs.writeFileSync(path.join(fixture,'.gitignore'),'');
assert.notEqual(audit().status,0,'missing ignore rules must fail');
console.log('PASS: ignored cache allowed; tracked skip-worktree cache rejected; Git removal repairs gate; missing ignore rules rejected.');
console.log(`FIXTURE=${fixture}`);
