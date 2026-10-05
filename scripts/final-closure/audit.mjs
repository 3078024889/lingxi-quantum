import fs from "node:fs";import path from "node:path";
const root=process.cwd(),dirs=["app","components","lib"],exts=new Set([".ts",".tsx",".js",".jsx",".mjs",".cjs",".md",".json"]),legacy=/潜意识重塑|场域精测|意识显化|一念显化|生命图谱/g;
let files=[],legacyHits=[];
function walk(d){if(!fs.existsSync(d))return;for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(exts.has(path.extname(e.name)))files.push(f)}}
for(const d of dirs)walk(path.join(root,d));
for(const f of files){const s=fs.readFileSync(f,"utf8"),rel=path.relative(root,f);let m;legacy.lastIndex=0;while((m=legacy.exec(s)))legacyHits.push({file:rel,text:m[0]})}
// Keep committed evidence deterministic. A source audit must not dirty the worktree merely because time moved forward.
const report={source_files_scanned:files.length,legacy_public_copy_hits:legacyHits};
const dir=path.join(root,"reports","final-closure");fs.mkdirSync(dir,{recursive:true});const out=path.join(dir,"LINGXIFIELD_FINAL_CLOSURE_AUDIT.json");
const next=JSON.stringify(report,null,2)+"\n";
const prev=fs.existsSync(out)?fs.readFileSync(out,"utf8"):"";
if(prev!==next)fs.writeFileSync(out,next);
console.log("FINAL_AUDIT_SOURCE_FILES="+files.length);
console.log("FINAL_AUDIT_LEGACY_HITS="+legacyHits.length);
if(legacyHits.length){console.error("FINAL_AUDIT_REPORT=FAIL");process.exit(1)}
console.log("FINAL_AUDIT_REPORT=PASS");
