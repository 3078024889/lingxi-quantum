#!/usr/bin/env node
/** Source: GitHub REST GET /repos/{owner}/{repo}. Only official repository metadata.
 * Manual invocation: node scripts/ai-discovery/refresh-github.mjs
 * Fails closed: no file is replaced if any request or validation fails.
 */
import {readFileSync,writeFileSync,renameSync,unlinkSync} from "node:fs";
import {resolve,dirname,join} from "node:path";
import {randomUUID} from "node:crypto";
const path=resolve("lib/ai-discovery/github-observations.json");
const previous=JSON.parse(readFileSync(path,"utf8"));
if(!Array.isArray(previous)||!previous.length)throw Error("Missing source registry");
const token=process.env.GITHUB_TOKEN||process.env.GH_TOKEN;
const wait=ms=>new Promise(done=>setTimeout(done,ms));
const collected=[];
for(const prior of previous){
 if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(prior.repository))throw Error("Unsafe repository identifier");
 const url="https://api.github.com/repos/"+prior.repository;
 const headers={Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","User-Agent":"LINGXIFIELD-AI-Discovery-Research"};
 if(token)headers.Authorization="Bearer "+token;
 let response;
 try{response=await fetch(url,{headers,signal:AbortSignal.timeout(15000),redirect:"error"});}catch(e){throw Error("GitHub fetch failed for "+prior.repository+": "+String(e));}
 if(!response.ok){const retry=response.headers.get("retry-after");throw Error("GitHub HTTP "+response.status+" for "+prior.repository+(retry?" retry-after="+retry:""));}
 const body=await response.json();
 if(body.full_name?.toLowerCase()!==prior.repository.toLowerCase()||!Number.isSafeInteger(body.stargazers_count)||body.stargazers_count<0||!Number.isSafeInteger(body.forks_count)||body.forks_count<0||typeof body.archived!=="boolean"||body.html_url!==("https://github.com/"+body.full_name))throw Error("Unexpected GitHub API response for "+prior.repository);
 collected.push({slug:prior.slug,repository:body.full_name,stars:body.stargazers_count,forks:body.forks_count,archived:body.archived,observedAt:new Date().toISOString(),sourceUrl:url,metricDefinition:"GitHub stargazers_count and forks_count; not users or downloads",sourceType:"GitHub REST API",reviewStatus:"raw_api_observation"});
 // Sequential requests reduce secondary rate-limit pressure.
 if(collected.length<previous.length)await wait(1000);
}
const tmp=join(dirname(path),".github-observations-"+randomUUID()+".tmp");
try{writeFileSync(tmp,JSON.stringify(collected,null,2)+"\n",{flag:"wx"});renameSync(tmp,path);}finally{try{unlinkSync(tmp);}catch{}}
console.log(JSON.stringify({status:"updated",count:collected.length,observedAt:collected.at(-1).observedAt}));
