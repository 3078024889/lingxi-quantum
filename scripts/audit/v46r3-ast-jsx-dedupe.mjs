import fs from "node:fs";
import path from "node:path";
import {pathToFileURL} from "node:url";

const repo=process.argv[2]||process.cwd();
const target=path.join(repo,"components/tools/PdfEditorWorkbench.tsx");
const tsPath=path.join(repo,"node_modules","typescript","lib","typescript.js");
if(!fs.existsSync(target))throw new Error("V46R3_PDF_EDITOR_NOT_FOUND");
if(!fs.existsSync(tsPath))throw new Error("V46R3_TYPESCRIPT_RUNTIME_NOT_FOUND");
const ts=(await import(pathToFileURL(tsPath).href)).default;
const source=fs.readFileSync(target,"utf8");
const sf=ts.createSourceFile(target,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);

if((sf.parseDiagnostics||[]).length){
  const m=sf.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,"\n")).join(" | ");
  throw new Error("V46R3_TSX_PARSE:"+m);
}
const duplicates=[];
function walk(node){
  if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)){
    const seen=new Set();
    for(const prop of node.attributes.properties){
      if(!ts.isJsxAttribute(prop))continue;
      const attrName=prop.name.getText(sf);
      if(seen.has(attrName)){
        const pos=sf.getLineAndCharacterOfPosition(prop.getStart(sf));
        duplicates.push(`${attrName}@${pos.line+1}:${pos.character+1}`);
      }else seen.add(attrName);
    }
  }
  ts.forEachChild(node,walk);
}
walk(sf);
if(duplicates.length)throw new Error("V46R3_DUPLICATE_PROPS:"+duplicates.join(","));

const pageCount=(source.match(/data-testid=["']pdf-source-page-count["']/g)||[]).length;
if(pageCount!==1)throw new Error(`V46R3_PAGECOUNT_TESTID_COUNT:${pageCount}`);

if(!source.includes("resetPaidTask"))throw new Error("V46R3_PDF_RESET_MISSING");
if(!source.includes("onCompleted={resetPaidTask}"))throw new Error("V46R3_COMPLETION_CALLBACK_MISSING");

console.log("V46R3_NO_DUPLICATE_JSX_PROPS=PASS");
console.log("V46R3_PDF_SOURCE_PAGECOUNT=PASS");
console.log("V46R3_PDF_COMPLETION_RESET=PASS");
console.log("LINGXIFIELD_V46R3_AUDIT=PASS");
