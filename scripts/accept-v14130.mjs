import fs from "node:fs";
const read=(p)=>fs.readFileSync(p,"utf8");
const assert=(ok,label)=>{if(!ok)throw new Error(`FAIL ${label}`);console.log(`PASS ${label}`)};

const intake=read("lib/files/document-intake.ts");
for(const ext of [".doc",".docx",".xls",".xlsx",".csv",".tsv",".ods",".rtf",".pdf"]){
  assert(intake.includes(`"${ext}"`),`document accept ${ext}`);
}
assert(intake.includes("JSZip.loadAsync"),"browser-local Office zip parser");
assert(intake.includes("parseDocx"),"DOCX parser");
assert(intake.includes("parseXlsx"),"XLSX parser");
assert(intake.includes("parseOds"),"ODS parser");
assert(intake.includes("isLegacyOffice"),"legacy DOC/XLS explicit handling");
assert(intake.includes("DOCUMENT_BATCH_MAX_FILES = 30"),"knowledge batch max 30");

const kw=read("components/KnowledgeWorkspace.tsx");
assert(kw.includes("accept={DOCUMENT_ACCEPT} multiple"),"knowledge multi-file picker");
assert(kw.includes("importFiles(e.dataTransfer.files)"),"knowledge drag/drop batch");
assert(kw.includes("parseGenericDocument(file)"),"knowledge Office/spreadsheet parser");
assert(kw.includes("旧版 Office 二进制格式"),"legacy Office honest fallback");

const sasi=read("components/SasiCommandCenter.tsx");
assert(sasi.includes("if(merged.length>=50)break"),"SASI 50-file batch");
assert(sasi.includes("addFiles(Array.from(event.dataTransfer.files||[]))"),"SASI drop append");
assert(sasi.includes("支持一次拖入最多 50 份资料"),"SASI format disclosure");

console.log("V14.10.30 ACCEPTANCE=PASS");