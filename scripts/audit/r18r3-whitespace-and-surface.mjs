import fs from"node:fs";

const files=[
 "components/SasiChatCreationStudio.tsx",
 "components/KnowledgeWorkspace.tsx",
 "components/SasiFunctionMenu.tsx",
 "components/SasiModeHost.tsx",
 "components/SasiOneSurface.tsx",
 "components/SasiUnifiedLauncher.tsx",
 "lib/sasi/core/intent-router.ts"
];

const bad=[];
for(const p of files){
 if(!fs.existsSync(p))throw new Error("R18R3_REQUIRED_FILE_MISSING:"+p);
 const lines=fs.readFileSync(p,"utf8").replace(/\r\n/g,"\n").split("\n");
 lines.forEach((line,i)=>{if(/[ \t]+$/.test(line))bad.push(`${p}:${i+1}`)});
}
if(bad.length)throw new Error("R18R3_TRAILING_WHITESPACE_REMAINS:"+bad.join(","));

const one=fs.readFileSync("components/SasiOneSurface.tsx","utf8");
const launch=fs.readFileSync("components/SasiUnifiedLauncher.tsx","utf8");
const creation=fs.readFileSync("components/SasiChatCreationStudio.tsx","utf8");
const knowledge=fs.readFileSync("components/KnowledgeWorkspace.tsx","utf8");

if(!one.includes("SasiUnifiedLauncher"))throw new Error("R18R3_UNIFIED_FRONT_DOOR_MISSING");
if(!launch.includes("SASI_UNIFIED_ACCEPT"))throw new Error("R18R3_ATTACHMENTS_MISSING");
if(!creation.includes('extraContent={mode==="drama"'))throw new Error("R18R3_DRAMA_SETTINGS_NOT_HIDDEN");
if(knowledge.match(/<select value=\{intelligence\}/))throw new Error("R18R3_KNOWLEDGE_DEPTH_STILL_VISIBLE");

console.log("R18R3_NO_TRAILING_WHITESPACE=PASS");
console.log("R18R3_UNIFIED_FRONT_DOOR_INTACT=PASS");
console.log("R18R3_ADVANCED_CONTROLS_STAY_IN_PLUS=PASS");
