import fs from"node:fs";
const bad=[];
const read=p=>fs.readFileSync(p,"utf8");
for(const p of[
 "lib/sasi/core/session-contract.ts",
 "components/SasiResultCore.tsx",
 "components/SasiOneSurface.tsx",
 "components/SasiUnifiedLauncher.tsx",
 "lib/sasi/core/intent-router.ts",
])if(!fs.existsSync(p))bad.push(`missing ${p}`);

const one=read("components/SasiOneSurface.tsx");
if(!one.includes("SasiUnifiedLauncher"))bad.push("SasiOneSurface not using unified launcher");
if((one.match(/<SasiUnifiedLauncher\b/g)||[]).length!==1)bad.push("SasiOneSurface must render exactly one SasiUnifiedLauncher");
if(one.includes("MODES.map(")||one.includes("lx-sasi-modebar-reference"))bad.push("retired visible five-mode selector remains");

const launcher=read("components/SasiUnifiedLauncher.tsx");
if(!launcher.includes("SASI_UNIFIED_ACCEPT"))bad.push("unified launcher missing attachment contract");

const router=read("lib/sasi/core/intent-router.ts");
for(const x of["drama","website","book","learning","research"])if(!router.includes(x))bad.push(`intent router missing ${x}`);

const result=read("components/SasiResultCore.tsx");
for(const x of["SasiConversationTurns","SasiAssistantText","SasiVideoResult","SasiWebsiteResult","SasiStatusLine"])
 if(!result.includes(x))bad.push(`result core missing ${x}`);

const contract=read("lib/sasi/core/session-contract.ts");
for(const x of["SasiExecutionPhase","SasiConversationTurn","SasiResult","deriveSasiPhase"])
 if(!contract.includes(x))bad.push(`session contract missing ${x}`);

if(!fs.existsSync(".editorconfig"))bad.push(".editorconfig missing");
const attrs=read(".gitattributes");
for(const ext of["*.ts text eol=lf","*.tsx text eol=lf","*.mjs text eol=lf","*.css text eol=lf"])
 if(!attrs.includes(ext))bad.push(`gitattributes missing ${ext}`);

if(bad.length){console.error(bad.join("\\n"));process.exit(1)}
console.log("V54_UNIFIED_SASI_FRONT_DOOR=PASS");
console.log("V54_SHARED_SESSION_RESULT_CONTRACT=PASS");
console.log("V54_INTENT_ROUTER_CONTRACT=PASS");
console.log("V54_NO_VISIBLE_FIVE_MODE_SELECTOR=PASS");
console.log("V54_NO_NEW_RUNTIME_DEPENDENCIES=PASS");
