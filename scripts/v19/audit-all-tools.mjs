import fs from"node:fs";import path from"node:path";
const roots=["app/tools","components/tools"];const exts=new Set([".ts",".tsx",".js",".jsx"]);
let files=[];function walk(p){if(!fs.existsSync(p))return;for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())walk(f);else if(exts.has(path.extname(f)))files.push(f)}}roots.forEach(walk);
const findings=[];
const rules=[
 ["fake_timer",/setTimeout\s*\(/],
 ["fake_progress",/(mockProgress|fakeProgress|simulateProgress|模拟进度)/i],
 ["engineering_ui",/(启动 OCR Pipeline|Object Storage|Task Executor|Job Failed|Internal Server Error)/i],
 ["hardcoded_light",/(?:className|style)[^\n]{0,200}(?:bg-white|text-black|bg-black|text-white)/i],
];
for(const f of files){const s=fs.readFileSync(f,"utf8");for(const[r,re]of rules)if(re.test(s))findings.push({rule:r,file:f})}
const pages=[];if(fs.existsSync("app/tools"))for(const e of fs.readdirSync("app/tools",{withFileTypes:true}))if(e.isDirectory()&&fs.existsSync(path.join("app/tools",e.name,"page.tsx")))pages.push(e.name);
const reg=fs.readFileSync("lib/tools/experience-registry.ts","utf8");const uncovered=pages.filter(x=>!["admin","pay","[slug]"].includes(x)&&!reg.includes(`"${x}":`));
fs.mkdirSync("audit-reports",{recursive:true});fs.writeFileSync("audit-reports/all-tools-v19.json",JSON.stringify({pages:pages.length,scanned:files.length,uncovered,findings},null,2));
console.log("TOOL_PAGES_DISCOVERED="+pages.length);console.log("TOOL_EXPERIENCE_UNCOVERED="+uncovered.length);console.log("UX_RISK_FINDINGS="+findings.length);
for(const x of uncovered)console.log("UNCOVERED="+x);for(const x of findings.slice(0,120))console.log(`RISK=${x.rule}|${x.file}`);
if(uncovered.length)process.exit(3);
console.log("ALL_EXPLICIT_TOOLS_EXPERIENCE_REGISTERED=PASS");
console.log("V19_AUDIT_REPORT=audit-reports/all-tools-v19.json");
