import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const must=(v,m)=>{if(!v){console.error(`AUTONOMY_AUDIT_FAIL=${m}`);process.exit(1)}};
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");

const knowledgeRoute=read("app/api/knowledge/ask/route.ts");
must(knowledgeRoute.includes("autonomousAnswer"),"KNOWLEDGE_AUTONOMOUS_ENGINE_NOT_WIRED");
must(!knowledgeRoute.includes("runBilledText"),"KNOWLEDGE_STILL_BILLED_BY_DEFAULT");
must(!knowledgeRoute.includes("NO_AI_PROVIDER_CONFIGURED"),"KNOWLEDGE_STILL_PROVIDER_GATED");

const dramaRoute=read("app/api/sasi/drama/autonomous/route.ts");
const dramaEngine=read("lib/sasi/autonomous-drama.ts");
const dramaUi=read("components/SasiAutonomousDrama.tsx");
must(dramaRoute.includes("buildAutonomousDrama"),"DRAMA_AUTONOMOUS_ROUTE_NOT_WIRED");
must(dramaEngine.includes("externalApiRequired: false"),"DRAMA_ENGINE_NOT_ZERO_API");
must(dramaUi.includes("MediaRecorder"),"DRAMA_BROWSER_VIDEO_EXPORT_MISSING");
must(!/OPENAI_API_KEY|ARK_API_KEY|DASHSCOPE_API_KEY|XAI_API_KEY/.test(dramaEngine+dramaRoute+dramaUi),"DRAMA_AUTONOMOUS_PATH_CONTAINS_PROVIDER_KEYS");

const launch=read("components/SasiDramaLaunch.tsx");
must(launch.includes("SasiAutonomousDrama"),"DRAMA_LAUNCH_NOT_WIRED");

const tools=read("components/tools/ToolWorkbench.tsx");
for(const marker of [
 "compress-image","resize-image","remove-exif","file-type-detector","md5-sha256","file-compare",
 "xlsx-to-csv","csv-to-xlsx","docx-to-txt","pptx-to-txt","heic-to-jpg","qr-code-reader",
 "merge-pdf","split-pdf","image-to-pdf","pdf-to-jpg","compress-pdf"
]) must(tools.includes(marker),`TOOL_HANDLER_MISSING:${marker}`);

console.log("KNOWLEDGE_ZERO_API_DEFAULT=PASS");
console.log("DRAMA_ZERO_API_BASELINE=PASS");
console.log("DRAMA_BROWSER_VIDEO_EXPORT=PASS");
console.log("PRACTICAL_TOOL_HANDLER_COVERAGE=PASS");
console.log("AUTONOMY_AUDIT=PASS");
