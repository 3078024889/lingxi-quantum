import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const fields=[],failures=[];
function walk(directory){
 for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name);
  if(entry.isDirectory())walk(file);
  else if(/\.tsx$/.test(entry.name))inspect(file);
 }
}
function inspect(file){
 const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 function visit(node){
  if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)){
   const tag=node.tagName.getText(source);
   const attrs=new Map(node.attributes.properties.filter(ts.isJsxAttribute).map(attr=>[attr.name.getText(source),attr.initializer]));
   const literal=name=>{const value=attrs.get(name);return value&&ts.isStringLiteral(value)?value.text:''};
   if(['input','EditableNumberInput'].includes(tag)&&(literal('type')==='number'||['numeric','decimal'].includes(literal('inputMode')))){
    const handler=attrs.get('onChange')?.getText(source)||'';
    const row={file:file.replaceAll('\\','/'),line:source.getLineAndCharacterOfPosition(node.getStart(source)).line+1,tag,type:literal('type'),inputMode:literal('inputMode')};
    fields.push(row);
    // Native controlled fields must store unfinished text. Numeric conversions belong
    // in validation/commit handlers or the shared draft-preserving component.
    if(tag==='input'&&!file.replaceAll('\\','/').endsWith('/EditableNumberInput.tsx')&&attrs.has('value')&&/\b(?:Number|parseInt|parseFloat)\s*\(|valueAsNumber/.test(handler))failures.push(row);
   }
  }
  ts.forEachChild(node,visit);
 }
 visit(source);
}
for(const directory of ['app','components'])walk(directory);
fs.mkdirSync('artifacts/numeric-input-audit-v78',{recursive:true});
fs.writeFileSync('artifacts/numeric-input-audit-v78/inventory.json',JSON.stringify({fields,failures},null,2));
if(failures.length){console.error(JSON.stringify(failures,null,2));throw Error('NUMERIC_INPUT_EAGER_COERCION')}
console.log(`PASS: ${fields.length} numeric/decimal JSX controls inventoried; no native controlled input coerces unfinished text in onChange. Browser and output tests verify behavior separately.`);
