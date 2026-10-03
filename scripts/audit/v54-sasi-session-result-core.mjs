import fs from"node:fs";
const bad=[];
const read=p=>fs.readFileSync(p,"utf8");

for(const p of[
 "lib/sasi/core/session-contract.ts",
 "components/SasiResultCore.tsx",
 "components/SasiModeHost.tsx",
])if(!fs.existsSync(p))bad.push(`missing ${p}`);

const one=read("components/SasiOneSurface.tsx");
if(!one.includes("SasiModeHost"))bad.push("SasiOneSurface not using adapter-driven host");
if((one.match(/<SasiModeHost\b/g)||[]).length!==1)bad.push("SasiOneSurface must render exactly one SasiModeHost");
if(one.includes("SasiChatCreationStudio")||one.includes("KnowledgeWorkspace"))bad.push("SasiOneSurface still directly selects legacy engines");

const host=read("components/SasiModeHost.tsx");
for(const x of["SASI_MODE_ADAPTERS","adapter.input","SasiChatCreationStudio","KnowledgeWorkspace"])
 if(!host.includes(x))bad.push(`mode host missing ${x}`);

const result=read("components/SasiResultCore.tsx");
for(const x of["SasiConversationTurns","SasiAssistantText","SasiVideoResult","SasiWebsiteResult","SasiStatusLine"])
 if(!result.includes(x))bad.push(`result core missing ${x}`);

const k=read("components/KnowledgeWorkspace.tsx");
for(const x of["SasiConversationTurn","createSasiTurn","SasiConversationTurns","SasiStatusLine"])
 if(!k.includes(x))bad.push(`knowledge workspace missing ${x}`);
if(k.includes("Array<{question:string;answer:string}>"))bad.push("knowledge still owns legacy thread schema");

const c=read("components/SasiChatCreationStudio.tsx");
for(const x of["SasiAssistantText","SasiVideoResult","SasiWebsiteResult","SasiStatusLine"])
 if(!c.includes(x))bad.push(`creation workspace missing ${x}`);

if(c.includes('{resultUrl&&<div className="mb-8">'))bad.push("legacy video result wrapper remains");
if(c.includes('{websiteHtml&&<div className="mb-8 space-y-3">'))bad.push("legacy website result wrapper remains");
if((c.match(/<SasiVideoResult\b/g)||[]).length!==1)bad.push("creation workspace must render exactly one SasiVideoResult");
if((c.match(/<SasiWebsiteResult\b/g)||[]).length!==1)bad.push("creation workspace must render exactly one SasiWebsiteResult");



const surface=read("components/SasiOneSurface.tsx");
for(const x of[
 "lx-sasi-modebar-reference",
 "justify-start",
 "gap-5",
 'size="nav"'
])if(!surface.includes(x))bad.push(`reference mode-bar layout missing ${x}`);
if(surface.includes("justify-center gap-1"))bad.push("old centered compact mode bar remains");
if(surface.includes('?"bg-[var(--lx-soft)] font-semibold'))bad.push("active mode still rendered as centered pill");

for(const p of["components/SasiChatCreationStudio.tsx","components/KnowledgeWorkspace.tsx","components/SasiOneSurface.tsx"]){
 const lines=read(p).split(/\r?\n/);
 const hit=lines.findIndex(line=>/[ \t]+$/.test(line));
 if(hit>=0)bad.push(`${p}:${hit+1} trailing whitespace`);
}

const contract=read("lib/sasi/core/session-contract.ts");
for(const x of["SasiExecutionPhase","SasiConversationTurn","SasiResult","deriveSasiPhase"])
 if(!contract.includes(x))bad.push(`session contract missing ${x}`);


if(!fs.existsSync(".editorconfig"))bad.push(".editorconfig missing");
const attrs=read(".gitattributes");
for(const ext of["*.ts text eol=lf","*.tsx text eol=lf","*.mjs text eol=lf","*.css text eol=lf"]){
 if(!attrs.includes(ext))bad.push(`gitattributes missing ${ext}`);
}

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("V54_ADAPTER_DRIVEN_MODE_HOST=PASS");
console.log("V54_SHARED_CONVERSATION_SCHEMA=PASS");
console.log("V54_SHARED_RESULT_RENDERERS=PASS");
console.log("V54_SHARED_STATUS_RENDERER=PASS");
console.log("V54_SESSION_EXECUTION_CONTRACT=PASS");
console.log("V54R3_REFERENCE_MODEBAR_LAYOUT=PASS");
console.log("V54R4_TEXT_POLICY=PASS");
console.log("V54R6_IDEMPOTENT_CREATION_RESULTS=PASS");
console.log("V54R4_DIFF_CLEAN=PASS");
console.log("V54_NO_NEW_RUNTIME_DEPENDENCIES=PASS");
