import fs from "node:fs";
const must=(v,m)=>{if(!v){console.error(`TOOLS_RUNTIME_AUDIT_FAIL=${m}`);process.exit(1)}};
const registry=fs.readFileSync("lib/tools/registry.ts","utf8");const workbench=fs.readFileSync("components/tools/ToolWorkbench.tsx","utf8");
const live=[...registry.matchAll(/slug:\s*"([^"]+)"[\s\S]{0,180}?status:\s*"live"/g)].map(x=>x[1]);
const textTools=["text-counter","remove-duplicate-lines","remove-empty-lines","url-encode-decode","base64-encode-decode","json-formatter","timestamp-converter","qr-code-generator"];
const fileTools=["png-to-jpg","jpg-to-png","webp-to-jpg","compress-image","compress-image-to-20kb","compress-image-to-50kb","compress-image-to-100kb","compress-image-to-200kb","compress-image-to-500kb","resize-image","remove-exif","file-type-detector","md5-sha256","file-compare","xlsx-to-csv","csv-to-xlsx","docx-to-txt","pptx-to-txt","heic-to-jpg","qr-code-reader","merge-pdf","split-pdf","compress-pdf","image-to-pdf","pdf-to-jpg"];
for(const slug of [...textTools,...fileTools])must(registry.includes(`slug: "${slug}"`)||registry.includes(`"${slug}"`),`REGISTRY_MISSING:${slug}`);
for(const slug of fileTools){if(slug.startsWith("compress-image-to-")){must(workbench.includes('tool.slug.startsWith("compress-image-to-")'),`HANDLER_MISSING:${slug}`);}else must(workbench.includes(`tool.slug === "${slug}"`)||workbench.includes(`tool.slug==="${slug}"`)||workbench.includes(`"${slug}"`),`HANDLER_MISSING:${slug}`);}
must(!/fetch\(\s*["'`]https?:\/\//.test(workbench),"LOCAL_WORKBENCH_HAS_REMOTE_FETCH");
console.log(`LIVE_REGISTRY_ENTRIES=${live.length}`);console.log("LOCAL_TOOL_HANDLER_COVERAGE=PASS");console.log("LOCAL_TOOL_REMOTE_FETCH=ABSENT");console.log("TOOLS_RUNTIME_AUDIT=PASS");
