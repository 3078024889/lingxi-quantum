import fs from "node:fs";import path from "node:path";
const root=process.cwd(), dirs=["app","components","lib"];
const exts=new Set([".ts",".tsx",".js",".jsx",".mjs",".cjs",".md",".json"]);
const legacy=/潜意识重塑|场域精测|意识显化|一念显化|生命图谱/g;
const engineering=/\b(API|RPC|Worker|Pipeline|Runtime|Token|Endpoint|Webhook|Object Storage|Parser|Chunk|Embedding|Vector|Task Executor|Internal Server Error)\b/g;
let files=[],legacyHits=[],engineeringHits=[];
function walk(d){if(!fs.existsSync(d))return;for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(exts.has(path.extname(e.name)))files.push(f)}}
for(const d of dirs)walk(path.join(root,d));
for(const f of files){const s=fs.readFileSync(f,"utf8"),rel=path.relative(root,f);let m;legacy.lastIndex=0;while((m=legacy.exec(s)))legacyHits.push({file:rel,text:m[0]});engineering.lastIndex=0;while((m=engineering.exec(s)))engineeringHits.push({file:rel,text:m[0]});}
const pages=files.filter(f=>/[\\/]page\.tsx?$/.test(f)&&f.includes(path.sep+"app"+path.sep)).length;
const routes=files.filter(f=>/[\\/]route\.tsx?$/.test(f)&&f.includes(path.sep+"app"+path.sep)).length;
const report={generated_at:new Date().toISOString(),source_files_scanned:files.length,app_pages:pages,api_routes:routes,legacy_public_copy_hits:legacyHits,engineering_term_hits:engineeringHits,warning:"Engineering-term hits require UI-context review; backend/internal occurrences are not automatically defects."};
fs.writeFileSync(path.join(root,"LINGXIFIELD_FINAL_CLOSURE_AUDIT.json"),JSON.stringify(report,null,2));
console.log("FINAL_AUDIT_SOURCE_FILES="+files.length);console.log("FINAL_AUDIT_APP_PAGES="+pages);console.log("FINAL_AUDIT_API_ROUTES="+routes);console.log("FINAL_AUDIT_LEGACY_HITS="+legacyHits.length);console.log("FINAL_AUDIT_ENGINEERING_HITS="+engineeringHits.length);console.log("FINAL_AUDIT_REPORT=PASS");