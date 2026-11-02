#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {auditCuratedUseAcceptance,evaluatePublicationGates} from '../lib/market-launch-gates.mjs';
import {auditCandidateCohort} from '../lib/market-candidate-intake.mjs';
import {auditOfficialObservations} from '../lib/market-official-observations.mjs';
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
const next10=auditCandidateCohort(current,ids);
const sourceObserved=auditOfficialObservations(load('data/company-intake/batch-001-official-observations.json'),current);
if(sourceObserved.issues.length||!sourceObserved.readyForEditorialReview)throw Error('INVALID_OFFICIAL_OBSERVATIONS');
if(!next10.stagingSafe)throw Error('NEXT_BATCH_EVIDENCE_OR_PAUSE_BROKEN');
const result=evaluatePublicationGates({inventory:{curated:32},uses:QA,
 seo:{verifiedObservations:seo.length,verifiedOwnership:false},
 merchant:{verifiedSettlement:false,refundAndRevocation:false},
 mobile:{nineLocalesRealBrowser:false},realSite:{verifiedPublicProduction:false}});
process.stdout.write(JSON.stringify({checkedAt:new Date().toISOString(),useQA:{expected:QA.expected,verified:QA.verifiedRealUse,pending:QA.pendingIds},next10:{count:next10.count,publishEligible:next10.publishEligible,paused:current.intakePaused,openEvidenceIssues:next10.issues.length,sourceObserved:sourceObserved.observed,sourceConflict:sourceObserved.conflict,sourceMissing:sourceObserved.missing},...result},null,2)+'\n');
if(process.argv.includes('--strict')&&!result.canPublishNext10)process.exitCode=1;
