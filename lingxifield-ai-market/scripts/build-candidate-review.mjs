#!/usr/bin/env node
/** Export ready-to-review 30 real candidate rows without promoting them. */
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {materializeCandidateCatalog} from '../lib/market-candidate-review-build.mjs';
import {renderCandidateReviewHtml} from '../lib/market-candidate-review-html.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../data/company-intake/'+name,import.meta.url),'utf8'));
const ids=['001','002','003'];
const cohorts=ids.map(x=>read('batch-'+x+'.json'));
const observations=ids.map(x=>read('batch-'+x+'-official-observations.json'));
const candidateReview=materializeCandidateCatalog(cohorts,observations);
const html=renderCandidateReviewHtml(candidateReview);
const args=process.argv.slice(2);
const option=k=>args.find(a=>a.startsWith('--'+k+'='))?.slice(k.length+3);
for(const [filename,body] of [[option('json'),JSON.stringify(candidateReview,null,2)+'\n'],
 [option('html'),html]]){
 if(!filename)continue;
 const path=resolve(filename);
 mkdirSync(dirname(path),{recursive:true});
 writeFileSync(path,body,'utf8');
}
console.log(JSON.stringify({
 schema:candidateReview.schema,candidateProducts:candidateReview.candidateProducts,
 publisherGroups:candidateReview.publisherGroups,observed:candidateReview.totals.observed,
 missing:candidateReview.totals.missing,conflicts:candidateReview.totals.conflict,
 published:0,preview:'offline_artifact_only'
},null,2));
