#!/usr/bin/env node
/**
 * Review and publish independently captured Google/Bing SERP or AI-answer citation
 * comparisons. The raw, compact capture is archived and SHA-256 linked to every row.
 * No network requests are made and no rankings are inferred from catalog order.
 *
 * Usage:
 *   node scripts/review-independent-seo-geo.mjs --hash ./capture.json
 *   node scripts/review-independent-seo-geo.mjs ./capture.json ./review.json
 *   node scripts/review-independent-seo-geo.mjs ./capture.json ./review.json --confirm-publish
 *   node scripts/review-independent-seo-geo.mjs --validate-ledger
 */
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ledgerFile=path.join(root,'data/seo-geo-observations.json');
const captureDir=path.join(root,'reports/seo-geo-captures');
const languages=new Set(['zh','en','ja','ko','fr','de','es','pt','ar']);
const prefixFor=source=>source==='independent_serp'?'serp-':source==='ai_answer_citation'?'geo-':null;
const digest=value=>createHash('sha256').update(value).digest('hex');
const validDate=value=>typeof value==='string'&&Number.isFinite(Date.parse(value))&&/^\d{4}-\d{2}-\d{2}T/.test(value);
const safeUrl=value=>{
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!u.search&&!u.hash;}
 catch{return false;}
};
const captureFileName=(groupId,hash)=>groupId+'-'+hash.slice(0,16)+'.json';
const captureFilePath=(dir,groupId,hash)=>path.join(dir,captureFileName(groupId,hash));

function validateCapture(capture,knownIds){
 if(!capture||typeof capture!=='object'||Array.isArray(capture))throw new Error('CAPTURE_INVALID');
 const allowedCaptureKeys=new Set(['source','captureGroupId','observedAt','country','language','query','engine','methodVersion','model','modelVersion','results']);
 if(Object.keys(capture).some(key=>!allowedCaptureKeys.has(key)))throw new Error('CAPTURE_UNEXPECTED_FIELD');
 if(!['independent_serp','ai_answer_citation'].includes(capture.source))throw new Error('CAPTURE_SOURCE_INVALID');
 if(typeof capture.captureGroupId!=='string'||!/^[-a-zA-Z0-9_.]{8,80}$/.test(capture.captureGroupId))throw new Error('CAPTURE_GROUP_ID_INVALID');
 if(!validDate(capture.observedAt))throw new Error('CAPTURE_TIMESTAMP_INVALID');
 if(typeof capture.country!=='string'||!(/^([A-Z]{2}|GLOBAL)$/.test(capture.country)))throw new Error('CAPTURE_COUNTRY_INVALID');
 if(!languages.has(capture.language))throw new Error('CAPTURE_LANGUAGE_INVALID');
 if(typeof capture.query!=='string'||!capture.query.trim()||capture.query.length>512)throw new Error('CAPTURE_QUERY_INVALID');
 if(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|(?:\+?\d[\d .()-]{7,}\d)/i.test(capture.query))throw new Error('CAPTURE_QUERY_PRIVACY_RISK');
 if(typeof capture.engine!=='string'||!capture.engine.trim()||capture.engine.length>100)throw new Error('CAPTURE_ENGINE_INVALID');
 if(typeof capture.methodVersion!=='string'||!capture.methodVersion.trim()||capture.methodVersion.length>80)throw new Error('CAPTURE_METHOD_INVALID');
 if(capture.source==='independent_serp'&&(!['Google','Bing'].includes(capture.engine)||capture.model!==undefined||capture.modelVersion!==undefined))throw new Error('SERP_ENGINE_OR_MODEL_INVALID');
 if(capture.source==='ai_answer_citation'&&(typeof capture.model!=='string'||!capture.model.trim()||typeof capture.modelVersion!=='string'||!capture.modelVersion.trim()||capture.model.length>100||capture.modelVersion.length>120))throw new Error('GEO_MODEL_VERSION_REQUIRED');
 if(!Array.isArray(capture.results)||capture.results.length<2||capture.results.length>32)throw new Error('CAPTURE_REQUIRES_2_TO_32_RESULTS');
 const seen=new Set();
 for(const row of capture.results){
  if(!row||typeof row!=='object'||Array.isArray(row))throw new Error('CAPTURE_RESULT_INVALID');
  const allowedResultKeys=capture.source==='independent_serp'
   ?new Set(['platformId','position','sourceUrl','sampleCount','sponsored'])
   :new Set(['platformId','mentions','citations','sourceUrl','sampleCount','sponsored']);
  if(Object.keys(row).some(key=>!allowedResultKeys.has(key)))throw new Error('CAPTURE_RESULT_UNEXPECTED_FIELD');
  if(typeof row.platformId!=='string'||!knownIds.has(row.platformId))throw new Error('CAPTURE_PRODUCT_UNKNOWN');
  if(seen.has(row.platformId))throw new Error('CAPTURE_DUPLICATE_PRODUCT');
  seen.add(row.platformId);
  if(!safeUrl(row.sourceUrl))throw new Error('CAPTURE_SOURCE_URL_INVALID');
  if(!Number.isInteger(row.sampleCount)||row.sampleCount!==1)throw new Error('CAPTURE_SAMPLE_COUNT_INVALID');
  if(row.sponsored!==false)throw new Error('SPONSORED_OR_UNVERIFIED_RESULT_NOT_COMPARABLE');
  if(capture.source==='independent_serp'){
   if(!Number.isInteger(row.position)||row.position<1||row.position>100)throw new Error('SERP_POSITION_INVALID');
  }else{
   if(!Number.isInteger(row.mentions)||row.mentions<0||row.mentions>10000||
      !Number.isInteger(row.citations)||row.citations<0||row.citations>10000)throw new Error('GEO_COUNTS_INVALID');
  }
 }
}

