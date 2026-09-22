import fs from "node:fs";
import path from "node:path";

const root=process.argv[2]||process.cwd();
const base=(process.argv[3]||"").replace(/\/$/,"");
const skip=new Set(["node_modules",".next",".git"]);
const pages=[];

function walk(dir){
  if(!fs.existsSync(dir)) return;
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(skip.has(ent.name)||ent.name.startsWith(".lingxi-backup-")) continue;
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()) walk(p);
    else if(ent.name==="page.tsx") pages.push(p);
  }
}
walk(path.join(root,"app"));

function hasAncestorLayout(rel, token){
  let dir=path.dirname(path.join(root,rel));
  const appRoot=path.join(root,"app");
  while(dir.startsWith(appRoot)){
    const lp=path.join(dir,"layout.tsx");
    if(fs.existsSync(lp)&&fs.readFileSync(lp,"utf8").includes(token)) return true;
    if(dir===appRoot) break;
    dir=path.dirname(dir);
  }
  return false;
}
function importedComponentProvidesShell(s,token){
  const imports=[...s.matchAll(/from\s+["'](@\/components\/[^"']+)["']/g)].map(m=>m[1]);
  return imports.some(imp=>{
    const p=path.join(root,imp.replace("@/","")+".tsx");
    return fs.existsSync(p)&&fs.readFileSync(p,"utf8").includes(token);
  });
}
function redirectOnly(s){
  return /from\s+["']next\/navigation["']/.test(s) &&
         /\bredirect\s*\(/.test(s) &&
         !/<main\b|<section\b|<article\b|<div\b/.test(s);
}

const legacy=/bg-void|bg-void-deep|bg-reading-glass|text-bone|border-white\/10/;
const findings={missingNav:[],missingFooter:[],legacyDarkSource:[],legacyNames:[],oldEnglishLabels:[],redirectOnly:[]};

for(const f of pages){
  const rel=path.relative(root,f).replaceAll("\\","/");
  if(rel.includes("/api/")) continue;
  const s=fs.readFileSync(f,"utf8");
  if(redirectOnly(s)){findings.redirectOnly.push(rel);continue}
  const nav=s.includes('@/components/Nav')||hasAncestorLayout(rel,'@/components/Nav')||importedComponentProvidesShell(s,'@/components/Nav');
  const footer=s.includes('@/components/Footer')||hasAncestorLayout(rel,'@/components/Footer')||importedComponentProvidesShell(s,'@/components/Footer');
  const exempt=/\/full\/|\/result\/|\/report\//.test(rel);
  if(!nav&&!exempt) findings.missingNav.push(rel);
  if(!footer&&!exempt) findings.missingFooter.push(rel);
  if(legacy.test(s)) findings.legacyDarkSource.push(rel);
  if(/书本智能体|学习助手|科研助手/.test(s)) findings.legacyNames.push(rel);
  if(/BOOK AGENT|AI Studio|PRIVACY FIRST/.test(s)) findings.oldEnglishLabels.push(rel);
}

console.log("\n=== LINGXIFIELD V10.1 SOURCE AUDIT ===");
for(const [k,v] of Object.entries(findings)){
  console.log(`\n${k}: ${v.length}`);
  v.slice(0,120).forEach(x=>console.log("  "+x));
}
console.log("\nSource audit complete.");

if(base){
  console.log("\n=== HTTP ROUTE AUDIT ===");
  const routes=["/","/tools","/sasi","/sasi/chat","/sasi/assemble","/ai-wallet","/ai-knowledge","/ai-learning","/ai-research","/field-tests","/live-as","/subconscious","/practice","/learn","/stellar-trace","/terms","/privacy","/declaration","/refunds","/tools/image-watermark-remover","/tools/video-watermark-remover","/tools/food-calorie","/tools/video-transcription","/tools/pdf-compress","/tools/pdf-ocr"];
  for(const route of routes){
    try{
      const r=await fetch(base+route,{redirect:"manual"});
      console.log(`${String(r.status).padEnd(4)} ${route}`);
    }catch(e){console.log(`ERR  ${route} ${e?.message||e}`)}
  }
}
