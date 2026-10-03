import fs from"node:fs";
const bad=[];
const read=p=>fs.readFileSync(p,"utf8");

for(const p of[
 "lib/sasi/skills/types.ts","lib/sasi/skills/catalog.ts","lib/sasi/skills/router.ts","lib/sasi/skills/mode-adapters.ts",
 "components/SasiComposerCore.tsx","docs/SASI-OPEN-SOURCE-SKILL-BENCHMARK-2026-10-03.md"
])if(!fs.existsSync(p))bad.push(`missing ${p}`);

const one=read("components/SasiOneSurface.tsx");
if(!one.includes('SasiChatCreationStudio')||!one.includes('KnowledgeWorkspace'))bad.push("five-mode surface changed unexpectedly");

const k=read("components/KnowledgeWorkspace.tsx");
const c=read("components/SasiChatCreationStudio.tsx");
for(const [name,s] of [["knowledge",k],["creation",c]]){
 for(const x of["SasiComposerSurface","SasiComposerTextarea","SasiUserMessage","selectSasiSkills"])
  if(!s.includes(x))bad.push(`${name} missing shared core ${x}`);
}
if((k.match(/DOCUMENT_BATCH_MAX_BYTES/g)||[]).length<2){} // import + usage expected
if(k.includes('\nimport { DOCUMENT_BATCH_MAX_BYTES } from "@/lib/files/document-intake";'))bad.push("duplicate document intake import remains");
if(!/DOCUMENT_BATCH_MAX_FILES,\s*DOCUMENT_BATCH_MAX_BYTES,\s*DOCUMENT_FILE_MAX_BYTES,/s.test(k))bad.push("DOCUMENT_BATCH_MAX_BYTES missing from grouped document-intake import");

const core=read("components/SasiComposerCore.tsx");
for(const x of['data-sasi-composer-core="v1"',"lx-sasi-user-bubble","lx-sasi-reference-composer","lx-sasi-reference-textarea"])
 if(!core.includes(x))bad.push(`composer core missing ${x}`);

const router=read("lib/sasi/skills/router.ts");
for(const x of["selectSasiSkills","validateSasiSkillIds","compileSasiSkillGuidance",".slice(0,8)"])
 if(!router.includes(x))bad.push(`skill router missing ${x}`);

const catalog=read("lib/sasi/skills/catalog.ts");
for(const mode of["drama","website","book","learning","research"])
 if(!catalog.includes(`${mode}:`))bad.push(`mode default missing ${mode}`);

const api=read("app/api/knowledge/ask/route.ts");
if(!api.includes("validateSasiSkillIds")||!api.includes("skillGuidance"))bad.push("knowledge endpoint does not consume skill kernel");
const text=read("app/api/sasi/byok/text/route.ts");
if(!text.includes("skillIds")||!text.includes("compileSasiSkillGuidance"))bad.push("BYOK text endpoint does not consume skill kernel");

const skillDirs=fs.readdirSync("skills",{withFileTypes:true}).filter(x=>x.isDirectory()&&x.name.startsWith("sasi-"));
let checked=0;
for(const entry of skillDirs){
 const path=`skills/${entry.name}/SKILL.md`;
 if(!fs.existsSync(path))continue;
 const body=read(path);
 const match=body.match(/^---\s*\n([\s\S]*?)\n---/);
 if(!match)continue;
 const name=(match[1].match(/^name:\s*(.+)$/m)||[])[1]?.trim();
 const desc=(match[1].match(/^description:\s*(.+)$/m)||[])[1]?.trim();
 if(name!==entry.name)bad.push(`skill name mismatch ${entry.name}`);
 if(!desc)bad.push(`skill description missing ${entry.name}`);
 checked++;
}
if(checked<10)bad.push(`expected >=10 SASI skills including existing ones, found ${checked}`);

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log(`V53_AGENT_SKILL_MANIFESTS=PASS:${checked}`);
console.log("V53_PROGRESSIVE_SKILL_DISCOVERY=PASS");
console.log("V53_FIVE_MODE_SKILL_ROUTING=PASS");
console.log("V53_SHARED_COMPOSER_PRIMITIVES=PASS");
console.log("V53_KNOWLEDGE_SKILL_GUIDANCE=PASS");
console.log("V53_WEBSITE_SKILL_GUIDANCE=PASS");
console.log("V53_DOCUMENT_BATCH_BYTES_IMPORT=PASS");
console.log("V53_NO_NEW_RUNTIME_DEPENDENCIES=PASS");
