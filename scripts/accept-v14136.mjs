import fs from "node:fs";

const read=(p)=>fs.readFileSync(p,"utf8");
const assert=(ok,label)=>{
  if(!ok)throw new Error(`FAIL ${label}`);
  console.log(`PASS ${label}`);
};

const registry=read("lib/tools/registry.ts");
for(const slug of ["xlsx-to-csv","csv-to-xlsx","docx-to-txt"]){
  assert(registry.includes(`slug: "${slug}"`),`${slug} registered`);
}
assert(registry.includes('category: "spreadsheet"'),"spreadsheet category in use");
assert(registry.includes('maxFiles: 30'),"batch capacity exposed");

const types=read("lib/tools/types.ts");
assert(types.includes('| "spreadsheet"'),"spreadsheet category typed");

const conv=read("lib/tools/shared/office-convert.ts");
assert(conv.includes("delimitedToXlsx"),"CSV/TSV -> XLSX converter");
assert(conv.includes("xlsxToCsvFiles"),"XLSX -> CSV converter");
assert(conv.includes("docxToText"),"DOCX -> TXT converter");
assert(conv.includes("JSZip"),"browser-local archive implementation");

const wb=read("components/tools/ToolWorkbench.tsx");
assert(wb.includes('tool.slug === "xlsx-to-csv"'),"Excel tool runtime");
assert(wb.includes('tool.slug === "csv-to-xlsx"'),"CSV tool runtime");
assert(wb.includes('tool.slug === "docx-to-txt"'),"DOCX tool runtime");
assert(wb.includes("append={!!tool.multiple}"),"batch picker append mode");

console.log("V14.10.36 ACCEPTANCE=PASS");
