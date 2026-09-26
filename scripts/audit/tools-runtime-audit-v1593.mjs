import fs from "node:fs";import path from "node:path";
const repo=process.cwd();let fail=0;const A=(v,m)=>{console.log(`${v?"PASS":"FAIL"} ${m}`);if(!v)fail++};const R=p=>fs.readFileSync(path.join(repo,p),"utf8");
const required=[
 "lib/tools/engine/operation-map.ts","lib/tools/engine/estimates.ts","lib/tools/engine/health.ts","lib/tools/engine/checksum.ts",
 "lib/tools/engine/server/safe-path.ts","lib/tools/engine/server/adapters/sharp.ts","lib/tools/engine/server/adapters/document.ts","lib/tools/engine/server/adapters/web.ts",
 "scripts/audit/tool-graph-coverage-v1593.mjs"
];
for(const p of required)A(fs.existsSync(path.join(repo,p)),p);
const c=R("lib/tools/engine/catalog.ts");
A(c.includes('id:"sharp-libvips"')&&c.includes('runtime:"node-module"'),"sharp is node-module runtime");
A(c.includes('id:"jszip"'),"jszip cataloged");
A(c.includes('license:L["realesrgan-review"]'),"Real-ESRGAN model/data review gate");
A(c.includes('license:L["apache2-or-mpl2"]'),"DOMPurify dual-license recorded");
A(c.includes('id:"kokoro"')&&c.includes('license:L["kokoro-review"]'),"Kokoro TTS review gate");
const graph=R("lib/tools/engine/stage-graph.ts");A((graph.split('g("video-dubbing"')[1]||"").split('g("')[0].includes("text-to-speech"),"video dubbing includes real TTS stage");
const v=R("lib/tools/engine/validators.ts");
A(!v.includes("delegated:true"),"no unconditional delegated validators");
A(v.includes("VALIDATION_CONTEXT_MISSING"),"missing validator context fails closed");
const e=R("lib/tools/engine/server/executor.ts");
A(e.includes("executeRequirement"),"stage requirement executor");
A(e.includes("validatePathArgs"),"engine path boundary");
A(e.includes("ALL_ENGINES_FAILED"),"stage fallback failure explicit");
const op=R("lib/tools/engine/operation-map.ts");
for(const token of ["sharp-libvips","mammoth","exceljs","readability","dompurify","turndown","paddleocr","whispercpp","faster-whisper"])A(op.includes(token),`operation-map:${token}`);
const cmd=R("lib/tools/engine/server/command.ts");A(cmd.includes("stdin?:"),"command stdin support");A(cmd.includes('stdio:["pipe","pipe","pipe"]'),"command stdio bounded");
const argos=R("services/local-engine/python/argos_translate.py");A(argos.includes("sys.stdin.read()"),"Argos text via stdin not environment");
if(fail){console.error(`V1593_RUNTIME_AUDIT=FAIL count=${fail}`);process.exit(1)}
console.log("V1593_RUNTIME_AUDIT=PASS");
