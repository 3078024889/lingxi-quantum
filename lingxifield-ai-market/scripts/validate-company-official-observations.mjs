#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {auditOfficialObservations} from '../lib/market-official-observations.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const result=auditOfficialObservations(
 read('data/company-intake/batch-001-official-observations.json'),
 read('data/company-intake/batch-001.json'),{today:'2026-11-02'});
console.log(JSON.stringify(result,null,2));
if(result.issues.length||!result.readyForEditorialReview)process.exitCode=1;
if(process.argv.includes('--publication')&&!result.readyForPublication)process.exitCode=1;
