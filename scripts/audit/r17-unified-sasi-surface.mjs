import fs from "node:fs";
import ts from "typescript";

const files=[
 "components/SasiOneSurface.tsx",
 "components/SasiModeHost.tsx",
 "components/SasiUnifiedLauncher.tsx",
 "components/SasiChatCreationStudio.tsx",
 "components/KnowledgeWorkspace.tsx",
];
for(const p of files)if(!fs.existsSync(p))throw new Error("R17_REQUIRED_FILE_MISSING:"+p);

const one=fs.readFileSync(files[0],"utf8");
const host=fs.readFileSync(files[1],"utf8");
const launcher=fs.readFileSync(files[2],"utf8");
const creation=fs.readFileSync(files[3],"utf8");
const knowledge=fs.readFileSync(files[4],"utf8");

for(const forbidden of["MODES","modeBar","LingxiMiniIcon","sasiModeLabel"])
 if(one.includes(forbidden))throw new Error("R17_OLD_MODEBAR_REMAINS:"+forbidden);

if(!one.includes("SasiUnifiedLauncher"))throw new Error("R17_UNIFIED_LAUNCHER_MISSING");
if(host.includes("SasiStartGuide"))throw new Error("R17_START_GUIDE_VISIBLE");
if(fs.existsSync("components/SasiStartGuide.tsx"))throw new Error("R17_OLD_START_GUIDE_FILE_REMAINS");

// User-facing copy boundary: inspect only text that can actually render to users.
// Internal identifiers such as SasiUnifiedConversationProvider are intentionally ignored.
const banned=[
 ["OpenRouter",/\bOpenRouter\b/i],
 ["Volcengine",/\bVolcengine\b/i],
 ["Gemini API",/\bGemini\s+API\b/i],
 ["API Key",/\bAPI\s+Key\b/i],
 ["Provider",/\bProvider\b/i],
 ["runId",/\brunId\b/i],
 ["queue",/\bqueue\b/i],
 ["lease",/\blease\b/i],
 ["workflow",/\bworkflow\b/i],
];
const visibleAttrs=new Set(["placeholder","aria-label","title","alt"]);
const hits=[];
function scanVisible(rel,src){
 const sf=ts.createSourceFile(rel,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const report=(node,value)=>{
  const text=String(value||"").replace(/\s+/g," ").trim();
  if(!text)return;
  for(const [name,rx] of banned){
   if(rx.test(text)){
    const pos=sf.getLineAndCharacterOfPosition(node.getStart(sf));
    hits.push(`${rel}:${pos.line+1}:${name}:${text.slice(0,180)}`);
   }
  }
 };
 function visit(node){
  if(ts.isJsxText(node))report(node,node.getText(sf));
  if(ts.isJsxAttribute(node)){
   const name=node.name.getText(sf);
   if(visibleAttrs.has(name)&&node.initializer){
    if(ts.isStringLiteral(node.initializer))report(node.initializer,node.initializer.text);
    else if(ts.isJsxExpression(node.initializer)&&node.initializer.expression&&ts.isStringLiteralLike(node.initializer.expression))report(node.initializer.expression,node.initializer.expression.text);
   }
  }
  ts.forEachChild(node,visit);
 }
 visit(sf);
}
scanVisible(files[0],one);
scanVisible(files[1],host);
scanVisible(files[2],launcher);
if(hits.length){console.error(hits.join("\n"));throw new Error("R17_ENGINEERING_COPY_VISIBLE");}

if(!creation.includes("initialPrompt?:string")||!creation.includes("useState(initialPrompt)"))
 throw new Error("R17_CREATION_SEED_MISSING");
if(!knowledge.includes("initialPrompt?:string")||!knowledge.includes("useState(initialPrompt)"))
 throw new Error("R17_KNOWLEDGE_SEED_MISSING");

console.log("R17_ONE_FRONT_DOOR=PASS");
console.log("R17_FIVE_VISIBLE_MODE_TABS_REMOVED=PASS");
console.log("R17_ENGINEERING_COPY_HIDDEN=PASS");
console.log("R17_INTERNAL_IDENTIFIERS_EXCLUDED_FROM_UI_COPY=PASS");
console.log("R17_SPECIALIST_ENGINES_PRESERVED=PASS");
console.log("R17_INITIAL_REQUEST_CARRIED_FORWARD=PASS");
