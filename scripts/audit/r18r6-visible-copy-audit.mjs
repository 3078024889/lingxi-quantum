import fs from"node:fs";import ts from"typescript";import path from"node:path";
const roots=["app/sasi","components"],files=[];
function walk(d){if(!fs.existsSync(d))return;for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()){if(["node_modules",".next","_local"].includes(e.name))continue;walk(p)}else if(/\.(tsx|ts)$/.test(e.name)&&(/Sasi|sasi|CangXuan/.test(p)||p.startsWith("app/sasi")))files.push(p.replaceAll(path.sep,"/"))}}
roots.forEach(walk);

const banned=/\b(provider|adapter|ledger|runid|worker|runtime|execution id|checkpoint)\b/i;
const visibleAttrs=new Set(["placeholder","aria-label","title","alt"]);
const hits=[];

for(const p of files){
 const src=fs.readFileSync(p,"utf8");
 const sf=ts.createSourceFile(p,src,ts.ScriptTarget.Latest,true,p.endsWith(".tsx")?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 const report=(n,v)=>{
  const text=String(v||"").replace(/\s+/g," ").trim();
  if(!text||!banned.test(text))return;
  const pos=sf.getLineAndCharacterOfPosition(n.getStart(sf));
  hits.push(`${p}:${pos.line+1}:${text.slice(0,160)}`);
 };
 function visit(n){
  if(ts.isJsxText(n))report(n,n.getText(sf));
  if(ts.isJsxAttribute(n)){
   const name=n.name.getText(sf);
   if(visibleAttrs.has(name)&&n.initializer){
    if(ts.isStringLiteral(n.initializer))report(n.initializer,n.initializer.text);
    else if(ts.isJsxExpression(n.initializer)&&n.initializer.expression&&ts.isStringLiteralLike(n.initializer.expression))
      report(n.initializer.expression,n.initializer.expression.text);
   }
  }
  ts.forEachChild(n,visit);
 }
 visit(sf);
}
if(hits.length){console.error(hits.join("\n"));process.exit(1)}
console.log(`R18R6_PUBLIC_ENGINEERING_COPY=PASS:${files.length}`);
console.log("R18R6_INTERNAL_IDENTIFIERS_NOT_UI_COPY=PASS");
