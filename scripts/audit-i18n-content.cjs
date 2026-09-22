const fs=require("fs"),path=require("path");
const root=process.argv[2]||process.cwd();
const roots=["app","components"];
const skip=new Set(["node_modules",".next"]);
const chinese=/[\u3400-\u9fff]/;
const codeExt=/\.(tsx|ts|jsx|js)$/;
let files=0,hardcoded=0;
const rows=[];

function walk(dir){
 if(!fs.existsSync(dir)) return;
 for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
  if(skip.has(ent.name)) continue;
  const p=path.join(dir,ent.name);
  if(ent.isDirectory()) walk(p);
  else if(codeExt.test(ent.name)){
   files++;
   const rel=path.relative(root,p).replaceAll("\\","/");
   const lines=fs.readFileSync(p,"utf8").split(/\r?\n/);
   const hits=[];
   lines.forEach((line,i)=>{
     if(!chinese.test(line)) return;
     if(/^\s*\/\//.test(line)||/^\s*\*/.test(line)) return;
     if(/<Bi\s/.test(line)||/\bt\(/.test(line)||/copy\(/.test(line)) return;
     hits.push(i+1);
   });
   if(hits.length){hardcoded++; rows.push([rel,hits.length,hits.slice(0,8).join(",")]);}
  }
 }
}
roots.forEach(r=>walk(path.join(root,r)));
rows.sort((a,b)=>b[1]-a[1]);
console.log(`Scanned code files: ${files}`);
console.log(`Files with likely hard-coded Chinese UI: ${hardcoded}`);
console.log("Top candidates:");
rows.slice(0,80).forEach(([r,n,l])=>console.log(`${String(n).padStart(4)}  ${r}  lines:${l}`));
if(hardcoded) process.exitCode=2;
