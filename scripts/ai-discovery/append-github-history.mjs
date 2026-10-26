#!/usr/bin/env node
/** Append-only, validated snapshots. Does not publish or deploy. */
import {readFileSync,writeFileSync,renameSync,unlinkSync} from "node:fs";
import {randomUUID} from "node:crypto";
import {resolve,dirname,join} from "node:path";
const source=resolve("lib/ai-discovery/github-observations.json");
const destination=resolve("lib/ai-discovery/github-history.json");
const latest=JSON.parse(readFileSync(source,"utf8"));
const previous=JSON.parse(readFileSync(destination,"utf8"));
if(!Array.isArray(latest)||!latest.length||!Array.isArray(previous))throw Error("Invalid history or snapshot");
const key=r=>r.repository+"|"+r.observedAt;
const all=new Map();
for(const r of [...previous,...latest]){
 if(!r||typeof r.repository!=="string"||!/^\w[\w.-]*\/[\w.-]+$/.test(r.repository)||!Number.isSafeInteger(r.stars)||r.stars<0||!Number.isSafeInteger(r.forks)||r.forks<0||!Number.isFinite(Date.parse(r.observedAt))||typeof r.archived!=="boolean"||r.sourceUrl!=="https://api.github.com/repos/"+r.repository)throw Error("Invalid historical observation");
 const k=key(r),prior=all.get(k);
 if(prior&&JSON.stringify(prior)!==JSON.stringify(r))throw Error("Conflicting observation: "+k);
 all.set(k,r);
}
const sorted=[...all.values()].sort((a,b)=>a.observedAt.localeCompare(b.observedAt)||a.repository.localeCompare(b.repository));
const temp=join(dirname(destination),".history-"+randomUUID()+".tmp");
try{writeFileSync(temp,JSON.stringify(sorted,null,2)+"\n",{flag:"wx"});renameSync(temp,destination);}finally{try{unlinkSync(temp);}catch{}}
console.log(JSON.stringify({snapshots:sorted.length,added:sorted.length-previous.length}));
