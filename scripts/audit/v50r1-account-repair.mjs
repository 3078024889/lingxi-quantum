import fs from "node:fs";

const account=fs.readFileSync("app/account/page.tsx","utf8");
const bad=[];
if(/\bhh=/.test(account)) bad.push("app/account/page.tsx contains hh= instead of zh=");
for(const phrase of ["hurück","Repreneh","empehaste"," hu müssen","创作余额","Creation Balance","AI余额"]){
  if(account.includes(phrase)) bad.push(`account copy residue: ${phrase}`);
}
if(!account.includes('zh="余额"')) bad.push("generic balance label missing");
if(!fs.existsSync("components/SasiOneSurface.tsx")) bad.push("V50 one-surface component missing");
if(!fs.readFileSync("components/SasiOneSurface.tsx","utf8").includes('id:"website"')) bad.push("website mode missing");
if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("V50R1_ACCOUNT_COPY_REPAIR=PASS");
console.log("V50R1_ONE_SURFACE_PRESERVED=PASS");
