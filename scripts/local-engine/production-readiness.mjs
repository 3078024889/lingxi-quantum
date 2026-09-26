import fs from "node:fs";import path from "node:path";import {spawnSync} from "node:child_process";import {createRequire} from "node:module";
const repo=process.cwd(),require=createRequire(import.meta.url);let fail=0,warn=0;
const ok=(v,m,soft=false)=>{console.log(`${v?"PASS":soft?"WARN":"FAIL"} ${m}`);if(!v)(soft?warn++:fail++)};
for(const p of [
 "lib/tools/engine/catalog.ts","lib/tools/engine/stage-graph.ts","lib/tools/engine/router.ts",
 "lib/tools/engine/server/probe.ts","lib/tools/engine/server/executor.ts","lib/tools/engine/server/adapter-registry.ts",
 "lib/tools/engine/validators.ts","lib/tools/engine/operation-map.ts","lib/tools/engine/estimates.ts","lib/tools/engine/health.ts"
])ok(fs.existsSync(path.join(repo,p)),p);
const pkg=JSON.parse(fs.readFileSync(path.join(repo,"package.json"),"utf8"));
for(const s of ["engine:probe","engine:license","engine:graphs","engine:ready","audit:tools:v1593","audit:tools:coverage"])ok(Boolean(pkg.scripts?.[s]),`script:${s}`);
for(const mod of ["sharp","mammoth","exceljs","@mozilla/readability","jsdom","dompurify","turndown"]){
 try{require.resolve(mod,{paths:[repo]});ok(true,`node:${mod}`,true)}catch{ok(false,`node:${mod}`,true)}
}
const py=process.env.LINGXI_PYTHON_BIN||"python";const pyr=spawnSync(py,["--version"],{encoding:"utf8",shell:process.platform==="win32"});ok((pyr.status??1)===0,"runtime:python",true);
for(const env of ["LINGXI_QPDF_BIN","LINGXI_PDFCPU_BIN","LINGXI_FFMPEG_BIN","LINGXI_WHISPER_BIN","LINGXI_WHISPER_MODEL","LINGXI_OPENCC_BIN","LINGXI_EXIFTOOL_BIN","LINGXI_GOTENBERG_URL"])ok(Boolean(process.env[env]),`env:${env}`,true);
console.log(`RUNTIME_READINESS_FAIL=${fail}`);console.log(`RUNTIME_READINESS_WARN=${warn}`);if(fail)process.exit(1);console.log("V1593_PRODUCTION_READINESS=PASS");
