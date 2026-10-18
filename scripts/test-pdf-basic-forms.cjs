const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const pdf=require('pdf-lib'),{PDFDocument,PDFName,PDFDict,PDFRawStream,decodePDFRawStream,degrees}=pdf;
const helper={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/tools/shared/pdf-flatten.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:helper,require,Error});
const source=ts.createSourceFile('workbench.tsx',fs.readFileSync(process.argv[2]||'components/tools/PdfBasicWorkbench.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),methods=[];
function visit(n){if(ts.isFunctionDeclaration(n)&&['merge','extract','rotate'].includes(n.name?.text))methods.push(n.getText(source));ts.forEachChild(n,visit)}visit(source);
assert.equal(methods.length,3);const code=ts.transpileModule(methods.join('\n')+'\nexports.run={merge,extract,rotate}',{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
(async()=>{
 const doc=await PDFDocument.create(),page=doc.addPage(),form=doc.getForm(),field=form.createTextField('customer');field.setText('AUDIT CUSTOMER');field.addToPage(page,{x:20,y:400,width:200,height:30});const check=form.createCheckBox('approved');check.addToPage(page,{x:20,y:350,width:20,height:20});check.check();
 const bytes=await doc.save(),file={arrayBuffer:async()=>bytes};
 for(const mode of ['merge','extract','rotate']){
  let result;const context={exports:{},PDFDocument,degrees,flattenPdfForm:helper.flattenPdfForm,files:[file,file],first:file,range:'1',c:{badRange:'bad'},parsePages:()=>[0],pdfBlob:b=>b,wrap:async(_name,fn)=>{result=await fn()}};
  vm.runInNewContext(code,context);await context.exports.run[mode]();const out=await PDFDocument.load(result,{updateMetadata:false});assert.equal(out.getPageCount(),mode==='merge'?2:1);
  if(mode==='rotate'){assert.equal(out.getPage(0).getRotation().angle,90);assert.equal(out.getForm().getTextField('customer').getText(),'AUDIT CUSTOMER');assert.equal(out.getForm().getCheckBox('approved').isChecked(),true);continue}
  assert.equal(out.getForm().getFields().length,0);for(const page of out.getPages()){assert.equal(page.node.Annots()?.size()||0,0,'copied page must not carry orphan form widgets');assert(page.node.Resources().lookup(PDFName.of('XObject'),PDFDict).keys().length>=2,'text and checkbox appearances retained')}
  assert(out.context.enumerateIndirectObjects().some(([,obj])=>obj instanceof PDFRawStream&&Buffer.from(decodePDFRawStream(obj).decode()).toString().includes(Buffer.from('AUDIT CUSTOMER').toString('hex').toUpperCase())),'actual filled text retained in copied appearances');
 }
 console.log('PASS: shipped PDF basic merge/extract retain filled appearances without orphan widgets; rotate preserves editable field values. No payment.');
})().catch(e=>{console.error(e);process.exitCode=1});
