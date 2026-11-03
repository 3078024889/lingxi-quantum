#!/usr/bin/env node
import {readFileSync,readdirSync} from 'node:fs';
import {auditGlobalIntake} from '../lib/market-global-intake.mjs';
const root=new URL('../',import.meta.url);
const load=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const folder='data/company-intake/';
const files=readdirSync(new URL(folder,root)).filter(f=>/^batch-\d{3}\.json$/.test(f)).sort();
const cohorts=files.map(f=>load(folder+f));
const facts=files.map(f=>load(folder+f.replace(/\.json$/,'-official-observations.json')));
const source=readFileSync(new URL('lib/market-api-service-catalog.ts',root),'utf8');
const match=source.match(/const ALL=\[([^\]]+)\] as const;/);
if(!match)throw Error('CURATED_SOURCE_CHANGED');
const ids=[...match[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
const result=auditGlobalIntake(cohorts,facts,ids,{today:new Date().toISOString().slice(0,10)});
console.log(JSON.stringify(result,null,2));
if(!result.allBatchesSafe||cohorts.length<3||result.stagedBatches!==cohorts.length||result.stagedProducts!==cohorts.length*10||result.publishedProducts!==32)
 process.exitCode=1;
if(process.argv.includes('--publication'))process.exitCode=1;
