#!/usr/bin/env node
import {readFileSync} from "node:fs";
import {validateSnapshot,detectAnomalies} from "../../lib/ai-discovery/data-quality.mjs";
const current=validateSnapshot(JSON.parse(readFileSync("lib/ai-discovery/github-observations.json","utf8")));
const history=JSON.parse(readFileSync("lib/ai-discovery/github-history.json","utf8"));
if(!Array.isArray(history)||!history.length)throw Error("Missing history");
const groups=new Map();
for(const row of history){const group=groups.get(row.observedAt)||[];group.push(row);groups.set(row.observedAt,group);}
for(const group of groups.values())validateSnapshot(group);
const times=[...groups.keys()].sort();
const warnings=times.length>1?detectAnomalies(groups.get(times[times.length-2]),current):[];
const currentSet=new Set(current.map(r=>r.repository.toLowerCase()));
const latestSet=new Set(groups.get(times.at(-1)).map(r=>r.repository.toLowerCase()));
if(currentSet.size!==latestSet.size||[...currentSet].some(k=>!latestSet.has(k)))throw Error("Latest history differs from current registry");
for(const r of current){const match=groups.get(times.at(-1)).find(h=>h.repository.toLowerCase()===r.repository.toLowerCase());if(JSON.stringify(r)!==JSON.stringify(match))throw Error("Latest history differs from current observation: "+r.repository);}
console.log(JSON.stringify({status:warnings.length?"review_required":"ok",repositories:current.length,snapshots:times.length,warnings},null,2));
if(warnings.length)process.exitCode=1;
