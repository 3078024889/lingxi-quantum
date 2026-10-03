const fs=require("fs");
const ts=require("typescript");

const files=[
 "components/KnowledgeWorkspace.tsx",
 "components/SasiChatCreationStudio.tsx",
 "app/sasi/ConnectionCenter.tsx",
 "app/layout.tsx",
 "app/page.tsx",
 "components/HomeProblemHub.tsx",
 "components/Footer.tsx",
 "components/SiteStructuredData.tsx",
 "lib/money/provider-adapters.ts",
 "lib/money/reconcile-worker.ts",
 "lib/money/webhook-inbox.ts",
 "app/api/pay/wechat/refund-notify/route.ts",
 "app/api/pay/paypal/webhook/route.ts"
];

let failed=false;
for(const file of files){
 if(!fs.existsSync(file)){
  console.error("TS_TARGET_MISSING",file);
  failed=true;
  continue;
 }
 const src=fs.readFileSync(file,"utf8");
 const out=ts.transpileModule(src,{
  compilerOptions:{
   target:ts.ScriptTarget.ES2022,
   module:ts.ModuleKind.ESNext,
   jsx:ts.JsxEmit.ReactJSX
  },
  reportDiagnostics:true,
  fileName:file
 });
 const errors=(out.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
 for(const d of errors){
  failed=true;
  const sf=ts.createSourceFile(file,src,ts.ScriptTarget.ES2022,true,file.endsWith(".tsx")?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  const pos=typeof d.start==="number"?sf.getLineAndCharacterOfPosition(d.start):{line:-1,character:-1};
  const lineNo=pos.line+1;
  const colNo=pos.character+1;
  const lines=src.split(/\r?\n/);
  const excerpt=lineNo>0?lines.slice(Math.max(0,lineNo-2),Math.min(lines.length,lineNo+1)).map((line,index)=>`${Math.max(1,lineNo-1)+index}: ${line}`).join(" | "):"";
  console.error("TS_PARSE_ERROR",file,`${lineNo}:${colNo}`,ts.flattenDiagnosticMessageText(d.messageText," "),excerpt);
 }
}
if(failed)process.exit(1);
console.log("R12_PATCHED_TYPESCRIPT_PARSE=PASS");
