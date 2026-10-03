import fs from "node:fs";
const bad=[];
const read=p=>fs.readFileSync(p,"utf8");

const studio=read("components/SasiChatCreationStudio.tsx");
for(const x of [
  'data-sasi-composer-version="v5200"',
  'placeholder={lang==="zh"?"问问 SASI":"Ask SASI"}',
  "sticky bottom-14",
  "downloadDiscussionDoc",
  "downloadDiscussionZip",
  "SasiFunctionMenu"
]){
  if(!studio.includes(x))bad.push(`Studio missing ${x}`);
}
for(const x of ["想拍什么，直接告诉 SASI","dramaTitle","buildTitle","idleSurface?"]){
  if(studio.includes(x))bad.push(`Studio old UI residue ${x}`);
}

const one=read("components/SasiOneSurface.tsx");
for(const x of ["短剧","网站","书本","学习","科研","fixed bottom-2"]){
  if(!one.includes(x))bad.push(`OneSurface missing ${x}`);
}
if(one.includes("LingxiMiniIcon"))bad.push("OneSurface mode switch must be text-only");

const kw=read("components/KnowledgeWorkspace.tsx");
for(const x of [
  "SASI_UNIFIED_ACCEPT","zipText","transcribeLocal",
  "sticky bottom-14","downloadThreadDoc","downloadThreadZip",
  'placeholder={lang==="zh"?"问问 SASI":"Ask SASI"}',
  "连接我的智能服务","连接工具"
]){
  if(!kw.includes(x))bad.push(`Knowledge missing ${x}`);
}

// Only inspect the rendered UI section for old dashboard structure.
// Dormant localization dictionaries are separately checked for known old labels below.
const returnPos=kw.indexOf("return <section");
const rendered=returnPos>=0?kw.slice(returnPos):kw;
for(const x of [
  "grid gap-5 xl:grid-cols-2",
  "lx-knowledge-modebar",
  "加入书本与资料",
  "直接问这批资料"
]){
  if(rendered.includes(x))bad.push(`Knowledge rendered dashboard residue ${x}`);
}
for(const x of ["直接问这批资料","Ask this collection directly"]){
  if(kw.includes(x))bad.push(`Knowledge stale copy residue ${x}`);
}

for(const p of [
 "lib/money/types.ts",
 "lib/money/refund-state.ts",
 "lib/money/provider-adapter.ts",
 "lib/money/invariants.ts",
 "lib/money/reconciliation.ts",
 "app/api/money/summary/route.ts",
 "supabase/migrations/20261003105500_v52a_money_integrity_master.sql"
]){
  if(!fs.existsSync(p))bad.push(`Money file missing ${p}`);
}

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("V52A_FINAL_R2_GPT_LIKE_SURFACE=PASS");
console.log("V52A_FINAL_R2_ALL_MODES_ONE_UI=PASS");
console.log("V52A_FINAL_R2_UNIFIED_FILE_INTAKE=PASS");
console.log("V52A_FINAL_R2_DOCUMENT_ZIP_EXPORT=PASS");
console.log("V52A_FINAL_R2_STALE_COPY_CLEAN=PASS");
console.log("V52A_FINAL_R2_MONEY_FOUNDATION_PRESERVED=PASS");
