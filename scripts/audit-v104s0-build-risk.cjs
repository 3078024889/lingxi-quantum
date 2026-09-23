const fs=require("fs"),path=require("path");
const root=process.argv[2]||process.cwd();
const roots=["app","components","lib"];
const out=[];
function hasImported(s,name){
  const re=new RegExp("import\\s*\\{[^}]*\\b"+name+"\\b[^}]*\\}\\s*from\\s*[\"'][^\"']+[\"']");
  return re.test(s);
}
function hasLocalDecl(s,name){
  const patterns=[
    new RegExp("(?:export\\s+)?function\\s+"+name+"\\s*\\("),
    new RegExp("(?:export\\s+)?const\\s+"+name+"\\s*="),
    new RegExp("(?:export\\s+)?let\\s+"+name+"\\s*="),
  ];
  return patterns.some(re=>re.test(s));
}
function walk(dir){
  if(!fs.existsSync(dir))return;
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    if(["node_modules",".next"].includes(e.name)||e.name.startsWith(".lingxi-backup-"))continue;
    const p=path.join(dir,e.name);
    if(e.isDirectory()){walk(p);continue}
    if(!/\\.(ts|tsx|js|jsx|mjs|cjs)$/.test(e.name))continue;
    let s="";try{s=fs.readFileSync(p,"utf8")}catch{continue}
    const rel=path.relative(root,p).replaceAll("\\\\","/");
    const issues=[];
    for(const name of ["useLang","useLingxiLang"]){
      const call=new RegExp("\\b"+name+"\\s*\\(").test(s);
      if(call&&!hasImported(s,name)&&!hasLocalDecl(s,name))issues.push(name+" without import/local declaration");
    }
    if(/stellar-trace|StellarTrace|stellarIntakeChecked|灵犀场星迹|万里寻踪/.test(s))issues.push("retired Stellar Trace residual");
    if(issues.length)out.push({rel,issues});
  }
}
roots.forEach(r=>walk(path.join(root,r)));
if(out.length){
  console.error(out.map(x=>x.rel+": "+x.issues.join(", ")).join("\\n"));
  process.exit(1);
}
console.log("PASS build-risk audit: language hooks are imported or locally declared; no active Stellar Trace residuals.");
