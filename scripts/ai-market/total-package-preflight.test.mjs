import test from'node:test';import assert from'node:assert/strict';import{checkPackage}from'./total-package-preflight.mjs';
test('package source preflight checks 5 dependent migrations and 9 languages',async()=>{
 const r=await checkPackage();assert.equal(r.status,'source_preflight_pass',r.issues.join('; '));assert.equal(r.checked.length,5);assert.equal(r.locales.length,9);
 assert.match(r.warning,/not a database migration/);
});
