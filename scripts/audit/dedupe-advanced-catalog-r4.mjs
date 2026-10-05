import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root=process.argv[2]||process.cwd();
const file=path.join(root,"lib/tools/advanced-catalog.ts");
const source=fs.readFileSync(file,"utf8");
const sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);

let target=null;
for(const stmt of sf.statements){
  if(!ts.isVariableStatement(stmt))continue;
  for(const decl of stmt.declarationList.declarations){
    if(ts.isIdentifier(decl.name)&&decl.name.text==="ADVANCED_TOOLS"&&decl.initializer&&ts.isArrayLiteralExpression(decl.initializer)){
      target=decl.initializer;
    }
  }
}
if(!target)throw new Error("ADVANCED_TOOLS_ARRAY_NOT_FOUND");

const seen=new Map();
const duplicateElements=[];

function hrefOf(node){
  if(!ts.isObjectLiteralExpression(node))return null;
  for(const p of node.properties){
    if(!ts.isPropertyAssignment(p))continue;
    const name=ts.isIdentifier(p.name)?p.name.text:ts.isStringLiteral(p.name)?p.name.text:null;
    if(name!=="href")continue;
    if(ts.isStringLiteralLike(p.initializer))return p.initializer.text;
  }
  return null;
}

for(const el of target.elements){
  const href=hrefOf(el);
  if(!href)continue;
  if(seen.has(href))duplicateElements.push({href,node:el});
  else seen.set(href,el);
}

if(!duplicateElements.length){
  console.log("ADVANCED_CATALOG_DEDUP=ALREADY_CLEAN");
  process.exit(0);
}

// Remove later duplicate entries, preserving the first canonical definition.
const edits=duplicateElements.map(({href,node})=>{
  let start=node.getFullStart();
  let end=node.getEnd();
  // absorb a following comma when present, otherwise absorb the preceding comma.
  let i=end;
  while(i<source.length&&/\s/.test(source[i]))i++;
  if(source[i]===","){end=i+1}
  else{
    let j=start-1;
    while(j>=0&&/\s/.test(source[j]))j--;
    if(source[j]===",")start=j;
  }
  return{href,start,end};
}).sort((a,b)=>b.start-a.start);

let out=source;
for(const e of edits)out=out.slice(0,e.start)+out.slice(e.end);

const candidate=ts.createSourceFile(file,out,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
if((candidate.parseDiagnostics??[]).length){
  const msg=(candidate.parseDiagnostics??[]).map(d=>String(d.messageText)).join(" | ");
  throw new Error("ADVANCED_CATALOG_CANDIDATE_PARSE_FAILED:"+msg);
}

fs.writeFileSync(file,out,"utf8");
console.log("ADVANCED_CATALOG_DUPLICATES_REMOVED="+duplicateElements.map(x=>x.href).join(","));
console.log("ADVANCED_CATALOG_DEDUP=PASS");
