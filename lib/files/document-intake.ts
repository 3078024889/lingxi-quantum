"use client";

import JSZip from "jszip";
import { epubToText, pptxToKnowledgeText, structuredTextFile } from "@/lib/files/knowledge-extra-formats";

export const DOCUMENT_ACCEPT = [
  ".pdf",".txt",".md",".markdown",".rtf",
  ".doc",".docx",
  ".ppt",".pptx",".epub",
  ".csv",".tsv",".xls",".xlsx",".ods",
  ".json",".jsonl",".yaml",".yml",".xml",".html",".htm",
  ".js",".jsx",".ts",".tsx",".py",".java",".c",".cpp",".h",".hpp",".go",".rs",
  "application/pdf","text/plain","text/markdown","text/csv","text/tab-separated-values",
  "application/rtf","text/rtf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/epub+zip",
  "application/json","application/xml","text/xml","text/html",
  "application/vnd.oasis.opendocument.spreadsheet",
  "image/*",
].join(",");

export const DOCUMENT_BATCH_MAX_FILES = 30;
export const DOCUMENT_FILE_MAX_BYTES = 30 * 1024 * 1024;
export const DOCUMENT_BATCH_MAX_BYTES = 300 * 1024 * 1024;

export type ParsedDocument = {
  text:string;
  kind:"text"|"docx"|"sheet"|"rtf"|"epub"|"pptx"|"structured";
  detail?:string;
};

const decodeXml=(value:string)=>value
  .replace(/&lt;/g,"<")
  .replace(/&gt;/g,">")
  .replace(/&amp;/g,"&")
  .replace(/&quot;/g,'"')
  .replace(/&apos;/g,"'");

function ext(name:string){
  const hit=name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return hit?.[1]||"";
}

