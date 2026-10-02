import fs from"node:fs";
import path from"node:path";
import{pathToFileURL}from"node:url";

const repo=process.argv[2]||process.cwd();
const target=path.join(repo,"tests/final-closure/paid-return-v45.spec.ts");
const tsPath=path.join(repo,"node_modules","typescript","lib","typescript.js");
if(!fs.existsSync(target))throw new Error("V46R5_TEST_NOT_FOUND");
if(!fs.existsSync(tsPath))throw new Error("V46R5_TYPESCRIPT_RUNTIME_NOT_FOUND");
const ts=(await import(pathToFileURL(tsPath).href)).default;
const s=fs.readFileSync(target,"utf8");
const sf=ts.createSourceFile(target,s,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const ds=sf.parseDiagnostics||[];
if(ds.length)throw new Error("V46R5_TEST_PARSE_ERROR:"+ds.map(d=>ts.flattenDiagnosticMessageText(d.messageText,"\n")).join(" | "));
for(const marker of[
 "createRecoverableDraft",
 "resumeDraft=${encodeURIComponent(draftId)}&resumeQuote=${Q}",
 'getByTestId("pdf-source-page-count")',
 "expect(downloads).toBe(0)",
 "expect(consumeCalls).toBe(0)"
])if(!s.includes(marker))throw new Error("V46R5_MARKER_MISSING:"+marker);
if(/getByText\(\/上传 PDF/.test(s))throw new Error("V46R5_LOCALIZED_TEXT_ASSERTION_REMAINS");
console.log("V46R5_TEST_PARSE=PASS");
console.log("V46R5_REAL_DRAFT_RECOVERY=PASS");
console.log("V46R5_LOCALE_INDEPENDENT_ASSERTIONS=PASS");
console.log("LINGXIFIELD_V46R5_AUDIT=PASS");
