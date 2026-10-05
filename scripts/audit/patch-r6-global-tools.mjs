import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
const root=process.argv[2]||process.cwd();

function patchCard(){
 const file=path.join(root,"lib/tools/card-i18n.ts");let src=fs.readFileSync(file,"utf8");
 if(!src.includes('from "@/lib/tools/tool-title-extra"')){
   const sf=ts.createSourceFile(file,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
   const imports=[...sf.statements].filter(ts.isImportDeclaration);
   const at=imports.length?imports.at(-1).getEnd():0;
   src=src.slice(0,at)+'\nimport {extraToolTitle} from "@/lib/tools/tool-title-extra";'+src.slice(at);
 }
 let sf=ts.createSourceFile(file,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS),fn=null;
 for(const s of sf.statements)if(ts.isFunctionDeclaration(s)&&s.name?.text==="toolTitle")fn=s;
 if(!fn)throw new Error("CARD_TOOLTITLE_NOT_FOUND");
 if(!fn.getText(sf).includes("extraToolTitle(")){
   const repl=`export function toolTitle(lang:LingxiLang,slug:string,fallback:string){
  return TITLES[slug]?.[lang]||extraToolTitle(lang,slug)||fallback;
}`;
   src=src.slice(0,fn.getStart(sf))+repl+src.slice(fn.getEnd());
 }
 const check=ts.createSourceFile(file,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
 if((check.parseDiagnostics??[]).length)throw new Error("CARD_I18N_PARSE_FAILED");
 fs.writeFileSync(file,src,"utf8");console.log("CARD_I18N_9LANG_PATCH=PASS");
}
function patchHub(){
 const file=path.join(root,"components/tools/ToolsHubV11.tsx");let src=fs.readFileSync(file,"utf8");
 let sf=ts.createSourceFile(file,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),fn=null;
 for(const s of sf.statements)if(ts.isFunctionDeclaration(s)&&s.name?.text==="displayCategory")fn=s;
 if(!fn)throw new Error("DISPLAY_CATEGORY_NOT_FOUND");
 if(!src.includes("PUBLIC_DISPLAY_CATEGORY_BY_HREF")){
   const ins=`const PUBLIC_DISPLAY_CATEGORY_BY_HREF = new Map<string,Exclude<Category,"all">>(
  publicToolSurface().map((tool)=>[tool.href,tool.category])
);
`;
   src=src.slice(0,fn.getStart(sf))+ins+src.slice(fn.getStart(sf));
 }
 sf=ts.createSourceFile(file,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);fn=null;
 for(const s of sf.statements)if(ts.isFunctionDeclaration(s)&&s.name?.text==="displayCategory")fn=s;
 if(!fn)throw new Error("DISPLAY_CATEGORY_RESCAN_FAILED");
 if(!fn.getText(sf).includes("PUBLIC_DISPLAY_CATEGORY_BY_HREF")){
   const repl=`function displayCategory(item:ToolItem):Exclude<Category,"all">{
  const fromSurface=PUBLIC_DISPLAY_CATEGORY_BY_HREF.get(item.href);
  if(fromSurface)return fromSurface;
  const legacy=DISPLAY_CATEGORY_BY_SLUG[item.href.replace("/tools/","")];
  if(legacy)return legacy;
  if(item.category==="pdf")return"pdf";
  if(item.category==="image")return"image";
  if(item.category==="media")return"media";
  if(item.category==="privacy")return"privacy";
  if(item.category==="qr")return"recognition";
  return"file";
}`;
   src=src.slice(0,fn.getStart(sf))+repl+src.slice(fn.getEnd());
 }
 const check=ts.createSourceFile(file,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 if((check.parseDiagnostics??[]).length)throw new Error("TOOLS_HUB_CATEGORY_PARSE_FAILED");
 fs.writeFileSync(file,src,"utf8");console.log("TOOLS_HUB_CATEGORY_PATCH=PASS");
}
patchCard();patchHub();
