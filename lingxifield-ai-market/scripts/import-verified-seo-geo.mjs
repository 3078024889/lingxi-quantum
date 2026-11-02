#!/usr/bin/env node
/**
 * Append externally observed SEO/GEO measurements with source evidence and review gate.
 *
 * Usage: SEO_GEO_REVIEW_APPROVED=1 node scripts/import-verified-seo-geo.mjs reports/measured-observations.json
 * Input is an ARRAY of real measurements and must include rawCaptureSha256.
 * No fabricated samples or ranks; records are treated as externally verified only after review.
 */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function allProductIds(){
 const catalog=JSON.parse(fs.readFileSync(path.join(root,'data/catalog.json'),'utf8'));
 const facts=fs.readFileSync(path.join(root,'lib/market-researched-facts.ts'),'utf8');
 const token='export const RESEARCHED_FACTS:Readonly<Record<string,MarketResearchFact>>=';
 const begin=facts.indexOf(token)+token.length,end=facts.lastIndexOf(';',facts.indexOf('export const MARKET_RESEARCH_CHECKED_AT',begin));
 if(begin<token.length||end<begin)throw Error('CURATED_CATALOG_NOT_FOUND');
 return new Set([...catalog.map(x=>x.id),...Object.keys(JSON.parse(facts.slice(begin,end)))]);
}

const known=allProductIds();
const file=process.argv[2];
if(process.env.SEO_GEO_REVIEW_APPROVED!=='1'||!file){process.stderr.write('REVIEW_REQUIRED: set SEO_GEO_REVIEW_APPROVED=1 only after reviewing source captures; pass a measurement JSON path.\n');process.exit(2);}
const raw=JSON.parse(fs.readFileSync(path.resolve(file),'utf8'));
if(!Array.isArray(raw)||raw.length>10000)throw Error('INVALID_MEASUREMENT_BATCH');
const out=path.join(root,'data/seo-geo-observations.json');
const existing=JSON.parse(fs.readFileSync(out,'utf8'));
if(!Array.isArray(existing))throw Error('BAD_EXISTING_LEDGER');
const ids=new Map(existing.map(x=>[x.id,x]));
const allowed=new Set(['independent_serp','ai_answer_citation','bing_webmaster','google_search_console']);
for(const row of raw){
 const {platformId,source,country,language,query,sourceUrl,observedAt,rawCaptureSha256,model,modelVersion,engine,methodVersion,sampleCount}=row;
 if(!known.has(platformId)||!allowed.has(source)||!['zh','en','ja','ko','fr','de','es','pt','ar'].includes(language))throw Error('INVALID_TARGET_OR_SOURCE');
 if(!/^([A-Z]{2}|GLOBAL)$/.test(country)||typeof query!=='string'||query.trim().length<3||query.length>512)throw Error('INVALID_QUERY_OR_MARKET');
 if(typeof sourceUrl!=='string'||!/^https:\/\//.test(sourceUrl))throw Error('INVALID_EVIDENCE_URL');
 if(!/^[0-9a-f]{64}$/.test(rawCaptureSha256||''))throw Error('EVIDENCE_CAPTURE_HASH_REQUIRED');
 if(!Number.isInteger(sampleCount)||sampleCount<1)throw Error('INVALID_SAMPLE_COUNT');
 if(!methodVersion||typeof methodVersion!=='string')throw Error('METHOD_VERSION_REQUIRED');
 if(!observedAt||!Number.isFinite(Date.parse(observedAt))||Date.parse(observedAt)>Date.now()+300000)throw Error('INVALID_DATE');
 if(source==='ai_answer_citation'&&(!model||!modelVersion||!engine))throw Error('GEO_MODEL_VERSION_REQUIRED');
 for(const n of ['position','impressions','clicks','mentions','citations']){
  if(row[n]!==undefined&&(!Number.isFinite(row[n])||row[n]<0))throw Error('INVALID_METRIC_'+n);
 }
 if(source==='independent_serp'&&!(row.position>=1))throw Error('SERP_RANK_REQUIRED');
 if(source==='ai_answer_citation'&&!Number.isInteger(row.citations||0))throw Error('GEO_CITATION_COUNT_REQUIRED');
 if(source==='google_search_console'&&(!sourceUrl.includes('search.google.com')||!/^https:\/\//.test(row.propertyUrl||'')))throw Error('GSC_OWNED_PROPERTY_REQUIRED');
 const input={platformId,source,country,language,query,sourceUrl,observedAt,rawCaptureSha256,methodVersion,model,modelVersion,engine,sampleCount,
  position:row.position,impressions:row.impressions,clicks:row.clicks,mentions:row.mentions,citations:row.citations};
 const digest=createHash('sha256').update(JSON.stringify(input)).digest('hex');
 const id='proof-'+digest.slice(0,24);
 ids.set(id,{id,platformId,source,country,language,query,sourceUrl,observedAt,model,modelVersion,engine,methodVersion,
  sampleCount,rawCaptureSha256,position:row.position,impressions:row.impressions,clicks:row.clicks,mentions:row.mentions,citations:row.citations,
  recordHash:'sha256:'+digest,sponsored:false,reviewed:true,reviewedAt:new Date().toISOString()});
}
const snapshot=[...ids.values()].sort((a,b)=>a.observedAt.localeCompare(b.observedAt)).slice(-20000);
const tmp=out+'.tmp';fs.writeFileSync(tmp,JSON.stringify(snapshot,null,2)+'\n');fs.renameSync(tmp,out);
process.stdout.write('SEO_GEO_VERIFIED_IMPORT_PASS imported='+raw.length+' total='+snapshot.length+'\n');
