const fs=require("fs"),path=require("path");
const root=process.argv[2]||process.cwd();
const codeExt=/\.(tsx|ts|jsx|js)$/;
const chinese=/[\u3400-\u9fff]/;
const skipParts=[
 "/app/api/","/scripts/","/supabase/","/node_modules/","/.next/",
 "/app/sasi/SasiWorkspace.tsx","/app/sasi/SasiV3Panels.tsx",
 "/app/sasi/SeedanceStudio.tsx","/app/sasi/VideoAssembler.tsx"
];
const uiRoots=["app","components"];
let rows=[],scanned=0;

function walk(dir){
  if(!fs.existsSync(dir)) return;
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()) walk(p);
    else if(codeExt.test(ent.name)){
      const unix="/"+path.relative(root,p).replaceAll("\\","/");
      if(skipParts.some(x=>unix.includes(x))) continue;
      scanned++;
      const lines=fs.readFileSync(p,"utf8").split(/\r?\n/);
      const hits=[];
      lines.forEach((line,i)=>{
        if(!chinese.test(line)) return;
        const t=line.trim();
        if(t.startsWith("//")||t.startsWith("*")||t.startsWith("/*")) return;
        // Already-localized bilingual/shared-i18n content is not a Chinese-only leak.
        if(/<Bi[\s>]/.test(line)||/\bt\(/.test(line)||/\bcopy\(/.test(line)) return;
        if(/qZh:|aZh:|zh=|zh:|titleZh:|introZh:|quoteZh:|pointsZh:|practiceZh:|bodyZh:|stepZh:|labelZh:|nameZh:|descZh:|descriptionZh:/.test(line)) return;
        hits.push(i+1);
      });
      if(hits.length) rows.push([unix.slice(1),hits.length,hits.slice(0,10).join(",")]);
    }
  }
}
uiRoots.forEach(r=>walk(path.join(root,r)));
rows.sort((a,b)=>b[1]-a[1]);
console.log("LINGXIFIELD PUBLIC UI I18N AUDIT");
console.log(`Scanned public/UI code files: ${scanned}`);
console.log(`Files with likely Chinese-only visible UI: ${rows.length}`);
console.log("");
rows.slice(0,140).forEach(([r,n,l])=>console.log(`${String(n).padStart(4)}  ${r}  lines:${l}`));
console.log("");
console.log("Note: API/server prompts and retired SASI back-office panels are intentionally excluded.");
if(rows.length) process.exitCode=2;
