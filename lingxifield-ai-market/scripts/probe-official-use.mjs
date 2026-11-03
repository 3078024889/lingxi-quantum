#!/usr/bin/env node
/** 32 publisher entrypoints. --live performs public HEAD only, never login/tasks/payment. */
import {readFileSync} from 'node:fs';
import {probeOfficialEndpoint,safePublicPublisherUrl} from '../lib/market-official-use-probe.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const catalog=JSON.parse(read('data/catalog.json'));
const legacy=read('lib/data.ts');
const main=[...legacy.matchAll(/\{id:'([a-z0-9-]+)'[^\n]*?website:'([^']+)'/g)]
 .map(([,id,website])=>({id,website,websiteKind:website.startsWith('https://github.com/')?'repository':'official'}));
const source=read('lib/market-api-service-catalog.ts');
const match=source.match(/const ALL=\[([^\]]+)\] as const;/);
if(!match)throw Error('CURATED_MARKET_IDS_NOT_FOUND');
const ids=[...match[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);
const found=new Map([...main,...catalog].map(x=>[x.id,x]));
if(ids.length!==32||new Set(ids).size!==32)throw Error('EXPECTED_32_CURATED_PRODUCTS');
const entries=ids.map(id=>{
 const x=found.get(id);
 if(!x||!safePublicPublisherUrl(x.website))throw Error('MISSING_PUBLIC_PUBLISHER_LINK_'+id);
 return {id,url:x.website,kind:x.websiteKind||'official'};
});
const live=process.argv.includes('--live');
const results=[];
if(live){
 // Strict concurrency to avoid hammering publishers. No redirects, cookies or account requests.
 const concurrency=4;
 for(let start=0;start<entries.length;start+=concurrency){
  const batch=await Promise.all(entries.slice(start,start+concurrency).map(x=>probeOfficialEndpoint(x)));
  results.push(...batch);
 }
}else{
 for(const x of entries)results.push({id:x.id,kind:x.kind,host:new URL(x.url).hostname,result:'not_probed'});
}
const states=Object.fromEntries([...new Set(results.map(x=>x.result))].sort().map(k=>[k,results.filter(x=>x.result===k).length]));
process.stdout.write(JSON.stringify({scope:'32_official_public_entrypoints',mode:live?'public_http_head':'static_inventory',
 observedAt:new Date().toISOString(),total:results.length,states,results,
 caveat:'Public HTTP HEAD only. Bot challenges, redirects and rate limits do not prove user-facing failures. No login, account functions, generation, actual pricing or downloads were tested.'},null,2)+'\n');
