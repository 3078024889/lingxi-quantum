import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=async path=>JSON.parse(await readFile(new URL('../'+path,import.meta.url),'utf8'));

test('lockfile pins PostCSS patched version at every install location',async()=>{
 const pkg=await read('package.json'),lock=await read('package-lock.json');
 assert.equal(pkg.devDependencies.postcss,'8.5.32');
 assert.equal(pkg.overrides?.postcss,'8.5.32');
 assert.equal(lock.packages['node_modules/postcss']?.version,'8.5.32');
 const nested=Object.entries(lock.packages).filter(([name])=>name.includes('postcss')&&name.endsWith('/postcss'));
 assert.ok(nested.length>=1,'expect PostCSS in dependency graph');
 for(const [name,installed] of nested)assert.equal(installed.version,'8.5.32',name+' should not resolve to vulnerable PostCSS');
});

test('Next.js and PostCSS version claims must agree with lockfile',async()=>{
 const pkg=await read('package.json'),lock=await read('package-lock.json');
 assert.ok(/^15\.5\./.test(lock.packages['node_modules/next']?.version||''),'unexpected Next version, review security policy');
 assert.equal(lock.packages[''].devDependencies.postcss,pkg.devDependencies.postcss);
});
