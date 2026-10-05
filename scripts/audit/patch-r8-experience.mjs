import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root=process.argv[2]||process.cwd();

function patchModeHost(){
 const file=path.join(root,"components/SasiModeHost.tsx");let src=fs.readFileSync(file,"utf8");
 if(!src.includes('SasiStartGuide')){
   const sf=ts.createSourceFile(file,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
   const imports=sf.statements.filter(ts.isImportDeclaration);
   const at=imports.at(-1)?.getEnd()??0;
   src=src.slice(0,at)+'\nimport SasiStartGuide from "@/components/SasiStartGuide";'+src.slice(at);
 }
 src=src.replace(
  'return <SasiChatCreationStudio mode={mode as"drama"|"website"} modeBar={modeBar}/>;',
  'return <><SasiStartGuide mode={mode}/><SasiChatCreationStudio mode={mode as"drama"|"website"} modeBar={modeBar}/></>;'
 );
 src=src.replace(
  'return <KnowledgeWorkspace mode={mode as"book"|"learning"|"research"} modeBar={modeBar}/>;',
  'return <><SasiStartGuide mode={mode}/><KnowledgeWorkspace mode={mode as"book"|"learning"|"research"} modeBar={modeBar}/></>;'
 );
 const check=ts.createSourceFile(file,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 if((check.parseDiagnostics??[]).length)throw new Error("SASI_MODE_HOST_PARSE_FAILED");
 fs.writeFileSync(file,src,"utf8");
 console.log("SASI_START_GUIDE_WIRED=PASS");
}

function patchStudio(){
 const file=path.join(root,"components/SasiChatCreationStudio.tsx");let src=fs.readFileSync(file,"utf8");
 const sf=ts.createSourceFile(file,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 let prepareFn=null;
 function visit(n){
  if(ts.isFunctionDeclaration(n)&&n.name?.text==="prepare")prepareFn=n;
  ts.forEachChild(n,visit);
 }
 visit(sf);
 if(!prepareFn)throw new Error("PREPARE_FUNCTION_NOT_FOUND");
 const text=prepareFn.getText(sf);
 if(!text.includes("LOCAL_WEBSITE_FALLBACK_V8")){
   const target='  }catch(e){setMessage(e instanceof Error?e.message:ct("genericUnavailable"))}\n';
   if(!text.includes(target))throw new Error("PREPARE_CATCH_DRIFT");
   const replacement=`  }catch(e){
   // LOCAL_WEBSITE_FALLBACK_V8: the first website aha-moment must not depend on
   // model subsidy or a successful server project creation.
   if(mode==="website"&&prompt.trim()){
    const html=localWebsite(prompt.trim(),lang,"");
    setWebsiteHtml(html);
    setAssistantText(ct("websiteDraftReady"));
    setMessage(ct("websiteDraftDone"));
    return;
   }
   setMessage(e instanceof Error?e.message:ct("genericUnavailable"))
  }\n`;
   const start=prepareFn.getStart(sf),end=prepareFn.getEnd();
   const replaced=text.replace(target,replacement);
   src=src.slice(0,start)+replaced+src.slice(end);
 }
 const check=ts.createSourceFile(file,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 if((check.parseDiagnostics??[]).length)throw new Error("SASI_STUDIO_PARSE_FAILED");
 fs.writeFileSync(file,src,"utf8");
 console.log("SASI_WEBSITE_LOCAL_AHA=PASS");
}

patchModeHost();
patchStudio();
