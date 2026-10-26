#!/usr/bin/env node
/** Offline editorial staging tool: never fetches, approves or publishes automatically. */
import {readFileSync,writeFileSync,existsSync} from "node:fs";
import {resolve} from "node:path";
const [,,sourceArg,outputArg]=process.argv;
if(!sourceArg||!outputArg){console.error("Usage: node scripts/ai-discovery/review-evidence.mjs candidates.json reviewed-output.json");process.exit(2);}
const input=resolve(sourceArg),output=resolve(outputArg);
if(input===output){console.error("Refusing to overwrite source");process.exit(2);}
const data=JSON.parse(readFileSync(input,"utf8"));
if(!Array.isArray(data)||data.length>1000)throw Error("Expected up to 1000 candidate records");
const allowed=new Set(["website_visits","app_downloads","monthly_active_users","benchmark_score","user_rating"]);
const safeUrl=s=>{try{const u=new URL(s);return u.protocol==="https:"&&!u.username&&!u.password&&u.hostname.includes(".")&&!/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(u.hostname);}catch{return false;}};
const date=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s));
const results=data.map((r,i)=>{const errors=[];
 if(!r||typeof r!=="object"||Array.isArray(r))return {index:i,errors:["Not an object"]};
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.toolSlug||""))errors.push("Invalid slug");
 if(!allowed.has(r.metricKey))errors.push("Invalid metric");
 if(typeof r.value!=="number"||!Number.isFinite(r.value)||r.value<0)errors.push("Invalid value");
 for(const key of ["unit","geography","sourceName"]){if(typeof r[key]!=="string"||!r[key].trim()||r[key].length>160)errors.push("Invalid "+key);}
 if(!date(r.periodStart)||!date(r.periodEnd)||r.periodStart>r.periodEnd)errors.push("Invalid period");
 if(!safeUrl(r.sourceUrl))errors.push("Invalid HTTPS source");
 if(!["official","third_party","estimate"].includes(r.kind))errors.push("Invalid kind");
 if(!Number.isFinite(Date.parse(r.observedAt)))errors.push("Invalid observation time");
 // Human sign-off must already be present; this script cannot manufacture approval.
 if(r.status!=="approved"||r.sourceChecked!==true||typeof r.reviewer!=="string"||!r.reviewer.trim()||!Number.isFinite(Date.parse(r.reviewedAt)))errors.push("Human review incomplete");
 return {index:i,errors};
});
const invalid=results.filter(r=>r.errors.length);
if(invalid.length){console.error(JSON.stringify({accepted:0,rejected:invalid},null,2));process.exit(1);}
if(existsSync(output)){console.error("Output already exists; refusing overwrite");process.exit(2);}
writeFileSync(output,JSON.stringify(data,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify({accepted:data.length,output,notice:"Source existence and claims must still be verified by a human; this script only checks structure."}));
