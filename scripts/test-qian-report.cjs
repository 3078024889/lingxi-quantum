const fs=require("node:fs");
const path=require("node:path");
const Module=require("node:module");
const ts=require("typescript");

const root=path.resolve(__dirname,"..");
const originalResolve=Module._resolveFilename;
Module._resolveFilename=function(request,parent,isMain,options){
  if(request.startsWith("@/"))request=path.join(root,request.slice(2));
  return originalResolve.call(this,request,parent,isMain,options);
};
require.extensions[".ts"]=function(module,filename){
  const source=fs.readFileSync(filename,"utf8");
  const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,resolveJsonModule:true}}).outputText;
  module._compile(output,filename);
};

const assert=require('node:assert/strict');
const {LIFE_SIGNS}=require(path.join(root,'lib/qian-data.ts'));
const {generateStaticQianReport}=require(path.join(root,'lib/qian-knowledge.ts'));
const {computeLifeVector}=require(path.join(root,'lib/life-vector.ts'));
const {computeLifeMapFacts}=require(path.join(root,'lib/lifemap-calc.ts'));
const pools=['origin','soul','walker'].map(t=>LIFE_SIGNS.filter(s=>s.tier===t));
let count=0;
for(let i=0;i<LIFE_SIGNS.length;i++){
 const sign=LIFE_SIGNS[i];
 const signs=pools.map(pool=>pool.find(s=>s.index===sign.index)||pool[i%pool.length]);
 const vector=computeLifeVector(computeLifeMapFacts({year:1960+i,month:i%12+1,day:i%28+1,hour:i%24,minute:0,hasTime:i%2===0}));
 for(const lang of ['zh','en']){
  const input={signs,vector,seed:'qian-regression-'+i,lang};
  const report=generateStaticQianReport(input);
  assert.equal((report.fullReport.match(/===\s*\d+\s*===/g)||[]).length,11);
  assert.equal(report.traces.length,11);
  assert.ok(report.traces.every(t=>t.safetyFlags.length===0));
  assert.equal(report.fullReport,generateStaticQianReport(input).fullReport);
  count++;
 }
}
console.log('PASS: all 64 signs, '+count+' bilingual reports, 11 chapters, deterministic and publication-safe.');
