import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root=process.argv[2]||process.cwd();
const file=path.join(root,"components/tools/ToolsHubV11.tsx");
const source=fs.readFileSync(file,"utf8");
const sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);

const edits=[];

let hasUnifiedImport=false;
let oldRegistryImport=null;
let allToolsFn=null;

for(const stmt of sf.statements){
  if(ts.isImportDeclaration(stmt) && ts.isStringLiteral(stmt.moduleSpecifier)){
    const mod=stmt.moduleSpecifier.text;
    if(mod==="@/lib/tools/public-surface")hasUnifiedImport=true;
    if(mod==="@/lib/tools/registry")oldRegistryImport=stmt;
  }
  if(ts.isFunctionDeclaration(stmt) && stmt.name?.text==="allTools"){
    allToolsFn=stmt;
  }
}

if(!hasUnifiedImport){
  if(oldRegistryImport){
    edits.push({
      start:oldRegistryImport.getStart(sf),
      end:oldRegistryImport.getEnd(),
      text:'import {publicToolSurface} from "@/lib/tools/public-surface";'
    });
  }else{
    const insertAt=sf.statements.find(s=>!ts.isImportDeclaration(s))?.getStart(sf)??0;
    edits.push({
      start:insertAt,
      end:insertAt,
      text:'import {publicToolSurface} from "@/lib/tools/public-surface";\n'
    });
  }
}

const newAllTools=`function allTools(): ToolItem[] {
  const map = new Map<string, ToolItem>();

  for (const tool of publicToolSurface()) {
    map.set(tool.href, {
      href: tool.href,
      titleZh: tool.titleZh,
      titleEn: tool.titleEn,
      descZh: tool.descZh,
      descEn: tool.descEn,
      kind: tool.kind,
      category:
        tool.category === "pdf" ? "pdf" :
        tool.category === "image" ? "image" :
        tool.category === "media" || tool.category === "subtitle" ? "media" :
        tool.category === "privacy" ? "privacy" :
        tool.category === "recognition" ? "qr" :
        "utility",
      localOnly: tool.localOnly,
    });
  }

  for (const item of dedicated) {
    if (!map.has(item.href)) map.set(item.href, item);
  }

  if (process.env.NEXT_PUBLIC_PRIVACY_TOOLS_ENABLED === "true") {
    for (const item of privacyInfrastructureTools) map.set(item.href, item);
  }

  return [...map.values()];
}`;

if(!allToolsFn)throw new Error("AST_ALLTOOLS_FUNCTION_NOT_FOUND");

const existingAllTools=allToolsFn.getText(sf);
if(!existingAllTools.includes("publicToolSurface()")){
  edits.push({
    start:allToolsFn.getStart(sf),
    end:allToolsFn.getEnd(),
    text:newAllTools
  });
}

if(edits.length===0){
  console.log("TOOLS_HUB_AST_PATCH=ALREADY_APPLIED");
  process.exit(0);
}

edits.sort((a,b)=>b.start-a.start);
let out=source;
for(const e of edits)out=out.slice(0,e.start)+e.text+out.slice(e.end);

// Parse candidate before write.
const candidate=ts.createSourceFile(file,out,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const diagnostics=candidate.parseDiagnostics??[];
if(diagnostics.length){
  const msg=diagnostics.map(d=>String(d.messageText)).join(" | ");
  throw new Error("AST_CANDIDATE_PARSE_FAILED:"+msg);
}

fs.writeFileSync(file,out,"utf8");
console.log("TOOLS_HUB_AST_PATCH=PASS");
