const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript');
const {PDFDocument,PDFName,PDFString}=require('pdf-lib');const moduleValue={exports:{}};
new Function('require','module','exports',ts.transpileModule(fs.readFileSync('lib/tools/shared/pdf-structure.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(require,moduleValue,moduleValue.exports);
async function main(){
 const d=await PDFDocument.create();d.addPage([400,300]);d.addPage([400,300]);await d.attach(new Uint8Array([1,2,3]),'中文附件.txt');
 await d.flush();const target=d.context.obj([d.getPage(1).ref,PDFName.of('Fit')]);
 const named=d.context.obj({Names:[PDFString.of('chapter'),target]});const names=d.catalog.lookup(PDFName.of('Names'));names.set(PDFName.of('Dests'),named);
 const child=d.context.obj({Title:PDFString.of('Child bookmark'),Dest:target});const childRef=d.context.register(child);
 const first=d.context.obj({Title:PDFString.of('First bookmark'),Dest:PDFString.of('chapter'),First:childRef});const firstRef=d.context.register(first);d.catalog.set(PDFName.of('Outlines'),d.context.obj({First:firstRef}));
 const bytes=await d.save();const result=await moduleValue.exports.readPdfStructure(bytes);
 assert.equal(result.pages,2);assert.deepEqual(result.attachments,['中文附件.txt']);assert.equal(result.outlines[0].destpageposfrom1,2);assert.equal(result.outlines[0].kids[0].destpageposfrom1,2);
 child.set(PDFName.of('Next'),firstRef);await assert.rejects(moduleValue.exports.readPdfStructure(await d.save()),/PDF_STRUCTURE_CYCLE/);
 console.log('PASS PDF structure: actual Unicode attachment key, nested named/direct bookmark destinations, page count and outline-cycle rejection. No external services.');
}
main().catch(error=>{console.error(error);process.exitCode=1});
