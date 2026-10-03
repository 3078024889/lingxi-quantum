import fs from "node:fs";
const bad=[];
const read=p=>fs.readFileSync(p,"utf8");

const one=read("components/SasiOneSurface.tsx");
const studio=read("components/SasiChatCreationStudio.tsx");
const knowledge=read("components/KnowledgeWorkspace.tsx");

if(!/const MODES:Mode\[\]=\["drama","website","book","learning","research"\]/.test(one))
 bad.push("Five modes are not represented by one simple mode list");
if(one.includes("LingxiMiniIcon"))
 bad.push("Mode selector is not text-only");
if(!one.includes("fixed bottom-2"))
 bad.push("Mode selector is not docked near bottom");

for(const x of[
 'placeholder={lang==="zh"?"问问 SASI":"Ask SASI"}',
 "sticky bottom-14",
 "SasiFunctionMenu",
 "downloadDiscussionDoc",
 "downloadDiscussionZip"
])if(!studio.includes(x))bad.push(`Studio missing ${x}`);

for(const x of[
 'placeholder={lang==="zh"?"问问 SASI":"Ask SASI"}',
 "sticky bottom-14",
 "SASI_UNIFIED_ACCEPT",
 "downloadThreadDoc",
 "downloadThreadZip",
 "连接我的智能服务",
 "连接工具"
])if(!knowledge.includes(x))bad.push(`Knowledge missing ${x}`);

for(const x of[
 "想拍什么，直接告诉 SASI",
 "加入书本与资料",
 "直接问这批资料",
 "grid gap-5 xl:grid-cols-2",
 "lx-knowledge-modebar"
]){
 const rendered=knowledge.slice(Math.max(0,knowledge.indexOf("return <section")));
 if(studio.includes(x)||rendered.includes(x))bad.push(`Old dashboard/hero UI residue: ${x}`);
}

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("V52A_R3_SINGLE_COMPOSER_VISUAL_CONTRACT=PASS");
console.log("V52A_R3_TEXT_ONLY_MODE_SWITCH=PASS");
console.log("V52A_R3_UNIFIED_PLUS_AND_EXPORT=PASS");
console.log("V52A_R3_OLD_DASHBOARD_RENDER_RESIDUE=0");
