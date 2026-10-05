import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";
import ts from "typescript";

const root=process.cwd();
const tracked=execFileSync("git",["ls-files"],{cwd:root,encoding:"utf8"})
 .split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const sourceFiles=tracked.filter(p=>/\.(?:[cm]?[jt]sx?)$/i.test(p) && fs.existsSync(path.join(root,p)));
const exts=[".ts",".tsx",".js",".jsx",".mjs",".cjs",".json",".css",".scss",".sass",".less"];
const failures=[];

function resolves(fromRel,spec){
 const base=path.resolve(root,path.dirname(fromRel),spec);
 if(path.extname(base))return fs.existsSync(base);
 for(const ext of exts)if(fs.existsSync(base+ext))return true;
 for(const ext of exts)if(fs.existsSync(path.join(base,"index"+ext)))return true;
 return false;
}
function record(sf,node,spec){
 if(!spec.startsWith("."))return;
 if(resolves(sf.fileName,spec))return;
 const pos=sf.getLineAndCharacterOfPosition(node.getStart(sf));
 failures.push(`${sf.fileName}:${pos.line+1}:${spec}`);
}
function visit(sf,node){
 if(ts.isImportDeclaration(node)&&ts.isStringLiteralLike(node.moduleSpecifier))record(sf,node.moduleSpecifier,node.moduleSpecifier.text);
 if(ts.isExportDeclaration(node)&&node.moduleSpecifier&&ts.isStringLiteralLike(node.moduleSpecifier))record(sf,node.moduleSpecifier,node.moduleSpecifier.text);
 if(ts.isCallExpression(node)&&node.arguments.length===1&&ts.isStringLiteralLike(node.arguments[0])){
  if(node.expression.kind===ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression)&&node.expression.text==="require"))record(sf,node.arguments[0],node.arguments[0].text);
 }
 ts.forEachChild(node,child=>visit(sf,child));
}
for(const rel of sourceFiles){
 const src=fs.readFileSync(path.join(root,rel),"utf8");
 const kind=/\.tsx$/i.test(rel)?ts.ScriptKind.TSX:/\.jsx$/i.test(rel)?ts.ScriptKind.JSX:ts.ScriptKind.TS;
 const sf=ts.createSourceFile(rel,src,ts.ScriptTarget.Latest,true,kind);
 visit(sf,sf);
}
if(failures.length){
 console.error(failures.join("\n"));
 throw new Error(`R18R7_BROKEN_RELATIVE_IMPORTS:${failures.length}`);
}
console.log(`R18R7_RELATIVE_MODULE_ASSET_INTEGRITY=PASS:${sourceFiles.length}`);
