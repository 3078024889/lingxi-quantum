#!/usr/bin/env node
/** Local-only moderation queue. Never exposes submissions or contact details via HTTP. */
import {readFileSync,writeFileSync,renameSync,unlinkSync,existsSync} from "node:fs";
import {resolve,dirname,join} from "node:path";
import {randomUUID} from "node:crypto";
const input=process.argv[2];
const output=process.argv[3];
if(!input||!output||resolve(input)===resolve(output)||existsSync(resolve(output)))throw Error("Usage: node scripts/ai-discovery/review-queue.mjs INPUT.json OUTPUT.json (distinct paths)");
const source=JSON.parse(readFileSync(resolve(input),"utf8"));
if(!Array.isArray(source)||source.length>1000)throw Error("Invalid review batch");
const allowed=new Set(["pending","approved","rejected"]);
const ids=new Set();
const results=[];
for(const record of source){
 if(!record||typeof record!=="object"||typeof record.id!=="string"||!/^[-a-zA-Z0-9_]{1,80}$/.test(record.id)||ids.has(record.id))throw Error("Invalid or duplicate id");
 ids.add(record.id);
 if(!allowed.has(record.status))throw Error("Invalid review status");
 if(typeof record.name!=="string"||record.name.trim().length<2||record.name.length>160)throw Error("Invalid name");
 if(typeof record.official_url!=="string")throw Error("Missing official URL");
 let url;try{url=new URL(record.official_url);}catch{throw Error("Invalid official URL");}
 const host=url.hostname.toLowerCase();
 const ip4=/^(\\d{1,3}\\.){3}\\d{1,3}$/.test(host);
 const blocked=host==="localhost"||host.endsWith(".localhost")||host.endsWith(".local")||host.endsWith(".internal")||host==="[::1]"||host.startsWith("[")||ip4;
 if(url.protocol!=="https:"||url.username||url.password||!url.hostname.includes(".")||/^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(url.hostname))throw Error("Unsafe official URL");
 if(record.status!=="pending"&&(!record.reviewer||!record.reviewed_at||!Number.isFinite(Date.parse(record.reviewed_at))))throw Error("Decision needs reviewer and review timestamp");
 results.push({id:record.id,name:record.name.trim(),official_url:url.toString(),status:record.status,reviewer:record.reviewer||null,reviewed_at:record.reviewed_at||null,decision_reason:typeof record.decision_reason==="string"?record.decision_reason.slice(0,500):null});
}
const path=resolve(output),tmp=join(dirname(path),".review-"+randomUUID()+".tmp");
try{writeFileSync(tmp,JSON.stringify(results,null,2)+"\n",{flag:"wx"});if(readFileSync(tmp,"utf8").length<2)throw Error("Empty output");renameSync(tmp,path);}finally{try{unlinkSync(tmp);}catch{}}
console.log(JSON.stringify({count:results.length,pending:results.filter(x=>x.status==="pending").length,approved:results.filter(x=>x.status==="approved").length,rejected:results.filter(x=>x.status==="rejected").length}));
