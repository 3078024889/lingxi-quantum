#!/usr/bin/env node
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {buildOfficialGapQueue,gapQueueMarkdown} from '../lib/market-official-gap-queue.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../data/company-intake/'+p,import.meta.url),'utf8'));
const packs=['001','002','003'].map(n=>read('batch-'+n+'-official-observations.json'));
const report=buildOfficialGapQueue(packs,new Date().toISOString().slice(0,10));
const args=process.argv.slice(2);
const get=key=>args.find(x=>x.startsWith('--'+key+'='))?.slice(key.length+3)||null;
for(const [name,value] of [[get('json'),JSON.stringify(report,null,2)+'\n'],
 [get('markdown'),gapQueueMarkdown(report)]])if(name){
 const dest=resolve(name);mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,value,'utf8');
}
console.log(JSON.stringify({schema:report.schema,candidates:report.candidates,
 gaps:report.missingFields,byField:report.perField,autoPublished:false},null,2));
if(report.candidates!==30||report.missingFields<0||report.items.some(x=>x.directPublicationAllowed))
 process.exitCode=1;
