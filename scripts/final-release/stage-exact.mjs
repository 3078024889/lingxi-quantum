import{execFileSync}from"node:child_process";import fs from"node:fs";
const out=execFileSync("git",["status","--porcelain"],{encoding:"utf8"});
const lines=out.split(/\r?\n/).filter(Boolean);
const allowed=/^(?:app\/tools\/|app\/api\/tools\/|app\/api\/sasi\/|components\/tools\/|components\/SasiSkillsPanel\.tsx|lib\/tools\/|lib\/pricing\/|lib\/payments\/currency-book\.ts|lib\/sasi\/|lib\/sasi-kernel\/|supabase\/migrations\/20260929|scripts\/final-release\/|audit-reports\/final-production-readiness\.json)/;
const deny=/(?:docs\/research|imports\/tongshi|hourly-tick|CONSUME-HEARTBEAT|\.pnpm-store|node_modules|\.next)/;
let add=[],preserve=[];
for(const line of lines){const raw=line.slice(3).replace(/^"|"$/g,"");const p=raw.includes(" -> ")?raw.split(" -> ").pop():raw;(allowed.test(p)&&!deny.test(p)?add:preserve).push(p)}
fs.mkdirSync("audit-reports",{recursive:true});fs.writeFileSync("audit-reports/final-release-stage.txt",add.join("\n")+"\n");
console.log("FINAL_RELEASE_STAGE_FILES="+add.length);console.log("UNRELATED_PRESERVED="+preserve.length);
for(const p of preserve.slice(0,100))console.log("PRESERVED="+p);
if(!add.length)throw new Error("NO_RELEASE_CHANGES_TO_STAGE");
execFileSync("git",["add","--",...add],{stdio:"inherit"});
const staged=execFileSync("git",["diff","--cached","--name-only"],{encoding:"utf8"}).trim().split(/\r?\n/).filter(Boolean);
const bad=staged.filter(p=>deny.test(p)||!allowed.test(p));
if(bad.length){console.error("UNSAFE_STAGED="+bad.join(","));process.exit(3)}
console.log("GIT_ADD_DOT_USED=NO");console.log("EXACT_RELEASE_STAGE=PASS");
