const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const {PDFDocument,PDFName,PDFString,PDFDict,PDFRawStream,decodePDFRawStream}=require('pdf-lib');
const code=ts.transpileModule(fs.readFileSync('lib/tools/shared/pdf-flatten.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const exportsObject={};vm.runInNewContext(code,{exports:exportsObject,require,Error});
(async()=>{
 for(const keepLink of[false,true]){
  const doc=await PDFDocument.create(),page=doc.addPage(),form=doc.getForm();
  const field=form.createTextField('name');field.setText('AUDIT CUSTOMER');field.addToPage(page,{x:20,y:400,width:200,height:30});
  const check=form.createCheckBox('approved');check.addToPage(page,{x:20,y:350,width:20,height:20});check.check();
  let link;if(keepLink){link=doc.context.register(doc.context.obj({Type:'Annot',Subtype:'Link',Rect:[0,0,100,20],A:{Type:'Action',S:'URI',URI:PDFString.of('https://example.com')}}));page.node.Annots().push(link)}
  exportsObject.flattenPdfForm(doc);
  const output=await PDFDocument.load(await doc.save(),{updateMetadata:false});assert.equal(output.getForm().getFields().length,0);
  const annotations=output.getPage(0).node.Annots();assert.equal(annotations?.size()||0,keepLink?1:0);
  if(keepLink){const annotation=output.context.lookup(annotations.get(0),PDFDict);assert.equal(annotation.get(PDFName.of('Subtype')).toString(),'/Link')}
  const appearance=output.getPage(0).node.Resources().lookup(PDFName.of('XObject'),PDFDict);assert(appearance.keys().length>=2,'filled field appearances retained');
  assert(output.context.enumerateIndirectObjects().some(([,obj])=>obj instanceof PDFRawStream&&Buffer.from(decodePDFRawStream(obj).decode()).toString().includes(Buffer.from('AUDIT CUSTOMER').toString('hex').toUpperCase())),'filled text remains in appearance stream');
 }
 console.log('PASS: real form output retains filled appearances, removes dangling widgets, preserves valid links and reopens.');
})().catch(error=>{console.error(error);process.exitCode=1});
