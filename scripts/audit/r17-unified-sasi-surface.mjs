import fs from"node:fs";
const one=fs.readFileSync("components/SasiOneSurface.tsx","utf8");
const host=fs.readFileSync("components/SasiModeHost.tsx","utf8");
const launcher=fs.readFileSync("components/SasiUnifiedLauncher.tsx","utf8");
const creation=fs.readFileSync("components/SasiChatCreationStudio.tsx","utf8");
const knowledge=fs.readFileSync("components/KnowledgeWorkspace.tsx","utf8");

for(const forbidden of["MODES","modeBar","LingxiMiniIcon","sasiModeLabel"])
 if(one.includes(forbidden))throw new Error("R17_OLD_MODEBAR_REMAINS:"+forbidden);

if(!one.includes("SasiUnifiedLauncher"))throw new Error("R17_UNIFIED_LAUNCHER_MISSING");
if(host.includes("SasiStartGuide"))throw new Error("R17_START_GUIDE_VISIBLE");
if(fs.existsSync("components/SasiStartGuide.tsx"))throw new Error("R17_OLD_START_GUIDE_FILE_REMAINS");

for(const phrase of["OpenRouter","Volcengine","Gemini API","API Key","Provider","runId","queue","lease","workflow"])
 if(launcher.includes(phrase)||host.includes(phrase)||one.includes(phrase))
  throw new Error("R17_ENGINEERING_COPY_VISIBLE:"+phrase);

if(!creation.includes("initialPrompt?:string")||!creation.includes("useState(initialPrompt)"))
 throw new Error("R17_CREATION_SEED_MISSING");
if(!knowledge.includes("initialPrompt?:string")||!knowledge.includes("useState(initialPrompt)"))
 throw new Error("R17_KNOWLEDGE_SEED_MISSING");

console.log("R17_ONE_FRONT_DOOR=PASS");
console.log("R17_FIVE_VISIBLE_MODE_TABS_REMOVED=PASS");
console.log("R17_ENGINEERING_COPY_HIDDEN=PASS");
console.log("R17_SPECIALIST_ENGINES_PRESERVED=PASS");
console.log("R17_INITIAL_REQUEST_CARRIED_FORWARD=PASS");
