const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const source=ts.createSourceFile('RareImageConvertWorkbench.tsx',fs.readFileSync(process.argv[2]||'components/tools/RareImageConvertWorkbench.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const fn=source.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='decode');
assert(fn,'exercise the shipped image decoder');
const code=ts.transpileModule(fn.getText(source)+'\nexports.decode=decode;', {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
(async()=>{
 for(const mode of['broken','fallback','bitmap']){
  const active=new Set();let closed=0,draws=0;
  const context={exports:{},createImageBitmap:async()=>{if(mode!=='bitmap')throw Error('unsupported');return{width:13,height:17,close(){closed++}}},URL:{createObjectURL(){const url='blob:'+Math.random();active.add(url);return url},revokeObjectURL(url){active.delete(url)}},Image:class{naturalWidth=13;naturalHeight=17;set src(_value){queueMicrotask(()=>mode==='broken'?this.onerror():this.onload())}}};
  vm.runInNewContext(code,context);
  if(mode==='broken'){
   for(let attempt=0;attempt<3;attempt++){await assert.rejects(context.exports.decode({}),/IMAGE_DECODE_UNSUPPORTED/);assert.equal(active.size,0)}
  }else{
   const decoded=await context.exports.decode({});assert.equal(decoded.width,13);assert.equal(decoded.height,17);
   decoded.draw({drawImage(){draws++}});assert.equal(draws,1);decoded.close();assert.equal(active.size,0);
   assert.equal(closed,mode==='bitmap'?1:0);
  }
 }
 console.log('PASS: shipped decoder releases failed/successful fallback URLs and successful bitmaps.');
})().catch(error=>{console.error(error);process.exitCode=1});
