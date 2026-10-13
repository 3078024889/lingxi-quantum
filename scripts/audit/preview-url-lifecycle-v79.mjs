import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const failures=[];let files=0;
function inspect(file){files++;const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 function expression(node){if(ts.isArrowFunction(node)||ts.isFunctionExpression(node))return;if(ts.isCallExpression(node)&&node.expression.getText(source)==='URL.createObjectURL')failures.push({file,line:source.getLineAndCharacterOfPosition(node.getStart()).line+1});ts.forEachChild(node,expression)}
 function visit(node){if(ts.isJsxExpression(node)&&node.expression)expression(node.expression);ts.forEachChild(node,visit)}visit(source);
}
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(file.endsWith('.tsx'))inspect(file)}}
walk('components/tools');walk('app/tools');
if(failures.length)throw Error('UNOWNED_RENDER_OBJECT_URL:'+JSON.stringify(failures));
console.log('PASS: '+files+' tool TSX files checked; JSX render expressions allocate no object URLs. Event/effect paths require separate lifecycle review.');