function observationPayload(row){
 const payload={
  platformId:row.platformId,source:row.source,observedAt:row.observedAt,country:row.country,
  language:row.language,query:row.query,engine:row.engine
 };
 if(row.model!==undefined)payload.model=row.model;
 if(row.modelVersion!==undefined)payload.modelVersion=row.modelVersion;
 payload.captureGroupId=row.captureGroupId;
 payload.sourceUrl=row.sourceUrl;
 payload.methodVersion=row.methodVersion;
 payload.sampleCount=row.sampleCount;
 payload.rawCaptureSha256=row.rawCaptureSha256;
 if(row.position!==undefined)payload.position=row.position;
 if(row.mentions!==undefined)payload.mentions=row.mentions;
 if(row.citations!==undefined)payload.citations=row.citations;
 payload.sponsored=row.sponsored;
 payload.reviewed=true;
 payload.reviewedAt=row.reviewedAt;
 payload.reviewedBy=row.reviewedBy;
 payload.reviewReason=row.reviewReason;
 return payload;
}

export function reviewCapture(rawText,manifest,{knownIds=new Set()}={}){
 if(typeof rawText!=='string'||Buffer.byteLength(rawText,'utf8')>256000)throw new Error('CAPTURE_SIZE_INVALID');
 const capture=JSON.parse(rawText);
 validateCapture(capture,knownIds);
 const rawCaptureSha256=digest(Buffer.from(rawText,'utf8'));
 if(!manifest||typeof manifest!=='object'||Array.isArray(manifest)||
    Object.keys(manifest).some(key=>!['captureGroupId','rawCaptureSha256','reviewer','reviewedAt','decisions'].includes(key))||
    manifest.captureGroupId!==capture.captureGroupId||manifest.rawCaptureSha256!==rawCaptureSha256)
  throw new Error('REVIEW_CAPTURE_HASH_OR_GROUP_MISMATCH');
 const reviewer=manifest.reviewer,reviewedAt=manifest.reviewedAt;
 if(typeof reviewer!=='string'||!/^[-a-zA-Z0-9_.]{2,80}$/.test(reviewer))throw new Error('REVIEWER_INVALID');
 if(!validDate(reviewedAt)||Date.parse(reviewedAt)<Date.parse(capture.observedAt)||Date.parse(reviewedAt)>Date.now()+300000)throw new Error('REVIEW_TIMESTAMP_INVALID');
 if(!Array.isArray(manifest.decisions))throw new Error('REVIEW_DECISIONS_INVALID');
 const decisions=new Map();
 for(const d of manifest.decisions){
  if(!d||typeof d.platformId!=='string'||decisions.has(d.platformId)||typeof d.approve!=='boolean'||
     Object.keys(d).some(key=>!['platformId','approve','reason'].includes(key))||
     typeof d.reason!=='string'||d.reason.trim().length<20||d.reason.length>500)throw new Error('REVIEW_DECISION_INVALID');
  decisions.set(d.platformId,d);
 }
 const captureIds=new Set(capture.results.map(x=>x.platformId));
 if(decisions.size!==captureIds.size||[...captureIds].some(id=>!decisions.has(id)))throw new Error('REVIEW_DECISIONS_INCOMPLETE');
 const approved=[],rejected=[];
 for(const row of capture.results){
  const decision=decisions.get(row.platformId);
  if(!decision.approve){rejected.push({platformId:row.platformId,reason:decision.reason.trim()});continue;}
  const base={
   platformId:row.platformId,source:capture.source,observedAt:capture.observedAt,
   country:capture.country,language:capture.language,query:capture.query,
   engine:capture.engine,
   ...(capture.model!==undefined?{model:capture.model}:{}),
   ...(capture.modelVersion!==undefined?{modelVersion:capture.modelVersion}:{}),
   captureGroupId:capture.captureGroupId,sourceUrl:row.sourceUrl,
   methodVersion:capture.methodVersion,sampleCount:row.sampleCount,rawCaptureSha256,
   ...(capture.source==='independent_serp'?{position:row.position}:{mentions:row.mentions,citations:row.citations}),
   sponsored:false,reviewed:true,reviewedAt,reviewedBy:reviewer,reviewReason:decision.reason.trim()
  };
  const recordHash='sha256:'+digest(JSON.stringify(base));
  approved.push({id:prefixFor(capture.source)+recordHash.slice(7,31),...base,recordHash});
 }
 if(approved.length<2)throw new Error('COMPARISON_REQUIRES_TWO_APPROVED_PRODUCTS');
 return {approved,rejected,rawCaptureSha256,captureGroupId:capture.captureGroupId};
}

