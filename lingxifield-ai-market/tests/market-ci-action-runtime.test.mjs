import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const appRoot=fileURLToPath(new URL('../',import.meta.url));
const repoRoot=resolve(appRoot,'..');
const workflowDir=resolve(repoRoot,'.github/workflows');
const allowed={
 'actions/checkout':new Set([
  '08c6903cd8c0fde910a37f88322edcfb5dd907a8',
  'd23441a48e516b6c34aea4fa41551a30e30af803'
 ]),
 'actions/setup-node':new Set([
  'a0853c24544627f65ddf259abe73b1d18a591444',
  '249970729cb0ef3589644e2896645e5dc5ba9c38'
 ]),
 'actions/upload-artifact':new Set([
  'b7c566a772e6b6bfb58ed0dc250532a479d7789f'
 ])
};

test('AI Market workflows pin all core GitHub actions to reviewed Node 24 releases',()=>{
 const files=readdirSync(workflowDir).filter(name=>name.startsWith('ai-market-')&&name.endsWith('.yml'));
 assert.ok(files.length>=8,'AI Market workflow set was found');
 let checked=0;
 for(const name of files){
  const source=readFileSync(resolve(workflowDir,name),'utf8');
  for(const match of source.matchAll(/uses:\s*(actions\/(?:checkout|setup-node|upload-artifact))@([^\s#]+)/g)){
   const action=match[1],sha=match[2];
   assert.match(sha,/^[a-f0-9]{40}$/,name+': '+action+' must be pinned to an immutable commit');
   assert.ok(allowed[action]?.has(sha),name+': '+action+' SHA must be an audited Node 24 release');
   if(action==='actions/setup-node')assert.match(source,/package-manager-cache:\s*false/,name+': automatic package-manager detection must not assume pnpm is installed');
   checked++;
  }
 }
 assert.ok(checked>=20,'core actions across the AI Market workflows were checked');
});
