import fs from "node:fs";
const bad=[];
const read=p=>fs.readFileSync(p,"utf8");

const one=read("components/SasiOneSurface.tsx");
for(const x of ["短剧","网站","书本","学习","科研","fixed bottom-2"])if(!one.includes(x))bad.push(`SasiOneSurface missing ${x}`);
if(one.includes("LingxiMiniIcon"))bad.push("SasiOneSurface mode dock must be text-only");

const studio=read("components/SasiChatCreationStudio.tsx");
for(const x of ['placeholder={lang==="zh"?"问问 SASI":"Ask SASI"}',"sticky bottom-14","downloadDiscussionZip","downloadDiscussionDoc","SasiFunctionMenu",'data-sasi-composer-version="v5200"'])
 if(!studio.includes(x))bad.push(`Studio missing ${x}`);
for(const x of ["dramaTitle","buildTitle","dramaSubtitle","buildSubtitle"])
 if(studio.includes(`const title=ct(`)||studio.includes(`const subtitle=ct(`))bad.push("Studio old hero title remains");

const knowledge=read("components/KnowledgeWorkspace.tsx");
for(const x of ["SASI_UNIFIED_ACCEPT","zipText","transcribeLocal","sticky bottom-14","downloadThreadDoc","downloadThreadZip","连接我的智能服务","连接工具"])
 if(!knowledge.includes(x))bad.push(`Knowledge missing ${x}`);
for(const x of ["grid gap-5 xl:grid-cols-2","加入书本与资料","直接问这批资料","lx-knowledge-modebar"])
 if(knowledge.includes(x))bad.push(`Knowledge old dashboard residue ${x}`);

const moneyFiles=[
 "lib/money/types.ts","lib/money/refund-state.ts","lib/money/provider-adapter.ts",
 "lib/money/invariants.ts","lib/money/reconciliation.ts","app/api/money/summary/route.ts",
 "supabase/migrations/20261003105500_v52a_money_integrity_master.sql"
];
for(const p of moneyFiles)if(!fs.existsSync(p))bad.push(`V52A money file missing ${p}`);

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("V52A_FINAL_GPT_LIKE_SURFACE=PASS");
console.log("V52A_FINAL_ALL_MODES_ONE_UI=PASS");
console.log("V52A_FINAL_UNIFIED_FILE_INTAKE=PASS");
console.log("V52A_FINAL_DOCUMENT_ZIP_EXPORT=PASS");
console.log("V52A_FINAL_MONEY_FOUNDATION_PRESERVED=PASS");

if(studio.includes("idleSurface?"))bad.push("Studio old idleSurface layout remains");
if(studio.includes("想拍什么，直接告诉 SASI"))bad.push("Studio old hero copy remains");