function verifyGsc(row){
 const base={property:row.sourceProperty,page:row.sourcePage,query:row.query,date:row.sourceDate,
  impressions:row.impressions,clicks:row.clicks,position:row.position};
 const hash=digest(JSON.stringify(base));
 if(row.recordHash!=='sha256:'+hash||row.id!=='gsc-'+hash.slice(0,24))throw new Error('GSC_RECORD_HASH_MISMATCH');
}
function verifyIndependent(row){
 const prefix=prefixFor(row.source);
 if(!prefix||row.reviewed!==true||row.sponsored!==false||typeof row.captureGroupId!=='string'||
    !/^[-a-zA-Z0-9_.]{8,80}$/.test(row.captureGroupId)||
    !/^[a-f0-9]{64}$/.test(row.rawCaptureSha256||'')||!validDate(row.observedAt)||!validDate(row.reviewedAt)||
    Date.parse(row.reviewedAt)<Date.parse(row.observedAt)||Date.parse(row.reviewedAt)>Date.now()+300000||
    !['en','ja','ko','fr','de','es','pt','ar','zh'].includes(row.language)||
    !/^([A-Z]{2}|GLOBAL)$/.test(row.country)||typeof row.query!=='string'||!row.query.trim()||row.query.length>512||
    typeof row.methodVersion!=='string'||!row.methodVersion.trim()||
    typeof row.reviewedBy!=='string'||!/^[-a-zA-Z0-9_.]{2,80}$/.test(row.reviewedBy)||
    typeof row.reviewReason!=='string'||row.reviewReason.trim().length<20||row.reviewReason.length>500||
    !safeUrl(row.sourceUrl)||row.sampleCount!==1||
    typeof row.engine!=='string'||!row.engine.trim())throw new Error('INDEPENDENT_OBSERVATION_INVALID');
 if(row.source==='independent_serp'&&(!['Google','Bing'].includes(row.engine)||!Number.isInteger(row.position)||row.position<1||row.position>100))
  throw new Error('INDEPENDENT_SERP_METRIC_INVALID');
 if(row.source==='ai_answer_citation'&&(!row.model||!row.modelVersion||
    !Number.isInteger(row.mentions)||row.mentions<0||!Number.isInteger(row.citations)||row.citations<0))
  throw new Error('AI_CITATION_METRIC_INVALID');
 const hash=digest(JSON.stringify(observationPayload(row)));
 if(row.recordHash!=='sha256:'+hash||row.id!==prefix+hash.slice(7,31))throw new Error('INDEPENDENT_RECORD_HASH_MISMATCH');
}

