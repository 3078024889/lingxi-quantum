import fs from "node:fs";
import path from "node:path";
import {pathToFileURL} from "node:url";

const repo=process.argv[2]||process.cwd();
const target=path.join(repo,"components/tools/PdfEditorWorkbench.tsx");
if(!fs.existsSync(target))throw new Error("V46R3_PDF_EDITOR_NOT_FOUND");

const tsPath=path.join(repo,"node_modules","typescript","lib","typescript.js");
if(!fs.existsSync(tsPath))throw new Error("V46R3_TYPESCRIPT_RUNTIME_NOT_FOUND");
const ts=(await import(pathToFileURL(tsPath).href)).default;

let source=fs.readFileSync(target,"utf8");

function parse(text){
  return ts.createSourceFile(target,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
}

function collectDuplicateAttributes(sf,text){
  const edits=[];
  const report=[];
  function walk(node){
    if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)){
      const seen=new Map();
      for(const prop of node.attributes.properties){
        if(!ts.isJsxAttribute(prop))continue;
        const attrName=prop.name.getText(sf);
        if(seen.has(attrName)){
          let start=prop.getStart(sf);
          while(start>node.getStart(sf)&&/[ \t\r\n]/.test(text[start-1]))start--;
          edits.push({start,end:prop.getEnd(),name:attrName});
          const pos=sf.getLineAndCharacterOfPosition(prop.getStart(sf));
          report.push(`${attrName}@${pos.line+1}:${pos.character+1}`);
        }else{
          seen.set(attrName,prop);
        }
      }
    }
    ts.forEachChild(node,walk);
  }
  walk(sf);
  return {edits,report};
}

let sf=parse(source);
if((sf.parseDiagnostics||[]).length){
  const m=sf.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,"\n")).join(" | ");
  throw new Error("V46R3_TSX_PARSE_BEFORE:"+m);
}
const before=collectDuplicateAttributes(sf,source);
console.log("V46R3_DUPLICATES_FOUND="+before.report.length);
if(before.report.length)console.log("V46R3_DUPLICATE_PROPS="+before.report.join(","));

for(const e of [...before.edits].sort((a,b)=>b.start-a.start)){
  source=source.slice(0,e.start)+source.slice(e.end);
}

fs.writeFileSync(target,source,"utf8");

sf=parse(source);
if((sf.parseDiagnostics||[]).length){
  const m=sf.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,"\n")).join(" | ");
  throw new Error("V46R3_TSX_PARSE_AFTER:"+m);
}
const after=collectDuplicateAttributes(sf,source);
if(after.report.length)throw new Error("V46R3_DUPLICATE_PROPS_REMAIN:"+after.report.join(","));

const pageCount=(source.match(/data-testid=["']pdf-source-page-count["']/g)||[]).length;
if(pageCount!==1)throw new Error(`V46R3_PAGECOUNT_TESTID_COUNT:${pageCount}`);

console.log("V46R3_AST_JSX_DEDUPE_APPLY=PASS");
