const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');const{PDFDocument}=require('pdf-lib');
const Module=require('module'),path=require('path');const mod=new Module(path.resolve('lib/tools/shared/pdf-tools.ts'),module);mod.filename=path.resolve('lib/tools/shared/pdf-tools.ts');mod.paths=module.paths;mod._compile(ts.transpileModule(fs.readFileSync(mod.filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,mod.filename);const box={exports:mod.exports};
(async()=>{
 const a=await PDFDocument.create();a.addPage([200,300]);const b=await PDFDocument.create();b.addPage([400,500]);b.addPage([600,700]);
 const af=new File([await a.save()],'a.pdf',{type:'application/pdf'}),bf=new File([await b.save()],'b.pdf',{type:'application/pdf'});
 const merged=await box.exports.mergePdfs([af,bf]);const result=await PDFDocument.load(await merged.arrayBuffer());assert.equal(result.getPageCount(),3);assert.deepEqual(result.getPages().map(p=>p.getWidth()),[200,400,600]);
 const extracted=await box.exports.splitPdf(new File([merged],'merged.pdf'),[3,1]);const selected=await PDFDocument.load(await extracted.arrayBuffer());assert.deepEqual(selected.getPages().map(p=>p.getWidth()),[600,200]);await assert.rejects(()=>box.exports.splitPdf(af,[0,99]));
 const png=await require('sharp')({create:{width:120,height:80,channels:3,background:'#20a080'}}).png().toBuffer();const imagePdf=await box.exports.imagesToPdf([new File([png],'fixture.png',{type:'image/png'})]);const imageResult=await PDFDocument.load(await imagePdf.arrayBuffer());assert.equal(imageResult.getPageCount(),1);assert.equal(imageResult.getPage(0).getWidth()/imageResult.getPage(0).getHeight(),1.5);
 await assert.rejects(()=>box.exports.mergePdfs([new File(['not a PDF'],'bad.pdf')]));
 console.log('PASS: real PDF merge, page ordering/extraction, invalid page rejection, PNG-to-PDF aspect ratio and corrupt-file rejection.');
})().catch(e=>{console.error(e);process.exitCode=1});
