// No network access, no silently fabricated metrics. Usage: node scripts/import-evidence.mjs path/to/new.json [--dry-run]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {mergeRecords} from '../lib/market-engine.mjs';
const base=path.dirname(fileURLToPath(import.meta.url));
const destination=path.resolve(base,'../data/evidence.json');
const input=process.argv[2];
if(!input || input.startsWith('--')) {console.error('Usage: node scripts/import-evidence.mjs INPUT.json [--dry-run]');process.exit(2)}
const incoming=JSON.parse(fs.readFileSync(path.resolve(input),'utf8'));
const existing=JSON.parse(fs.readFileSync(destination,'utf8'));
if(!Array.isArray(incoming)||!Array.isArray(existing))throw new Error('Expected arrays');
const result=mergeRecords(existing,incoming);
if(!process.argv.includes('--dry-run')) {
 const tmp=destination+'.tmp-'+process.pid;
 try {fs.writeFileSync(tmp,JSON.stringify(result.records,null,2)+'\n',{flag:'wx'});fs.renameSync(tmp,destination)} finally {if(fs.existsSync(tmp))fs.unlinkSync(tmp)}
}
console.log(JSON.stringify({status:'IMPORT_PASS',inserted:result.inserted,identical:result.identical,total:result.records.length,dryRun:process.argv.includes('--dry-run')}));
