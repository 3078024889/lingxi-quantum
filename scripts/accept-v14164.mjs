import fs from "node:fs";

const read=(p)=>fs.readFileSync(p,"utf8");
const assert=(ok,label)=>{if(!ok)throw new Error(`FAIL ${label}`);console.log(`PASS ${label}`)};

const intake=read("lib/files/document-intake.ts");
for(const ext of [".epub",".pptx",".json",".jsonl",".yaml",".yml",".xml",".html",".htm",".js",".jsx",".ts",".tsx",".py",".java",".c",".cpp",".go",".rs"]){
  assert(intake.includes(`"${ext}"`),`accept ${ext}`);
}
assert(intake.includes("epubToText"),"EPUB parser wired");
assert(intake.includes("pptxToKnowledgeText"),"PPTX parser wired");
assert(intake.includes("structuredTextFile"),"structured/code text wired");

const extra=read("lib/files/knowledge-extra-formats.ts");
assert(extra.includes("epubToText"),"EPUB parser implemented");
assert(extra.includes("META-INF/container.xml"),"EPUB container resolution");
assert(extra.includes("pptxToKnowledgeText"),"PPTX parser implemented");
assert(extra.includes("structuredTextFile"),"HTML/JSON/code parser implemented");

const index=read("lib/ai-knowledge/local-index.ts");
assert(index.includes('"epub"'),"EPUB knowledge kind");
assert(index.includes('"pptx"'),"PPTX knowledge kind");
assert(index.includes('"structured"'),"structured knowledge kind");

const kw=read("components/KnowledgeWorkspace.tsx");
assert(kw.includes("EPUB"),"knowledge UI mentions EPUB");
assert(kw.includes("PPTX"),"knowledge UI mentions PPTX");
assert(
  kw.includes("JSON / YAML / XML / HTML") ||
  kw.includes("JSON/YAML/XML/HTML") ||
  kw.includes("结构化文本"),
  "knowledge UI mentions structured formats"
);
assert(kw.includes("parseGenericDocument(file)"),"generic intake preserved");

const sasi=read("components/SasiCommandCenter.tsx");
assert(sasi.includes("EPUB"),"SASI format hint includes EPUB");
assert(sasi.includes("PPT/PPTX"),"SASI format hint includes PPT");

console.log("V14.10.64 ACCEPTANCE=PASS");