function xmlText(xml:string){
  return decodeXml(
    xml
      .replace(/<w:tab\b[^>]*\/>/g,"\t")
      .replace(/<w:br\b[^>]*\/>/g,"\n")
      .replace(/<\/w:p>/g,"\n")
      .replace(/<\/text:p>/g,"\n")
      .replace(/<[^>]+>/g,"")
  ).replace(/\u00a0/g," ").replace(/[ \t]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").trim();
}

async function parseDocx(file:File):Promise<ParsedDocument>{
  const zip=await JSZip.loadAsync(await file.arrayBuffer());
  const documentXml=await zip.file("word/document.xml")?.async("string");
  if(!documentXml)throw new Error("DOCX_DOCUMENT_XML_MISSING");
  const text=xmlText(documentXml);
  if(!text.trim())throw new Error("DOCX_NO_TEXT");
  return {text,kind:"docx",detail:"DOCX"};
}

function sharedStrings(xml:string){
  const out:string[]=[];
  for(const hit of xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)){
    const text=decodeXml(
      [...hit[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map(x=>x[1]).join("")
    );
    out.push(text);
  }
  return out;
}

async function parseXlsx(file:File):Promise<ParsedDocument>{
  const zip=await JSZip.loadAsync(await file.arrayBuffer());
  const sharedXml=await zip.file("xl/sharedStrings.xml")?.async("string");
  const shared=sharedXml?sharedStrings(sharedXml):[];

  const workbook=await zip.file("xl/workbook.xml")?.async("string");
  const rels=await zip.file("xl/_rels/workbook.xml.rels")?.async("string");
  const relation=new Map<string,string>();
  if(rels){
    for(const hit of rels.matchAll(/<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/?>/g)){
      relation.set(hit[1],hit[2].replace(/^\//,""));
    }
  }

  const sheets:Array<{name:string;rid:string}>=[];
  if(workbook){
    for(const hit of workbook.matchAll(/<sheet\b[^>]*name="([^"]+)"[^>]*(?:r:id|id)="([^"]+)"[^>]*\/?>/g)){
      sheets.push({name:decodeXml(hit[1]),rid:hit[2]});
    }
  }

  const sheetFiles=sheets.length
    ? sheets.map((sheet,index)=>({
        name:sheet.name,
        path:(relation.get(sheet.rid)||`worksheets/sheet${index+1}.xml`).replace(/^xl\//,""),
      }))
    : Object.keys(zip.files)
        .filter(name=>/^xl\/worksheets\/sheet\d+\.xml$/i.test(name))
        .sort()
        .map((path,index)=>({name:`Sheet ${index+1}`,path:path.replace(/^xl\//,"")}));

  const blocks:string[]=[];
  for(const sheet of sheetFiles){
    const xml=await zip.file(`xl/${sheet.path}`)?.async("string");
    if(!xml)continue;
    const rows:string[]=[];
    for(const rowHit of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)){
      const cells:string[]=[];
      for(const cellHit of rowHit[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)){
        const attrs=cellHit[1],body=cellHit[2];
        const ref=(attrs.match(/\br="([^"]+)"/)||[])[1]||"";
        const type=(attrs.match(/\bt="([^"]+)"/)||[])[1]||"";
        const raw=(body.match(/<v>([\s\S]*?)<\/v>/)||[])[1]??"";
        const inline=(body.match(/<is>([\s\S]*?)<\/is>/)||[])[1];
        let value="";
        if(type==="s"){
          value=shared[Number(raw)]??raw;
        }else if(type==="inlineStr"&&inline){
          value=xmlText(inline);
        }else{
          value=decodeXml(raw);
        }
        cells.push(`${ref}\t${value}`);
      }
      if(cells.length)rows.push(cells.join("\t"));
    }
    blocks.push(`# ${sheet.name}\n${rows.join("\n")}`);
  }

  const text=blocks.join("\n\n").trim();
  if(!text)throw new Error("XLSX_NO_TEXT");
  return {text,kind:"sheet",detail:"XLSX"};
}

async function parseOds(file:File):Promise<ParsedDocument>{
  const zip=await JSZip.loadAsync(await file.arrayBuffer());
  const xml=await zip.file("content.xml")?.async("string");
  if(!xml)throw new Error("ODS_CONTENT_XML_MISSING");

  const rows:string[]=[];
  for(const rowHit of xml.matchAll(/<table:table-row\b[^>]*>([\s\S]*?)<\/table:table-row>/g)){
    const cells:string[]=[];
    for(const cellHit of rowHit[1].matchAll(/<table:table-cell\b[^>]*>([\s\S]*?)<\/table:table-cell>/g)){
      cells.push(xmlText(cellHit[1]));
    }
    if(cells.some(Boolean))rows.push(cells.join("\t"));
  }
  const text=rows.join("\n").trim();
  if(!text)throw new Error("ODS_NO_TEXT");
  return {text,kind:"sheet",detail:"ODS"};
}

function stripRtf(source:string){
  return source
    .replace(/\\par[d]?/g,"\n")
    .replace(/\\tab/g,"\t")
    .replace(/\\'[0-9a-fA-F]{2}/g," ")
    .replace(/\\u(-?\d+)\??/g,(_,n)=>String.fromCharCode(Number(n)<0?Number(n)+65536:Number(n)))
    .replace(/\\[a-zA-Z]+-?\d* ?/g,"")
    .replace(/[{}]/g,"")
    .replace(/\n{3,}/g,"\n\n")
    .trim();
}

export function isLegacyOffice(file:File){
  const e=ext(file.name);
  return e==="doc"||e==="xls"||e==="ppt";
}

export async function parseGenericDocument(file:File):Promise<ParsedDocument|null>{
  const e=ext(file.name);

  if(["txt","md","markdown","csv","tsv"].includes(e)||/^text\//.test(file.type)){
    return {text:await file.text(),kind:e==="csv"||e==="tsv"?"sheet":"text",detail:e.toUpperCase()};
  }
  if(e==="rtf"||file.type==="application/rtf"||file.type==="text/rtf"){
    const text=stripRtf(await file.text());
    return {text,kind:"rtf",detail:"RTF"};
  }
  if(e==="docx"||file.type==="application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
    return parseDocx(file);
  }
  if(e==="xlsx"||file.type==="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"){
    return parseXlsx(file);
  }
  if(e==="ods"||file.type==="application/vnd.oasis.opendocument.spreadsheet"){
    return parseOds(file);
  }
  if(e==="epub"||file.type==="application/epub+zip"){
    const parsed=await epubToText(file);
    return {text:parsed.text,kind:"epub",detail:`EPUB · ${parsed.chapters} chapters`};
  }
  if(e==="pptx"||file.type==="application/vnd.openxmlformats-officedocument.presentationml.presentation"){
    const parsed=await pptxToKnowledgeText(file);
    return {text:parsed.text,kind:"pptx",detail:`PPTX · ${parsed.slides} slides`};
  }
  if([
    "json","jsonl","yaml","yml","xml","html","htm",
    "js","jsx","ts","tsx","py","java","c","cpp","h","hpp","go","rs"
  ].includes(e)){
    return {text:await structuredTextFile(file),kind:"structured",detail:e.toUpperCase()};
  }
  return null;
}

export function documentBatchBytes(files: ArrayLike<{ size: number }>): number {
  let total = 0;
  for (let i = 0; i < files.length; i += 1) {
    total += Number(files[i]?.size || 0);
  }
  return total;
}

export function documentBatchWithinBudget(
  files: ArrayLike<{ size: number }>
): boolean {
  return documentBatchBytes(files) <= DOCUMENT_BATCH_MAX_BYTES;
}
