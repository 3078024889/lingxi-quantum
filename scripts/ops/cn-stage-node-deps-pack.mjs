#!/usr/bin/env node
// Restore the small, explicitly allowlisted Node server-engine package closure.
// Operates only on CI-produced standalone output; no npm install, network or secrets.
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
const repo=process.cwd(),sourceModules=path.join(repo,"node_modules");
const standalone=path.join(repo,".next","standalone");
const targetModules=path.join(standalone,"node_modules");
const roots=["mammoth","exceljs","@mozilla/readability","dompurify","turndown"];
if(!fs.existsSync(path.join(standalone,"server.js")))throw Error("STANDALONE_SERVER_MISSING");
if(!fs.existsSync(sourceModules))throw Error("SOURCE_NODE_MODULES_MISSING");
const visited=new Set();let count=0,bytes=0;
const within=(p,base)=>p===base||p.startsWith(base+path.sep);
function copyDir(from,to){
 const stack=[[from,to]];
 while(stack.length){
  const [src,dst]=stack.pop(),st=fs.lstatSync(src);
  if(st.isSymbolicLink())continue;
  if(st.isDirectory()){
   fs.mkdirSync(dst,{recursive:true});
   for(const file of fs.readdirSync(src)){
    if(file==="node_modules")continue;
    stack.push([path.join(src,file),path.join(dst,file)]);
   }
  }else if(st.isFile()){
   count++;bytes+=st.size;
   if(count>40000||bytes>250*1024*1024)throw Error("DEPENDENCY_SIZE_BUDGET_EXCEEDED");
   fs.copyFileSync(src,dst);
  }
 }
}
function packageVirtualRoot(realPkg){
 const marker=path.sep+"node_modules"+path.sep+".pnpm"+path.sep;
 const ix=realPkg.indexOf(marker);
 if(ix<0)return null;
 const after=realPkg.slice(ix+marker.length);
 const match=/^([^/]+)\/node_modules\//.exec(after);
 if(!match)return null;
 return path.join(realPkg.slice(0,ix),"node_modules",".pnpm",match[1],"node_modules");
}
function stage(link){
 if(!fs.existsSync(link))throw Error("REQUIRED_DEPENDENCY_UNRESOLVED");
 const real=fs.realpathSync(link);
 if(!within(real,sourceModules)||!within(link,sourceModules))throw Error("PACKAGE_OUTSIDE_SOURCE_TREE");
 const dstLink=path.join(targetModules,path.relative(sourceModules,link));
 const dstReal=path.join(targetModules,path.relative(sourceModules,real));
 const pnpmRoot=packageVirtualRoot(real);
 if(!visited.has(real)){
  visited.add(real);
  if(visited.size>350)throw Error("DEPENDENCY_PACKAGE_BUDGET_EXCEEDED");
  copyDir(real,dstReal);
 }
 if(link!==real){
  fs.mkdirSync(path.dirname(dstLink),{recursive:true});
  let existing=false;
  try{fs.lstatSync(dstLink);existing=true}catch{}
  if(!existing)fs.symlinkSync(path.relative(path.dirname(dstLink),dstReal),dstLink,"dir");
 }
 if(visited.has(real+"::deps"))return;
 visited.add(real+"::deps");
 const pkgFile=path.join(real,"package.json");
 if(!fs.existsSync(pkgFile))throw Error("DEPENDENCY_PACKAGE_JSON_MISSING");
 const pkg=JSON.parse(fs.readFileSync(pkgFile,"utf8"));
 for(const [names,optional] of [[Object.keys(pkg.dependencies||{}),false],[Object.keys(pkg.optionalDependencies||{}),true]]){
  for(const name of names){
   const candidates=[pnpmRoot&&path.join(pnpmRoot,name),path.join(sourceModules,name)].filter(Boolean);
   const dep=candidates.find(p=>fs.existsSync(p));
   if(!dep){if(optional)continue;throw Error("DEPENDENCY_GRAPH_MISSING:"+name)}
   stage(dep);
  }
 }
}
for(const mod of roots)stage(path.join(sourceModules,mod));
const req=createRequire(path.join(standalone,"server.js"));
for(const mod of roots){
 let resolved;
 try{resolved=req.resolve(mod)}catch{throw Error("PACKED_RUNTIME_IMPORT_MISSING:"+mod)}
 if(!within(fs.realpathSync(resolved),standalone))throw Error("PACKED_RUNTIME_IMPORT_OUTSIDE_STANDALONE:"+mod);
}
console.log("CN_STANDALONE_MODULES_PACKED="+roots.length);
console.log("CN_DEPENDENCY_GRAPH_PACKAGES="+Math.floor(visited.size/2));
console.log("CN_DEPENDENCY_GRAPH_FILES="+count);
console.log("CN_DEPENDENCY_GRAPH_MIB="+Math.ceil(bytes/(1024*1024)));
