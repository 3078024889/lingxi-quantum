const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const text=fs.readFileSync('lib/tools/shared/developer-document.ts','utf8'),ast=ts.createSourceFile('developer-document.ts',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS),fn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name.text==='xmlPretty');
assert(fn);const dom=new JSDOM('');const context={exports:{},DOMParser:dom.window.DOMParser,XMLSerializer:dom.window.XMLSerializer};vm.createContext(context);vm.runInContext(ts.transpileModule(fn.getText(ast),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);const run=context.exports.xmlPretty;
assert(run('<root><value name="你好">123</value></root>').includes('name="你好">123</value>'));
assert.throws(()=>run('<root>'),/XML/);
assert.throws(()=>run('<a>'.repeat(300)+'value'+'</a>'.repeat(300)),/TOOL_RESULT_TOO_LARGE/);
assert.throws(()=>run('<a>'.repeat(200)+'<x/>'.repeat(6000)+'</a>'.repeat(200)),/TOOL_RESULT_TOO_LARGE/);
dom.window.close();console.log('PASS: actual XML formatter retains ordinary values and Unicode attributes; malformed input, unsafe depth and excessive indented output rejected before runaway string allocation. Local DOM fixture.');
