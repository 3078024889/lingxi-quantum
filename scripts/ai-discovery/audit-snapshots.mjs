#!/usr/bin/env node
import {readFileSync} from "node:fs";
import {validateSnapshot,detectAnomalies} from "../../lib/ai-discovery/data-quality.mjs";
const current=validateSnapshot(JSON.parse(readFileSync("lib/ai-discovery/github-observations.json","utf8")));
const history=JSON.parse(readFileSync("lib/ai-discovery/github-history.json","utf8"));
if(!Array.isArray(history)||!history.length)throw Error("Missing history");
const groups=new Map();
for(const row of history){validateSnapshot([row]);const key=row.repository.toLowerCase();const group=groups.get(key)||[];group.push(row);groups.set(key,group);}
const warnings=[];
for(const r of current){
 const group=groups.get(r.repository.toLowerCase());
 if(!group?.length)throw Error("Missing history for "+r.repository);
 group.sort((a,b)=>Date.parse(a.observedAt)-Date.parse(b.observedAt));
 if(new Set(group.map(x=>x.observedAt)).size!==group.length)throw Error("Duplicate historical timestamps for "+r.repository);
 if(JSON.stringify(group.at(-1))!==JSON.stringify(r))throw Error("Latest history differs from current observation: "+r.repository);
 if(group.length>1)warnings.push(...detectAnomalies([group.at(-2)],[group.at(-1)]));
}
if(groups.size!==current.length)throw Error("History contains unknown repositories");
console.log(JSON.stringify({status:warnings.length?"review_required":"ok",repositories:current.length,maxObservationsPerRepository:Math.max(...[...groups.values()].map(x=>x.length)),warnings},null,2));
if(warnings.length)process.exitCode=1;
