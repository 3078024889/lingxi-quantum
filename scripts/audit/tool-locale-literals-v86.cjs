const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','module','exports',code)(name=>{if(name.startsWith('@/')||name.startsWith('.')){const base=name.startsWith('@/')?path.resolve(name.slice(2)):path.resolve(path.dirname(file),name);return load([base,base+'.ts',base+'.tsx'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile()))}return require(name)},m,m.exports);return m.exports;}
const {TOOL_COPY_V86}=load('lib/tools/ui-copy-v86.ts'),{toolRuntimeText}=load('lib/tool-runtime-i18n.ts'),rows=[],raw=[];
const locales=['zh','en','ja','ko','fr','de','es','pt','ar'];
for(const [source,map]of Object.entries(TOOL_COPY_V86))for(const lang of locales)if(!map[lang])throw Error('Missing locale '+lang+': '+source);
for(const name of fs.readdirSync('components/tools').filter(x=>x.endsWith('.tsx'))){
 const source=fs.readFileSync('components/tools/'+name,'utf8'),a=ts.createSourceFile(name,source,99,true,4);
 function strings(n){if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)){if(/[\u4e00-\u9fff]/.test(n.text))rows.push({file:name,source:n.text,missing:toolRuntimeText('en',n.text,'MISSING')==='MISSING'});}else ts.forEachChild(n,strings)}
 function go(n){if(ts.isJsxSelfClosingElement(n)&&n.tagName.getText(a)==='ToolUiText'){const attr=n.attributes.properties.find(p=>p.name?.text==='text');if(attr?.initializer)strings(attr.initializer);}
 if(ts.isCallExpression(n)&&n.expression.getText(a)==='toolUiCopy')for(const arg of n.arguments)strings(arg);
 if(ts.isJsxText(n)&&/[\u4e00-\u9fff]/.test(n.text))raw.push({file:name,source:n.text.trim()});ts.forEachChild(n,go)}go(a);
}
const report={dictionaryEntries:Object.keys(TOOL_COPY_V86).length,locales,translatedLiteralReferences:rows.length,rawJsxText:raw,missing:rows.filter(r=>r.missing)};fs.mkdirSync('_local/handoff/function-acceptance-v86',{recursive:true});fs.writeFileSync('_local/handoff/function-acceptance-v86/locale-source-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(raw.length||report.missing.length)process.exitCode=1;
