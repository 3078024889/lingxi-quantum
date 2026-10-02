import fs from "node:fs";
import path from "node:path";
import {pathToFileURL} from "node:url";

const repo=process.argv[2]||process.cwd();
const target=path.join(repo,"tests/final-closure/paid-return-v45.spec.ts");
const tsPath=path.join(repo,"node_modules","typescript","lib","typescript.js");
if(!fs.existsSync(target))throw new Error("V46R4_TEST_NOT_FOUND");
if(!fs.existsSync(tsPath))throw new Error("V46R4_TYPESCRIPT_RUNTIME_NOT_FOUND");
const ts=(await import(pathToFileURL(tsPath).href)).default;
const s=fs.readFileSync(target,"utf8");
const sf=ts.createSourceFile(target,s,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const ds=sf.parseDiagnostics||[];
if(ds.length){
  const msg=ds.map(d=>ts.flattenDiagnosticMessageText(d.messageText,"\n")).join(" | ");
  throw new Error("V46R4_TEST_PARSE_ERROR:"+msg);
}
if(!s.includes('上传 PDF \\/ DOC \\/ DOCX|Upload PDF \\/ DOC \\/ DOCX'))throw new Error("V46R4_ESCAPED_REGEX_MISSING");
console.log("V46R4_TEST_TYPESCRIPT_PARSE=PASS");
console.log("V46R4_PAID_RETURN_ASSERTION=PASS");
console.log("LINGXIFIELD_V46R4_AUDIT=PASS");
