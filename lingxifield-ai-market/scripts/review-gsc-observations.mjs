#!/usr/bin/env node
/**
 * Human-reviewed publication gate for finalized Google Search Console evidence.
 * Collection is read-only and always emits reviewed:false rows. This script
 * requires an explicit per-row decision manifest and --confirm-publish.
 */
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {safeGscQuery} from '../lib/gsc-query-safety.mjs';
import {matchGscProductPage} from './parse-gsc-product-route.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const outputFile=path.join(root,'data/seo-geo-observations.json');
const GSC_SOURCE='https://search.google.com/search-console/performance/search-analytics';
const LOCALES=new Set(['zh','en','ja','ko','fr','de','es','pt','ar']);
const sha256=value=>createHash('sha256').update(value).digest('hex');

function requireOrigin(value){
 if(typeof value!=='string')throw new Error('CANONICAL_ORIGIN_REQUIRED');
 const u=new URL(value);
 if(u.protocol!=='https:'||u.username||u.password||u.port||u.pathname!=='/'||u.search||u.hash||
  !['ai.lingxifield.com','ai.lingxifield.cn','market.lingxifield.com','market.lingxifield.cn'].includes(u.hostname))
  throw new Error('CANONICAL_ORIGIN_NOT_APPROVED');
 return u.origin;
}
function propertyMatchesOrigin(property,origin){
 if(typeof property!=='string'||!property.trim())return false;
 if(property.startsWith('sc-domain:')){
  const domain=property.slice('sc-domain:'.length).toLowerCase();
  const host=new URL(origin).hostname.toLowerCase();
  return Boolean(domain)&&(/^[a-z0-9.-]+$/.test(domain))&&(host===domain||host.endsWith('.'+domain));
 }
 try{const u=new URL(property);return u.protocol==='https:'&&u.origin===origin&&u.pathname==='/'&&!u.search&&!u.hash;}catch{return false;}
}
function validatePendingRecord(row,{expectedOrigin,expectedProperty,knownIds}){
 if(!row||typeof row!=='object'||Array.isArray(row))throw new Error('PENDING_ROW_INVALID');
 if(row.source!=='google_search_console'||row.reviewed!==false||row.reviewedBy!==undefined||row.reviewReason!==undefined)throw new Error('PENDING_ROW_NOT_UNREVIEWED_GSC');
 if(typeof row.id!=='string'||!/^gsc-[a-f0-9]{24}$/.test(row.id))throw new Error('GSC_ID_INVALID');
 if(row.sourceProperty!==expectedProperty||!propertyMatchesOrigin(row.sourceProperty,expectedOrigin))throw new Error('GSC_PROPERTY_MISMATCH');
 if(row.sourceUrl!==GSC_SOURCE)throw new Error('GSC_SOURCE_URL_INVALID');
 if(typeof row.sourceDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(row.sourceDate)||!Number.isFinite(Date.parse(row.sourceDate+'T00:00:00Z')))throw new Error('GSC_DATE_INVALID');
 if(row.observedAt!==row.sourceDate+'T12:00:00Z')throw new Error('GSC_OBSERVATION_DATE_MISMATCH');
 if(typeof row.query!=='string'||safeGscQuery(row.query)!==row.query)throw new Error('GSC_QUERY_NOT_SAFE_OR_NORMALIZED');
 if(row.country!=='GLOBAL'||!LOCALES.has(row.language)||row.sponsored!==false)throw new Error('GSC_DIMENSION_INVALID');
 if(!Number.isInteger(row.impressions)||row.impressions<3||!Number.isInteger(row.clicks)||row.clicks<0||row.clicks>row.impressions||
  typeof row.position!=='number'||!Number.isFinite(row.position)||row.position<1)throw new Error('GSC_METRICS_INVALID');
 if(row.sampleCount!==Math.max(1,Math.floor(row.impressions)))throw new Error('GSC_SAMPLE_COUNT_MISMATCH');
 const match=matchGscProductPage(row.sourcePage,knownIds,expectedOrigin);
 if(!match||match.platformId!==row.platformId||match.language!==row.language)throw new Error('GSC_PRODUCT_PAGE_MISMATCH');
 const base={property:row.sourceProperty,page:row.sourcePage,query:row.query,date:row.sourceDate,impressions:row.impressions,clicks:row.clicks,position:row.position};
 const digest=sha256(JSON.stringify(base));
 if(row.recordHash!=='sha256:'+digest||row.id!=='gsc-'+digest.slice(0,24))throw new Error('GSC_RECORD_HASH_MISMATCH');
 return true;
}