export function verifyLedger(rows,{captureDirectory,knownIds}={}){
 if(!Array.isArray(rows)||rows.length>10000)throw new Error('SEO_GEO_LEDGER_INVALID');
 const ids=new Set(),groups=new Map();
 for(const row of rows){
  if(!row||typeof row.id!=='string'||ids.has(row.id))throw new Error('SEO_GEO_DUPLICATE_OR_INVALID_ID');
  ids.add(row.id);
  if(knownIds&&!knownIds.has(row.platformId))throw new Error('SEO_GEO_UNKNOWN_PRODUCT');
  if(row.source==='google_search_console')verifyGsc(row);
  else if(row.source==='independent_serp'||row.source==='ai_answer_citation'){
   verifyIndependent(row);
   const key=[row.source,row.captureGroupId].join('|');
   const list=groups.get(key)||[];list.push(row);groups.set(key,list);
  }else throw new Error('SEO_GEO_SOURCE_NOT_SUPPORTED_FOR_PUBLICATION');
 }
 for(const group of groups.values()){
  if(group.length<2||new Set(group.map(x=>x.platformId)).size!==group.length)throw new Error('COMPARISON_GROUP_INCOMPLETE');
  const first=group[0];
  for(const row of group){
   if(row.country!==first.country||row.language!==first.language||row.query!==first.query||
      row.engine!==first.engine||row.model!==first.model||row.modelVersion!==first.modelVersion||
      row.methodVersion!==first.methodVersion||row.observedAt!==first.observedAt||
      row.rawCaptureSha256!==first.rawCaptureSha256||row.sponsored!==false)
    throw new Error('COMPARISON_GROUP_NOT_COMPARABLE');
  }
  if(captureDirectory){
   const file=captureFilePath(captureDirectory,first.captureGroupId,first.rawCaptureSha256);
   if(!fs.existsSync(file)||digest(fs.readFileSync(file))!==first.rawCaptureSha256)throw new Error('RAW_CAPTURE_ARCHIVE_MISSING_OR_TAMPERED');
  }
 }
 return {observations:rows.length,gsc:rows.filter(x=>x.source==='google_search_console').length,
  comparative:rows.filter(x=>x.source!=='google_search_console').length,
  comparisonGroups:groups.size};
}

