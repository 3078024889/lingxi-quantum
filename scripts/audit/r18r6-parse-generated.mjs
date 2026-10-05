import fs from"node:fs";import ts from"typescript";
const files=[
 "components/SasiOneSurface.tsx","components/SasiUnifiedLauncher.tsx",
 "components/SasiChatCreationStudio.tsx","components/KnowledgeWorkspace.tsx",
 "components/SasiResultCore.tsx","lib/sasi/core/intent-router.ts",
 "lib/sasi/core/session-contract.ts","lib/sasi/composer-core.ts"
].filter(fs.existsSync);
const bad=[];
for(const p of files){
 const s=fs.readFileSync(p,"utf8");
 const sf=ts.createSourceFile(p,s,ts.ScriptTarget.Latest,true,p.endsWith(".tsx")?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 for(const d of sf.parseDiagnostics||[]){
  const pos=d.start==null?null:sf.getLineAndCharacterOfPosition(d.start);
  bad.push(`${p}${pos?`:${pos.line+1}:${pos.character+1}`:""} ${ts.flattenDiagnosticMessageText(d.messageText," ")}`);
 }
}
if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log(`R18R6_TS_TSX_PARSE=PASS:${files.length}`);
