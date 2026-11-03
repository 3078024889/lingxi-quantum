#!/usr/bin/env node
import {readFileSync,readdirSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildEvidenceReadiness,evidenceReportMarkdown} from '../lib/market-evidence-readiness.mjs';
const base=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,base),'utf8');
const parse=p=>JSON.parse(read(p));
const source=read('lib/market-api-service-catalog.ts');
const idsMatch=source.match(/const ALL=\[([^\]]+)\] as const;/);
if(!idsMatch)throw Error('CURATED_CATALOG_SOURCE_LAYOUT_CHANGED');
const curatedIds=[...idsMatch[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
const factsSource=read('lib/market-researched-facts.ts');
const start=factsSource.indexOf('export const RESEARCHED_FACTS:');
const objStart=factsSource.indexOf('={',start)+1;
const objEnd=factsSource.indexOf('};\nexport const MARKET_RESEARCH_CHECKED_AT',objStart)+1;
if(start<0||objStart<1||objEnd<1)throw Error('CURATED_FACTS_SOURCE_LAYOUT_CHANGED');
const curatedFacts=JSON.parse(factsSource.slice(objStart,objEnd));
const dir=new URL('data/company-intake/',base);
const filenames=readdirSync(dir).filter(f=>/^batch-\d{3}\.json$/.test(f)).sort();
const cohorts=filenames.map(name=>parse('data/company-intake/'+name));
const observations=filenames.map(name=>parse('data/company-intake/'+name.replace(/\.json$/,'-official-observations.json')));
const report=buildEvidenceReadiness({curatedIds,curatedFacts,cohorts,observations,
 asOf:new Date().toISOString().slice(0,10)});
const args=process.argv.slice(2);
function option(key){
 const entry=args.find(a=>a.startsWith('--'+key+'='));
 return entry?entry.slice(key.length+3):null;
}
for(const [file,content] of [
 [option('json'),JSON.stringify(report,null,2)+'\n'],
 [option('markdown'),evidenceReportMarkdown(report)]
]){
 if(!file)continue;
 const target=resolve(file);
 mkdirSync(dirname(target),{recursive:true});
 writeFileSync(target,content,'utf8');
}
console.log(JSON.stringify({schema:report.schema,curated:report.curated.count,
 curatedSourcePairs:report.curated.recordedWithSources,candidates:report.candidateIntake.products,
 observations:report.candidateIntake.observed,missing:report.candidateIntake.missing,
 conflicts:report.candidateIntake.conflict,publishReady:report.candidateIntake.publishReady,
 structuralIssues:report.safety.structuralIssues},null,2));
if(!report.safety.structurallyValid||report.curated.count!==32||
 report.candidateIntake.products!==30||report.candidateIntake.publishReady!==0){
 console.error('SIAI_EVIDENCE_READINESS_GATE_FAILED');
 process.exitCode=1;
}
