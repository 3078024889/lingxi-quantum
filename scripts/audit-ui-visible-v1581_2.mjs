import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root=process.cwd();
const roots=["app","components"];
const files=[];
function walk(d){
 if(!fs.existsSync(d))return;
 for(const e of fs.readdirSync(d,{withFileTypes:true})){
  if(e.name==="node_modules"||e.name===".next"||e.name.startsWith(".lingxi-backup-"))continue;
  const p=path.join(d,e.name);
  if(e.isDirectory())walk(p);
  else if(/\.(tsx|jsx)$/.test(e.name))files.push(p);
 }
}
for(const r of roots)walk(path.join(root,r));

const banned=[
 "生成式 AI","确定性算法","确定性计算","浏览器本地","本地 FFmpeg",
 "RPC","Pipeline","Worker","Queue","Inference","Endpoint","Webhook","Object Storage",
 "Parser","Runtime","Job Failed","Task Executor","任务节点","推理节点","模型调用",
 "Provider error","内部状态","服务器结果","服务端结果","AI余额","余额退款",
 "意识显化","潜意识重塑","桃花磁场","修炼技术","场域精测"
];

function textOf(node,source){
 if(ts.isJsxText(node))return node.getText(source).trim();
 if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node))return node.text;
 return "";
}
function visibleStrings(sf){
 const out=[];
 function visit(node){
  if(ts.isJsxText(node)){
   const v=node.getText(sf).replace(/\s+/g," ").trim();if(v)out.push(v);
  }
  if(ts.isJsxAttribute(node)&&node.initializer){
   const name=node.name.getText(sf);
   if(["placeholder","title","aria-label","alt"].includes(name)){
    if(ts.isStringLiteral(node.initializer))out.push(node.initializer.text);
    if(ts.isJsxExpression(node.initializer)&&node.initializer.expression&&ts.isStringLiteral(node.initializer.expression))out.push(node.initializer.expression.text);
   }
  }
  if(ts.isCallExpression(node)){
   const callee=node.expression.getText(sf);
   const uiCall=/^(?:uiCopy|c|t|feedbackText)$/.test(callee)||callee.endsWith(".t");
   if(uiCall){
    for(const a of node.arguments){
      if(ts.isStringLiteral(a)||ts.isNoSubstitutionTemplateLiteral(a))out.push(a.text);
    }
   }
  }
  if(ts.isJsxSelfClosingElement(node)||ts.isJsxElement(node)){
   const tag=ts.isJsxElement(node)?node.openingElement.tagName.getText(sf):node.tagName.getText(sf);
   if(["Bi","LxText"].includes(tag)){
    const attrs=ts.isJsxElement(node)?node.openingElement.attributes.properties:node.attributes.properties;
    for(const a of attrs){
      if(ts.isJsxAttribute(a)&&["zh","en","ja","ko","fr","de","es","pt","ar"].includes(a.name.getText(sf))&&a.initializer&&ts.isStringLiteral(a.initializer))out.push(a.initializer.text);
    }
   }
  }
  ts.forEachChild(node,visit);
 }
 visit(sf);return out;
}

const hits=[];
for(const file of files){
 const rel=path.relative(root,file).replaceAll("\\","/");
 if(rel.includes("/api/")||rel.includes("/legal/"))continue;
 const source=fs.readFileSync(file,"utf8");
 const sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 for(const s of visibleStrings(sf)){
  for(const term of banned)if(s.includes(term))hits.push(rel+" :: "+term+" :: "+s.slice(0,120));
 }
}
if(hits.length){
 console.error("AST_UI_COPY_AUDIT=FAIL");
 console.error(hits.join("\n"));
 process.exit(1);
}
console.log("AST_UI_COPY_AUDIT=PASS");
