const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const modules=new Map();
function load(file){
 file=path.resolve(file);if(modules.has(file))return modules.get(file).exports;
 const module={exports:{}};modules.set(file,module);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','module','exports',code)(name=>{
  if(name==='server-only')return{};
  if(name.startsWith('@/')||name.startsWith('.')){const base=name.startsWith('@/')?path.resolve(name.slice(2)):path.resolve(path.dirname(file),name);const resolved=[base,base+'.ts',base+'.js'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());if(!resolved)throw Error('Missing module '+name);if(resolved.endsWith('.json'))return JSON.parse(fs.readFileSync(resolved,'utf8'));return load(resolved)}
  return require(name);
 },module,module.exports);return module.exports;
}
const tools=load('lib/tools/public-surface.ts').publicToolSurface();
const recipes=JSON.parse(fs.readFileSync('lib/tools/platform/tool-recipes.json','utf8'));
const testFiles=fs.readdirSync('tests/final-closure').filter(file=>file.endsWith('.spec.ts')).map(file=>({file,source:fs.readFileSync(path.join('tests/final-closure',file),'utf8')}));
const references={image:'GoogleChromeLabs/squoosh',document:'Stirling-Tools/Stirling-PDF',video:'mifi/lossless-cut; FFmpeg',audio:'FFmpeg',utility:'gchq/CyberChef',privacy:'OWASP; existing local privacy contract',ai:'existing BYOK execution contract',qr:'existing encode/decode round-trip contract'};
const rows=tools.map(tool=>{
 const dedicated='app/tools/'+tool.slug+'/page.tsx';
 return{slug:tool.slug,title:tool.titleEn||tool.titleZh,kind:tool.kind,source:tool.source,pageSource:fs.existsSync(dedicated)?dedicated:'app/tools/[slug]/page.tsx',localOnly:tool.localOnly,declaredCapabilities:recipes.find(recipe=>recipe.slug===tool.slug)?.capabilities||[],namedTestFiles:testFiles.filter(test=>test.source.includes("'"+tool.slug+"'")||test.source.includes('"'+tool.slug+'"')).map(test=>'tests/final-closure/'+test.file),comparisonReference:references[tool.kind],acceptance:'Render and initial controls are checked by all-tools.spec.ts; named tests cover specific flows, not every supported input or provider.'};
});
if(new Set(rows.map(row=>row.slug)).size!==rows.length)throw Error('Duplicate public tool');
const directory='_local/handoff/tool-audit-v83';fs.mkdirSync(directory,{recursive:true});
fs.writeFileSync(directory+'/inventory.json',JSON.stringify({tools:rows.length,rows,warning:'Inventory and declared capabilities are not proof of complete functional acceptance.'},null,2));
const keys=['slug','title','kind','pageSource','localOnly','declaredCapabilities','namedTestFiles','comparisonReference'];
const csv=value=>'"'+String(Array.isArray(value)?value.join(';'):value).replaceAll('"','""')+'"';fs.writeFileSync(directory+'/inventory.csv','\ufeff'+keys.join(',')+'\n'+rows.map(row=>keys.map(key=>csv(row[key])).join(',')).join('\n'));
console.log(JSON.stringify({tools:rows.length,toolsWithExplicitNamedTests:rows.filter(row=>row.namedTestFiles.length).length,inventory:directory+'/inventory.json',limits:'Named coverage is not complete execution coverage; providers and production charging remain separately classified.'}));
