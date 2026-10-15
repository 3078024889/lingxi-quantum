const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const {PDFDocument,PDFName,PDFString,PDFDict,PDFRawStream}=require('pdf-lib');
const mod={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync('lib/tools/shared/pdf-metadata.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(require,mod,mod.exports);
const {cleanPdfMetadata,inspectPdfMetadata}=mod.exports;
async function main(){
 const dir='_local/handoff/pdf-metadata-20261015';fs.mkdirSync(dir,{recursive:true});
 const url='https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
 const response=await fetch(url,{signal:AbortSignal.timeout(20000)});assert(response.ok);const original=new Uint8Array(await response.arrayBuffer());fs.writeFileSync(path.join(dir,'w3c-original.pdf'),original);
 const baseline=await PDFDocument.load(original,{updateMetadata:false});
 const source=await PDFDocument.load(original,{updateMetadata:false});source.setAuthor('Metadata Author Fixture');source.setTitle('Metadata Title Fixture');source.setCreationDate(new Date('2001-01-01T00:00:00Z'));
 const info=source.context.lookup(source.context.trailerInfo.Info,PDFDict);info.set(PDFName.of('CustomSecret'),PDFString.of('Custom Secret Fixture'));
 const xmp=source.context.register(source.context.stream('<x:xmpmeta>Secret XMP Fixture</x:xmpmeta>',{Type:'Metadata',Subtype:'XML'}));source.catalog.set(PDFName.of('Metadata'),xmp);
 source.getPage(0).node.set(PDFName.of('Metadata'),source.context.register(source.context.stream('<x:xmpmeta>Page Secret Fixture</x:xmpmeta>',{Type:'Metadata',Subtype:'XML'})));
 const fixture=await source.save();fs.writeFileSync(path.join(dir,'w3c-with-test-metadata.pdf'),fixture);
 // Reproduce the previous implementation: XMP, dates and custom keys survive.
 const old=await PDFDocument.load(fixture);for(const name of ['Title','Author','Subject','Creator','Producer'])old['set'+name]('');old.setKeywords([]);
 const oldSnapshot=inspectPdfMetadata(await PDFDocument.load(await old.save(),{updateMetadata:false}));assert(oldSnapshot.xmpStreams===2&&oldSnapshot.fields.CustomSecret&&oldSnapshot.fields.CreationDate);
 for(const [name,bytes] of [['w3c-clean.pdf',original],['w3c-augmented-clean.pdf',fixture]]){
  const output=await cleanPdfMetadata(bytes);fs.writeFileSync(path.join(dir,name),output.bytes);
  assert.deepEqual(output.after,{fields:{},xmpStreams:0});
  const reopened=await PDFDocument.load(output.bytes,{updateMetadata:false});assert.equal(reopened.getPageCount(),baseline.getPageCount());
  const contents=d=>d.context.enumerateIndirectObjects().filter(([,o])=>o instanceof PDFRawStream&&!o.dict.has(PDFName.of('Subtype'))).map(([,o])=>Buffer.from(o.contents).toString('base64'));
  assert.deepEqual(contents(reopened),contents(baseline),'page/font content bytes must stay unchanged');
 }
 await assert.rejects(cleanPdfMetadata(new Uint8Array([1,2,3])));
 fs.writeFileSync(path.join(dir,'verification.json'),JSON.stringify({source:url,fixture:'W3C PDF with explicitly seeded test metadata',baselineFailure:oldSnapshot,verified:['Info','custom keys','dates','catalog XMP','page XMP','unchanged page/font streams','invalid PDF rejection']},null,2));
 console.log('PASS real W3C PDF; baseline XMP/date/custom-key failure reproduced; outputs reopened; page/font bytes preserved; invalid input rejected.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
