#!/usr/bin/env node
import {readFileSync,readdirSync} from 'node:fs';
import {auditCuratedUseAcceptance,evaluatePublicationGates} from '../lib/market-launch-gates.mjs';
import {auditCandidateCohort} from '../lib/market-candidate-intake.mjs';
import {auditGlobalIntake} from '../lib/market-global-intake.mjs';
const cwd=new URL('../',import.meta.url),load=p=>JSON.parse(readFileSync(new URL(p,cwd),'utf8'));
const evidence=load('data/acceptance/curated-32-use.json'),current=load('data/company-intake/batch-001.json'),seo=load('data/seo-geo-observations.json');
const source=readFileSync(new URL('lib/market-api-service-catalog.ts',cwd),'utf8');
const m=source.match(/const ALL=\[([^\]]+)\] as const;/);
if(!m)throw Error('CURATED_SOURCE_CHANGED');
const ids=[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);
if(ids.length!==32||new Set(ids).size!==32)throw Error('INVALID_32_CURATED');
const QA=auditCuratedUseAcceptance(evidence.items,ids);
if(QA.issues.length||QA.invalidIds.length||evidence.curatedCount!==32)throw Error('ACCEPTANCE_LEDGER_INVALID:'+JSON.stringify(QA));
if(current.products.length!==10||!current.intakePaused||current.visibleToPublic||current.products.some(x=>x.publishApproved))
 throw Error('UNAPPROVED_NEXT_BATCH_LEAK');
const folder='data/company-intake/';
const cohortFiles=readdirSync(new URL(folder,cwd)).filter(f=>/^batch-\d{3}\.json$/.test(f)).sort();
const cohorts=cohortFiles.map(p=>load(folder+p));
const proofs=cohortFiles.map(p=>load(folder+p.replace('.json','-official-observations.json')));
const staged=auditGlobalIntake(cohorts,proofs,ids);
if(!staged.allBatchesSafe||staged.stagedProducts!==30||staged.stagedBatches!==3)
 throw Error('GLOBAL_STAGING_EVIDENCE_OR_PAUSE_BROKEN:'+JSON.stringify(staged.issues));
const result=evaluatePublicationGates({inventory:{curated:32},uses:QA,
 seo:{verifiedObservations:seo.length,verifiedOwnership:false},
 merchant:{verifiedSettlement:false,refundAndRevocation:false},
 mobile:{nineLocalesRealBrowser:false},realSite:{verifiedPublicProduction:false}});
process.stdout.write(JSON.stringify({checkedAt:new Date().toISOString(),useQA:{expected:QA.expected,verified:QA.verifiedRealUse,pending:QA.pendingIds},next10:{count:cohorts[0].products.length,publishEligible:0,paused:current.intakePaused},globalStaging:staged,...result},null,2)+'\n');
if(process.argv.includes('--strict')&&!result.canPublishNext10)process.exitCode=1;
