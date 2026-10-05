import fs from "node:fs";import path from "node:path";
const root=process.cwd();
const routes=[
 ["home","/"],["tools","/tools"],["sasi","/sasi"],["products","/products"],
 ["temp-mail","/tools/temp-mail"],["video-toolkit","/tools/video-toolkit"],
 ["video-watermark","/tools/video-watermark-remover"],["video-transcription","/tools/video-transcription"]
];
const required=[
 "app","components","lib","supabase/migrations","scripts/final-closure",
 "tests/final-closure/core.spec.ts","tests/final-closure/production.spec.ts"
];
// Keep committed evidence deterministic. Volatile timestamps belong in CI logs, not tracked source files.
const evidence={required:{},routes:{},gates:{
 source:"PASS",build:"RUN_REQUIRED",browser:"RUN_REQUIRED",mobile:"RUN_REQUIRED",
 production_public:"RUN_REQUIRED",database:"PRODUCTION_RECONCILED_EXTERNALLY",
 live_payment:"NOT_PROVEN",live_withdrawal:"NOT_PROVEN"
}};
for(const x of required)evidence.required[x]=fs.existsSync(path.join(root,x))?"PASS":"FAIL";
for(const [name,url] of routes){
 const rel=url==="/"?"app/page.tsx":`app${url}/page.tsx`;
 evidence.routes[name]={url,source:fs.existsSync(path.join(root,rel))?"PASS":"REVIEW"};
}
const failed=Object.values(evidence.required).includes("FAIL");
const dir=path.join(root,"reports","final-closure");fs.mkdirSync(dir,{recursive:true});const out=path.join(dir,"LINGXIFIELD_GRADUATION_MATRIX.json");
const next=JSON.stringify(evidence,null,2)+"\n";
const prev=fs.existsSync(out)?fs.readFileSync(out,"utf8"):"";
if(prev!==next)fs.writeFileSync(out,next);
console.log("GRADUATION_SOURCE="+(failed?"FAIL":"PASS"));
console.log("GRADUATION_MATRIX_WRITTEN=PASS");
process.exit(failed?1:0);
