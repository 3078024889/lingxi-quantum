const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript'),pdf=require('pdf-lib');
const exportsObject={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/tools/shared/pdf-annotations.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:exportsObject,require});
const {removePdfComments}=exportsObject,{PDFDocument,PDFName,PDFDict}=pdf;
(async()=>{
 const doc=await PDFDocument.create(),page=doc.addPage([400,300]),form=doc.getForm();
 page.drawText('Keep original page content',{x:20,y:250});
 const text=form.createTextField('customer');text.setText('AUDIT CUSTOMER');text.addToPage(page,{x:20,y:190,width:250,height:30});
 const check=form.createCheckBox('approved');check.addToPage(page,{x:20,y:140,width:20,height:20});check.check();
 const dropdown=form.createDropdown('plan');dropdown.addOptions(['BASIC','PREMIUM']);dropdown.select('PREMIUM');dropdown.addToPage(page,{x:20,y:90,width:250,height:30});
 for(const subtype of ['Text','Highlight','Stamp'])page.node.Annots().push(doc.context.register(doc.context.obj({Type:'Annot',Subtype:subtype,Rect:[10,10,30,30],Contents:'Private comment'})));
 const input=await doc.save(),loaded=await PDFDocument.load(input);assert.equal(loaded.getPage(0).node.Annots().size(),6);
 assert.equal(removePdfComments(loaded),3);const out=await PDFDocument.load(await loaded.save());
 assert.equal(out.getPageCount(),1);assert.equal(out.getForm().getFields().length,3);assert.equal(out.getPage(0).node.Annots().size(),3);
 assert(!out.context.enumerateIndirectObjects().some(([,obj])=>obj.toString().includes('Private comment')),'removed comment dictionaries must not remain as saved orphan objects');
 for(const ref of out.getPage(0).node.Annots().asArray())assert.equal(out.context.lookup(ref,PDFDict).get(PDFName.of('Subtype')).toString(),'/Widget');
 assert.equal(out.getForm().getTextField('customer').getText(),'AUDIT CUSTOMER');assert.equal(out.getForm().getCheckBox('approved').isChecked(),true);assert.equal(out.getForm().getDropdown('plan').getSelected()[0],'PREMIUM');assert(out.getPage(0).node.Contents());
 out.getForm().getTextField('customer').setText('STILL EDITABLE');const edited=await PDFDocument.load(await out.save());assert.equal(edited.getForm().getTextField('customer').getText(),'STILL EDITABLE');
 const ordinary=await PDFDocument.create(),p=ordinary.addPage();p.node.set(PDFName.of('Annots'),ordinary.context.obj([ordinary.context.register(ordinary.context.obj({Type:'Annot',Subtype:'Text',Rect:[1,1,10,10]}))]));assert.equal(removePdfComments(ordinary),1);assert(!p.node.has(PDFName.of('Annots')));
 if(process.argv[2]&&process.argv[3]){const real=await PDFDocument.load(fs.readFileSync(process.argv[2]));removePdfComments(real);fs.writeFileSync(process.argv[3],await real.save());const reopened=await PDFDocument.load(fs.readFileSync(process.argv[3]));console.log(JSON.stringify({privateSample:{pages:reopened.getPageCount(),widgets:reopened.getPages().map(p=>p.node.Annots()?.size()||0),fields:reopened.getForm().getFields().map(f=>f.getName())}}))}
 console.log('PASS: actual comment remover clears Text/Highlight/Stamp, preserves form widgets, canonical fields, values and page content; saved output remains editable. Ordinary comments removed.');
})().catch(e=>{console.error(e);process.exitCode=1});