export function mergeReviewedObservations(existing,approved){
 if(!Array.isArray(existing)||!Array.isArray(approved))throw new Error('SEO_GEO_LEDGER_INVALID');
 const byId=new Map();
 for(const row of existing){
  if(!row||typeof row.id!=='string')throw new Error('EXISTING_OBSERVATION_INVALID');
  const previous=byId.get(row.id);
  if(previous&&previous.recordHash!==row.recordHash)throw new Error('EXISTING_OBSERVATION_CONFLICT');
  byId.set(row.id,row);
 }
 let added=0,duplicate=0;
 for(const row of approved){
  const previous=byId.get(row.id);
  if(previous){
   if(previous.recordHash!==row.recordHash)throw new Error('OBSERVATION_ID_HASH_CONFLICT');
   duplicate++;continue;
  }
  byId.set(row.id,row);added++;
 }
 const result=[...byId.values()].sort((a,b)=>Date.parse(b.observedAt)-Date.parse(a.observedAt)||a.id.localeCompare(b.id));
 verifyLedger(result);
 return {result,added,duplicate};
}

function knownProductIds(){
 const catalog=JSON.parse(fs.readFileSync(path.join(root,'data/catalog.json'),'utf8'));
 const legacy=fs.readFileSync(path.join(root,'lib/data.ts'),'utf8');
 const ids=[...legacy.matchAll(/^\{id:'([^']+)'/gm)].map(m=>m[1]);
 return new Set([...catalog.map(x=>x.id),...ids]);
}
function readJson(file){return JSON.parse(fs.readFileSync(path.resolve(file),'utf8'));}
function usage(){process.stdout.write('Usage: node scripts/review-independent-seo-geo.mjs --hash <capture.json> | --validate-ledger | <capture.json> <review.json> [--confirm-publish]\n');}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{
  const args=process.argv.slice(2);
  if(args[0]==='--hash'&&args[1]){
   process.stdout.write(digest(fs.readFileSync(path.resolve(args[1])))+'\n');
  }else if(args[0]==='--validate-ledger'){
   const rows=readJson(ledgerFile);
   process.stdout.write(JSON.stringify(verifyLedger(rows,{captureDirectory:captureDir}),null,2)+'\n');
  }else{
   const [capturePath,manifestPath,...flags]=args;
   if(!capturePath||!manifestPath||flags.some(x=>x!=='--confirm-publish')){usage();process.exitCode=2;}
   else{
    const rawText=fs.readFileSync(path.resolve(capturePath),'utf8');
    const reviewed=reviewCapture(rawText,readJson(manifestPath),{knownIds:knownProductIds()});
    const existing=readJson(ledgerFile);
    const merged=mergeReviewedObservations(existing,reviewed.approved);
    const summary={captureGroupId:reviewed.captureGroupId,rawCaptureSha256:reviewed.rawCaptureSha256,
     approved:reviewed.approved.length,rejected:reviewed.rejected.length,added:merged.added,
     duplicates:merged.duplicate,total:merged.result.length,published:flags.includes('--confirm-publish')};
    if(flags.includes('--confirm-publish')){
     fs.mkdirSync(captureDir,{recursive:true});
     const archive=captureFilePath(captureDir,reviewed.captureGroupId,reviewed.rawCaptureSha256);
     if(fs.existsSync(archive)&&digest(fs.readFileSync(archive))!==reviewed.rawCaptureSha256)throw new Error('RAW_CAPTURE_ARCHIVE_CONFLICT');
     if(!fs.existsSync(archive)){
      const archiveTmp=archive+'.tmp';fs.writeFileSync(archiveTmp,rawText,'utf8');fs.renameSync(archiveTmp,archive);
     }
     verifyLedger(merged.result,{captureDirectory:captureDir,knownIds:knownProductIds()});
     const tmp=ledgerFile+'.tmp';fs.writeFileSync(tmp,JSON.stringify(merged.result,null,2)+'\n','utf8');fs.renameSync(tmp,ledgerFile);
     summary.archive=path.relative(root,archive).replaceAll(path.sep,'/');
    }
    process.stdout.write(JSON.stringify(summary,null,2)+'\n');
   }
  }
 }catch(error){process.stderr.write(String(error?.message||error)+'\n');process.exitCode=2;}
}
