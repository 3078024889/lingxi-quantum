import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditOfficialObservations} from '../lib/market-official-observations.mjs';
const intake=JSON.parse(readFileSync(new URL('../data/company-intake/batch-006.json',import.meta.url),'utf8'));
const observations=JSON.parse(readFileSync(new URL('../data/company-intake/batch-006-official-observations.json',import.meta.url),'utf8'));
const previous=[1,2,3,4,5].flatMap(n=>JSON.parse(readFileSync(new URL('../data/company-intake/batch-'+String(n).padStart(3,'0')+'.json',import.meta.url),'utf8')).products.map(p=>p.id));
test('B006 adds ten unique unpublished official company API candidates',()=>{
 assert.equal(intake.products.length,10);
 assert.equal(new Set(intake.products.map(p=>p.id)).size,10);
 assert(intake.products.every(p=>p.reviewed===false&&p.publishApproved===false&&Object.keys(p.verifiedFacts).length===0));
 assert.equal(intake.visibleToPublic,false);assert.equal(intake.intakePaused,true);
 for(const p of intake.products)assert(!previous.includes(p.id),p.id+' is a previous batch duplicate');
});
test('B006 has seven explicitly sourced or missing observations per product',()=>{
 const check=auditOfficialObservations(observations,intake,{today:'2026-11-04'});
 assert.deepEqual(check.issues,[]);
 assert.equal(check.products,10);
 assert.equal(check.observed+check.missing+check.conflict,70);
 assert.equal(check.readyForEditorialReview,true);
 assert.equal(check.readyForPublication,false);
});
test('B006 does not enter the curated public catalog',()=>{
 const file=readFileSync(new URL('../lib/platform-repository.ts',import.meta.url),'utf8');
 assert(!file.includes('batch-006')&&!file.includes('company-intake'));
});
