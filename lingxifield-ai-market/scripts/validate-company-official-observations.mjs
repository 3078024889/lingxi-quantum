#!/usr/bin/env node
import {readFileSync,readdirSync} from 'node:fs';
import {auditOfficialObservations} from '../lib/market-official-observations.mjs';
const root=new URL('../',import.meta.url),folder='data/company-intake/';
const load=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const files=readdirSync(new URL(folder,root)).filter(x=>/^batch-\d{3}\.json$/.test(x)).sort();
const results=files.map(path=>{
 const batch=load(folder+path),observations=load(folder+path.replace('.json','-official-observations.json'));
 return auditOfficialObservations(observations,batch,{today:'2026-11-02'});
});
console.log(JSON.stringify(results.map(r=>({
 batch:r.batch,products:r.products,observed:r.observed,missing:r.missing,conflict:r.conflict,
 ownershipRelations:r.ownershipRelations,issues:r.issues
})),null,2));
if(results.some(r=>!r.readyForEditorialReview||r.issues.length))process.exitCode=1;
if(process.argv.includes('--publication'))process.exitCode=1;