export function reviewGscEvidence(pending,manifest,{expectedOrigin,expectedProperty,knownIds}={}){
 const origin=requireOrigin(expectedOrigin);
 if(!Array.isArray(pending)||!Array.isArray(manifest?.decisions)||!pending.length)throw new Error('REVIEW_INPUT_INVALID');
 if(!propertyMatchesOrigin(expectedProperty,origin))throw new Error('EXPECTED_PROPERTY_MISMATCH');
 const reviewer=manifest.reviewer;
 if(typeof reviewer!=='string'||!/^[-a-zA-Z0-9_.@]{2,80}$/.test(reviewer))throw new Error('REVIEWER_INVALID');
 const reviewedAt=manifest.reviewedAt;
 const reviewedTime=Date.parse(reviewedAt);
 if(typeof reviewedAt!=='string'||!Number.isFinite(reviewedTime)||reviewedTime>Date.now()+300000||reviewedTime<Date.now()-30*86400000)throw new Error('REVIEW_TIMESTAMP_INVALID');
 const ids=new Set(),decisions=new Map();
 for(const decision of manifest.decisions){
  if(!decision||typeof decision.id!=='string'||ids.has(decision.id)||typeof decision.approve!=='boolean'||
   typeof decision.reason!=='string'||decision.reason.trim().length<20||decision.reason.length>500)throw new Error('REVIEW_DECISION_INVALID');
  ids.add(decision.id);decisions.set(decision.id,decision);
 }
 const pendingIds=new Set();
 for(const row of pending){
  validatePendingRecord(row,{expectedOrigin:origin,expectedProperty,knownIds});
  if(pendingIds.has(row.id))throw new Error('PENDING_DUPLICATE_ID');
  pendingIds.add(row.id);
 }
 if(pendingIds.size!==decisions.size||[...pendingIds].some(id=>!decisions.has(id)))throw new Error('REVIEW_DECISIONS_INCOMPLETE');
 const approved=[],rejected=[];
 for(const row of pending){
  const decision=decisions.get(row.id);
  if(decision.approve)approved.push({...row,reviewed:true,reviewedAt,reviewedBy:reviewer,reviewReason:decision.reason.trim()});
  else rejected.push({id:row.id,reason:decision.reason.trim()});
 }
 return {approved,rejected,reviewer,reviewedAt};
}

export function mergeReviewedObservations(existing,approved){
 if(!Array.isArray(existing)||!Array.isArray(approved))throw new Error('OBSERVATION_LEDGER_INVALID');
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
 if(result.length>10000)throw new Error('OBSERVATION_LEDGER_CAP_EXCEEDED');
 return {result,added,duplicate};
}

function readJson(file){return JSON.parse(fs.readFileSync(path.resolve(file),'utf8'));}
function usage(){process.stdout.write('Usage: node scripts/review-gsc-observations.mjs <pending.json> <review-manifest.json> [--confirm-publish]\n');}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [, ,pendingPath,manifestPath,...flags]=process.argv;
 if(!pendingPath||!manifestPath||flags.some(x=>x!=='--confirm-publish')){usage();process.exitCode=2;}
 else try{
  const expectedOrigin=process.env.AI_MARKET_CANONICAL_ORIGIN,expectedProperty=process.env.GSC_PROPERTY;
  if(!expectedOrigin||!expectedProperty)throw new Error('GSC_PROPERTY_AND_CANONICAL_ORIGIN_REQUIRED');
  const pending=readJson(pendingPath),manifest=readJson(manifestPath);
  const catalog=readJson(path.join(root,'data/catalog.json'));
  const knownIds=new Set(catalog.map(x=>x.id));
  const reviewed=reviewGscEvidence(pending,manifest,{expectedOrigin,expectedProperty,knownIds});
  const existing=readJson(outputFile);
  const merged=mergeReviewedObservations(existing,reviewed.approved);
  const summary={approved:reviewed.approved.length,rejected:reviewed.rejected.length,added:merged.added,duplicates:merged.duplicate,total:merged.result.length,reviewer:reviewed.reviewer,published:flags.includes('--confirm-publish')};
  if(flags.includes('--confirm-publish')){
   const temp=outputFile+'.tmp';
   fs.writeFileSync(temp,JSON.stringify(merged.result,null,2)+'\n','utf8');
   fs.renameSync(temp,outputFile);
  }
  process.stdout.write(JSON.stringify(summary,null,2)+'\n');
 }catch(error){process.stderr.write(String(error?.message||error)+'\n');process.exitCode=2;}
}
