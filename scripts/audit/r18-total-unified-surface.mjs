import fs from"node:fs";

const paths=[
 "components/SasiOneSurface.tsx",
 "components/SasiModeHost.tsx",
 "components/SasiUnifiedLauncher.tsx",
 "components/SasiFunctionMenu.tsx",
 "components/SasiChatCreationStudio.tsx",
 "components/KnowledgeWorkspace.tsx"
];
const source=Object.fromEntries(paths.map(p=>[p,fs.readFileSync(p,"utf8")]));
const one=source["components/SasiOneSurface.tsx"];
const host=source["components/SasiModeHost.tsx"];
const launch=source["components/SasiUnifiedLauncher.tsx"];
const menu=source["components/SasiFunctionMenu.tsx"];
const creation=source["components/SasiChatCreationStudio.tsx"];
const knowledge=source["components/KnowledgeWorkspace.tsx"];

for(const token of["MODES","modeBar","sasiModeLabel"]){
 if(one.includes(token)||host.includes(token))throw new Error("R18R2_VISIBLE_MODE_SYSTEM_REMAINS:"+token);
}
if(fs.existsSync("components/SasiStartGuide.tsx"))throw new Error("R18R2_START_GUIDE_FILE_REMAINS");

const forbiddenLiteralPatterns=[
 ["OpenRouter",/["'`>]\s*OpenRouter\b/i],
 ["Volcengine",/["'`>]\s*Volcengine\b/i],
 ["Gemini API",/["'`>]\s*Gemini API\b/i],
 ["API Key",/["'`>]\s*API Key\b/i],
 ["Provider",/["'`>]\s*Provider(?:\s|<|["'`])/i],
 ["runId",/["'`>]\s*runId(?:\s|<|["'`])/i],
 ["queue",/["'`>]\s*queue(?:\s|<|["'`])/i],
 ["lease",/["'`>]\s*lease(?:\s|<|["'`])/i],
 ["workflow",/["'`>]\s*workflow(?:\s|<|["'`])/i]
];
const frontDoor=one+"\n"+host+"\n"+launch;
for(const [name,rx] of forbiddenLiteralPatterns){
 if(rx.test(frontDoor))throw new Error("R18R2_ENGINEERING_VISIBLE_LITERAL:"+name);
}

if(!launch.includes("SASI_UNIFIED_ACCEPT")||!launch.includes("File[]"))
 throw new Error("R18R2_FRONT_DOOR_ATTACHMENTS_MISSING");
if(!one.includes("initialFiles={initialFiles}")||!host.includes("initialFiles={initialFiles}"))
 throw new Error("R18R2_ATTACHMENT_HANDOFF_MISSING");
if(!creation.includes("SASI_INTAKE_LIMITS.maxFiles")||!knowledge.includes("initialFilesImportedRef"))
 throw new Error("R18R2_SPECIALIST_ATTACHMENT_SEED_MISSING");
if(!menu.includes("extraContent?:ReactNode")||!creation.includes('extraContent={mode==="drama"'))
 throw new Error("R18R2_CREATION_SETTINGS_NOT_IN_PLUS");
if(knowledge.match(/<select value=\{intelligence\}/))
 throw new Error("R18R2_KNOWLEDGE_DEPTH_STILL_VISIBLE");
if(creation.includes("{modeBar}")||knowledge.includes("{modeBar}"))
 throw new Error("R18R2_MODEBAR_RENDER_REMAINS");

console.log("R18R2_ONE_SASI_FRONT_DOOR=PASS");
console.log("R18R2_ENGINEERING_COPY_LITERAL_GUARD=PASS");
console.log("R18R2_FIVE_VISIBLE_ENTRIES_REMOVED=PASS");
console.log("R18R2_FILES_ENTER_THROUGH_SAME_COMPOSER=PASS");
console.log("R18R2_CREATION_SETTINGS_INSIDE_PLUS=PASS");
console.log("R18R2_KNOWLEDGE_DEPTH_INSIDE_PLUS=PASS");
console.log("R18R2_SPECIALIST_ENGINES_INTERNAL_ONLY=PASS");
