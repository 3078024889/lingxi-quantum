#!/usr/bin/env node
/**
 * Collect real, finalized Google Search Console rows for LINGXIFIELD product detail pages.
 * No API key or account? Exit with explicit CONFIG_REQUIRED and do not fabricate data.
 * Service account must be granted READ access to the named Search Console property.
 *
 * Env:
 *  GSC_SERVICE_ACCOUNT_JSON (whole JSON secret, never commit)
 *  GSC_PROPERTY (e.g. sc-domain:lingxifield.com)
 *  GSC_LOOKBACK_DAYS (7..28)
 *  AI_MARKET_CANONICAL_ORIGIN (dedicated, owned HTTPS AI market host)
 */
import {createSign,createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {matchGscProductPage} from './parse-gsc-product-route.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),outfile=path.join(root,'data/seo-geo-observations.json');
function allProductIds(){
 const catalog=JSON.parse(fs.readFileSync(path.join(root,'data/catalog.json'),'utf8'));
 const facts=fs.readFileSync(path.join(root,'lib/market-researched-facts.ts'),'utf8');
 const token='export const RESEARCHED_FACTS:Readonly<Record<string,MarketResearchFact>>=';
 const begin=facts.indexOf(token)+token.length,end=facts.lastIndexOf(';',facts.indexOf('export const MARKET_RESEARCH_CHECKED_AT',begin));
 if(begin<token.length||end<begin)throw Error('CURATED_CATALOG_NOT_FOUND');
 return new Set([...catalog.map(x=>x.id),...Object.keys(JSON.parse(facts.slice(begin,end)))]);
}

function fatal(msg){process.stderr.write(msg+'\n');process.exitCode=2;}
const raw=process.env.GSC_SERVICE_ACCOUNT_JSON,property=process.env.GSC_PROPERTY,origin=process.env.AI_MARKET_CANONICAL_ORIGIN;
if(!raw||!property||!origin){fatal('GSC_CONFIG_REQUIRED: Set GSC_SERVICE_ACCOUNT_JSON, GSC_PROPERTY and the verified AI_MARKET_CANONICAL_ORIGIN.');}
else try{
 const u=new URL(origin);
 if(u.protocol!=='https:'||u.username||u.password||u.port||u.pathname!=='/'||u.search||u.hash||!['ai.lingxifield.com','ai.lingxifield.cn','market.lingxifield.com','market.lingxifield.cn'].includes(u.hostname))throw Error('GSC_MARKET_ORIGIN_INVALID');
 if(property.startsWith('sc-domain:')){
  const domain=property.slice('sc-domain:'.length).toLowerCase();
  if(u.hostname!==domain&&!u.hostname.endsWith('.'+domain))throw Error('GSC_PROPERTY_HOST_MISMATCH');
 }else{const uProperty=new URL(property);if(uProperty.protocol!=='https:'||uProperty.hostname!==u.hostname)throw Error('GSC_PROPERTY_HOST_MISMATCH');}

 const key=JSON.parse(raw),now=Math.floor(Date.now()/1000);
 if(!key.client_email||!key.private_key||!property.startsWith('sc-domain:')&&!property.startsWith('https://'))throw Error('GSC_CREDENTIAL_OR_PROPERTY_INVALID');
 const b64=obj=>Buffer.from(JSON.stringify(obj)).toString('base64url');
 const part=b64({alg:'RS256',typ:'JWT'})+'.'+b64({iss:key.client_email,scope:'https://www.googleapis.com/auth/webmasters.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
 const signature=createSign('RSA-SHA256').update(part).sign(key.private_key).toString('base64url');
 const body=new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:part+'.'+signature});
 const tokenRes=await fetch('https://oauth2.googleapis.com/token',{method:'POST',body,signal:AbortSignal.timeout(15000)});
 if(!tokenRes.ok)throw Error('GSC_OAUTH_FAILED_'+tokenRes.status);
 const token=(await tokenRes.json()).access_token;if(!token)throw Error('GSC_TOKEN_MISSING');
 const until=new Date(Date.now()-4*86400000).toISOString().slice(0,10); // finalized measurements, not today's partial GSC data
 const lookback=Math.max(7,Math.min(28,Number(process.env.GSC_LOOKBACK_DAYS)||7));
 const since=new Date(Date.now()-(3+lookback)*86400000).toISOString().slice(0,10);
 let entries=[];for(let page=0;page<5;page++){
  const request={startDate:since,endDate:until,dimensions:['page','query','date'],rowLimit:25000,startRow:page*25000,dataState:'final',type:'web'};
  const r=await fetch('https://www.googleapis.com/webmasters/v3/sites/'+encodeURIComponent(property)+'/searchAnalytics/query',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(request),signal:AbortSignal.timeout(30000)});
  if(!r.ok)throw Error('GSC_QUERY_'+r.status);
  const batch=(await r.json()).rows||[];entries.push(...batch);if(batch.length<25000)break;
 }
 const known=allProductIds();
 const old=JSON.parse(fs.readFileSync(outfile,'utf8'));if(!Array.isArray(old))throw Error('GSC_LEDGER_NOT_ARRAY');
 const seen=new Map(old.map(x=>[x.id,x]));
 let count=0;
 for(const row of entries){
  const [page,query,date]=row.keys||[];
  if(typeof page!=='string'||typeof query!=='string'||typeof date!=='string')continue;
  const match=matchGscProductPage(page,known,u.origin);if(!match)continue;
  if((row.impressions||0)<3)continue; // avoid exposing rare possibly sensitive long-tail search terms
  const base={property,page,query,date,impressions:row.impressions,clicks:row.clicks,position:row.position};
  const digest=createHash('sha256').update(JSON.stringify(base)).digest('hex');
  const id='gsc-'+digest.slice(0,24),observedAt=date+'T12:00:00Z';
  const result={id,platformId:match.platformId,source:'google_search_console',observedAt,country:'GLOBAL',language:match.language,
    query,engine:'Google Search Console',sourceUrl:'https://search.google.com/search-console/performance/search-analytics',
    recordHash:'sha256:'+digest,methodVersion:'GSC.web.page-query-date.v1',sampleCount:Math.max(1,Math.floor(row.impressions||0)),
    position:row.position,impressions:row.impressions,clicks:row.clicks,sponsored:false,reviewed:true,reviewedAt:new Date().toISOString()};
  seen.set(id,result);count++;
 }
 // Dates are immutable GSC aggregates; keep 90-day window and bounded public dataset.
 const cutoff=Date.now()-90*86400000;
 const result=[...seen.values()].filter(x=>Date.parse(x.observedAt)>cutoff).slice(-10000);
 const tmp=outfile+'.tmp';fs.writeFileSync(tmp,JSON.stringify(result,null,2)+'\n','utf8');fs.renameSync(tmp,outfile);
 process.stdout.write('GSC_SYNC_PASS rows='+count+' stored='+result.length+' property='+property+'\n');
}catch(error){fatal(String(error).replace(/-----BEGIN[^\n]*/g,'[REDACTED]'));}
