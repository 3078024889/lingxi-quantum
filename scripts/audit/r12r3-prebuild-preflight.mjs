import fs from"node:fs";
import ts from"typescript";

const failures=[];
const fail=x=>failures.push(x);
const css=fs.readFileSync("app/globals.css","utf8");
const marker="/* R12R3 SASI conversation identity */";
const at=css.indexOf(marker);
if(at<0)fail("R12R3_CSS_MARKER_MISSING");
const tail=at>=0?css.slice(at):"";
if(tail.includes("\\n"))fail("R12R3_OWNED_CSS_LITERAL_BACKSLASH_N");
if(!tail.includes('.lx-sasi-user-bubble[data-sasi-user-color="blue"]'))fail("R12R3_BLUE_SENT_RULE_MISSING");
if(!tail.includes("caret-color:#2563eb!important"))fail("R12R3_BLUE_TYPED_RULE_MISSING");

let braces=0,comment=false,quote=null,escape=false;
for(let i=0;i<css.length;i++){
 const ch=css[i],next=css[i+1];
 if(comment){if(ch==="*"&&next==="/"){comment=false;i++}continue}
 if(quote){
  if(escape){escape=false;continue}
  if(ch==="\\"){escape=true;continue}
  if(ch===quote)quote=null;
  continue;
 }
 if(ch==="/"&&next==="*"){comment=true;i++;continue}
 if(ch==="'"||ch==='"'){quote=ch;continue}
 if(ch==="{")braces++;
 else if(ch==="}"){braces--;if(braces<0){fail("CSS_UNEXPECTED_CLOSE_BRACE");break}}
}
if(comment)fail("CSS_UNCLOSED_COMMENT");
if(quote)fail("CSS_UNCLOSED_STRING");
if(braces!==0)fail("CSS_UNBALANCED_BRACES:"+braces);

const tsFiles=[
 "components/SasiOneSurface.tsx","components/SasiComposerCore.tsx","components/SasiResultCore.tsx",
 "components/SasiChatCreationStudio.tsx","components/KnowledgeWorkspace.tsx",
 "components/SasiUnifiedConversationProvider.tsx","components/SasiUnifiedTurns.tsx",
 "lib/sasi/core/unified-conversation.ts","lib/sasi/core/conversation-machine.ts",
 "lib/sasi/core/stream-events.ts","lib/sasi/core/artifact-lineage.ts","lib/sasi/core/run-control.ts",
 "lib/sasi/durable/release-invariants.ts",
 "lib/sasi/core/simple-surface-contract.ts",
 "app/api/internal/sasi/worker/tick/route.ts",
 "lib/sasi/durable/enqueue-knowledge.ts",
 "lib/sasi/durable/detached-worker.ts",
 "lib/sasi/durable/knowledge-job-handler.ts",
 "lib/sasi/durable/worker-version.ts",
 "lib/sasi/durable/job-queue.ts",
 "lib/sasi/knowledge/durable-knowledge.ts",
 "lib/sasi/durable/step-store.ts",
 "lib/sasi/durable/runtime-capability.ts",
 "app/api/sasi/runs/[runId]/snapshot/route.ts",
 "app/api/sasi/runs/[runId]/events/route.ts",
 "components/useSasiRunStream.ts",
 "lib/sasi/durable/public-event-store.ts",
 "lib/sasi/durable/public-event-codec.ts"
];
for(const file of tsFiles){
 if(!fs.existsSync(file)){fail("MISSING_CHANGED_FILE:"+file);continue}
 const result=ts.transpileModule(fs.readFileSync(file,"utf8"),{
  fileName:file,reportDiagnostics:true,
  compilerOptions:{jsx:ts.JsxEmit.Preserve,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}
 });
 for(const d of result.diagnostics||[])if(d.category===ts.DiagnosticCategory.Error){
  fail(`TS_PARSE:${file}:${ts.flattenDiagnosticMessageText(d.messageText," ")}`);
 }
}
if(failures.length){
 for(const f of failures)console.error("PREFLIGHT_FAIL="+f);
 process.exit(1);
}
console.log("R12R3_CSS_STRUCTURAL_PREFLIGHT=PASS");
console.log("R12R3_OWNED_CSS_ESCAPE_GATE=PASS");
console.log("R12R3_CHANGED_TS_TSX_PARSE=PASS");
