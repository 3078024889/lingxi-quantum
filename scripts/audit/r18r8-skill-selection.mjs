import fs from"node:fs";
const req=[
 ["components/SasiUnifiedLauncher.tsx",["SasiSkillPicker","selectedSkills","skillIds"]],
 ["components/SasiOneSurface.tsx",["initialSkillIds"]],
 ["components/SasiModeHost.tsx",["initialSkillIds"]],
 ["components/SasiChatCreationStudio.tsx",["SasiSkillPicker","selectedSkillIds","skillIds"]],
 ["components/KnowledgeWorkspace.tsx",["SasiSkillPicker","selectedSkillIds","skillIds"]],
 ["components/SasiSkillPicker.tsx",["选择能力","sasiSkillUi"]],
 ["lib/sasi/skills/ui.ts",["USER_SELECTABLE_SKILLS","web-research","evidence-grounding","website-production"]]
];
for(const[file,tokens]of req){if(!fs.existsSync(file))throw new Error("R18R8_SKILL_FILE_MISSING:"+file);const s=fs.readFileSync(file,"utf8");for(const token of tokens)if(!s.includes(token))throw new Error(`R18R8_SKILL_CONTRACT_MISSING:${file}:${token}`)}
const k=fs.readFileSync("app/api/knowledge/ask/route.ts","utf8"),t=fs.readFileSync("app/api/sasi/byok/text/route.ts","utf8");
for(const s of[k,t])if(!s.includes("validateSasiSkillIds")||!s.includes("compileSasiSkillGuidance"))throw new Error("R18R8_SKILL_BACKEND_NOT_WIRED");
console.log("R18R8_SKILL_SELECTION_SURFACE=PASS");
console.log("R18R8_SKILL_EXECUTION_PATH=PASS");
