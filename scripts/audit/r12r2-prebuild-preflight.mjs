import fs from"node:fs";
import path from"node:path";
import ts from"typescript";

const failures=[];
function fail(x){failures.push(x)}

const cssPath="app/globals.css";
const css=fs.readFileSync(cssPath,"utf8");

// Regression gate for the exact R12R1 failure.
if(css.includes("\\\\n"))fail("CSS_LITERAL_BACKSLASH_N_PRESENT");
if(!css.includes("/* R12R2 SASI conversation identity */"))fail("R12R2_CSS_MARKER_MISSING");
if(!css.includes('.lx-sasi-user-bubble[data-sasi-user-color="blue"]'))fail("BLUE_SENT_RULE_MISSING");
if(!css.includes("caret-color:#2563eb!important"))fail("BLUE_TYPED_RULE_MISSING");

// Lightweight structural CSS scan: comments/strings/braces.
let braces=0,comment=false,quote=null,escape=false;
for(let i=0;i<css.length;i++){
 const ch=css[i],next=css[i+1];
 if(comment){if(ch==="*"&&next==="/"){comment=false;i++}continue}
 if(quote){
  if(escape){escape=false;continue}
  if(ch==="\\\\"){escape=true;continue}
  if(ch===quote)quote=null;
  continue;
 }
 if(ch==="/"&&next==="*"){comment=true;i++;continue}
 if(ch==="'"||ch==='"'){quote=ch;continue}
 if(ch==="{")braces++;
 if(ch==="}"){braces--;if(braces<0){fail("CSS_UNEXPECTED_CLOSE_BRACE");break}}
}
if(comment)fail("CSS_UNCLOSED_COMMENT");
if(quote)fail("CSS_UNCLOSED_STRING");
if(braces!==0)fail("CSS_UNBALANCED_BRACES:"+braces);

// Parse every TS/TSX file modified by R12/R12R1/R12R2 before the full Next build.
const tsFiles=[
 "components/SasiOneSurface.tsx",
 "components/SasiComposerCore.tsx",
 "components/SasiResultCore.tsx",
 "components/SasiChatCreationStudio.tsx",
 "components/KnowledgeWorkspace.tsx",
 "components/SasiUnifiedConversationProvider.tsx",
 "components/SasiUnifiedTurns.tsx",
 "lib/sasi/core/unified-conversation.ts",
 "lib/sasi/core/conversation-machine.ts",
 "lib/sasi/core/stream-events.ts",
 "lib/sasi/core/artifact-lineage.ts",
 "lib/sasi/core/run-control.ts",
];
for(const file of tsFiles){
 if(!fs.existsSync(file)){fail("MISSING_CHANGED_FILE:"+file);continue}
 const source=fs.readFileSync(file,"utf8");
 const result=ts.transpileModule(source,{
  fileName:file,
  reportDiagnostics:true,
  compilerOptions:{
   jsx:ts.JsxEmit.Preserve,
   target:ts.ScriptTarget.ES2022,
   module:ts.ModuleKind.ESNext
  }
 });
 for(const d of result.diagnostics||[]){
  if(d.category===ts.DiagnosticCategory.Error){
   fail(`TS_PARSE:${file}:${ts.flattenDiagnosticMessageText(d.messageText," ")}`);
  }
 }
}

if(failures.length){
 for(const f of failures)console.error("PREFLIGHT_FAIL="+f);
 process.exit(1);
}
console.log("R12R2_CSS_SYNTAX_PREFLIGHT=PASS");
console.log("R12R2_NO_LITERAL_ESCAPE_IN_CSS=PASS");
console.log("R12R2_CHANGED_TS_TSX_PARSE=PASS");
