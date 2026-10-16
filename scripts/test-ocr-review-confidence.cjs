const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
const source=ts.createSourceFile('OcrWorkbench.tsx',fs.readFileSync('components/tools/OcrWorkbench.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
let run;
function visit(node){if(ts.isFunctionDeclaration(node)&&node.name?.text==='run')run=node;ts.forEachChild(node,visit)}visit(source);
assert(run,'exercise the real OCR run callback');
const code=ts.transpileModule(run.getText(source)+'\nexports.run=run;',{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
(async()=>{
 for(const [confidence,expected]of [[15,'REVIEW'],[95,'DONE'],[undefined,'REVIEW']]){
  const stages=[],outputs=[],errors=[];let terminated=0;
  const context={exports:{},AbortController,files:[{name:'sample.png'}],ocrLang:'eng',controller:{current:null},runtimeCopy:{loading:'LOAD',review:'REVIEW',cancelled:'CANCEL',empty:'EMPTY',error:'ERROR'},c:{done:'DONE'},setBusy(){},setResults:v=>outputs.push(v),setError:v=>errors.push(v),setCopied(){},setStage:v=>stages.push(v),createOcrWorker:async()=>({recognize:async(_file,options)=>{assert.equal(options.tessedit_pageseg_mode,'3');return{data:{text:'OCR output requiring review',confidence}}},terminate:async()=>{terminated++}})};
  vm.runInNewContext(code,context);await context.exports.run();
  assert.equal(stages.at(-1),expected);assert.equal(outputs.at(-1)[0].text,'OCR output requiring review');
  assert.equal(outputs.at(-1)[0].confidence,confidence);assert.equal(terminated,1);assert.equal(context.controller.current,null);assert.equal(errors.at(-1),'');
 }
 console.log('PASS: actual OCR callback distinguishes low/unknown confidence, preserves reviewable text and releases worker.');
})().catch(e=>{console.error(e);process.exitCode=1});
