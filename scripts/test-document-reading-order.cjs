// Exercise the actual SASI server extractor, not a second implementation.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript'),JSZip=require('jszip');
const cache=new Map();
function load(file){
 file=path.resolve(file);if(cache.has(file))return cache.get(file);
 const exports={};cache.set(file,exports);
 const localRequire=name=>{
  if(name==='server-only')return {};
  if(name.startsWith('@/'))return load(name.slice(2)+'.ts');
  if(name.startsWith('.'))return load(path.join(path.dirname(file),name)+'.ts');
  return require(name);
 };
 const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 vm.runInNewContext(source,{exports,require:localRequire,Buffer,Blob,TextDecoder,TextEncoder,URL,console});return exports;
}
async function zipBytes(parts){const zip=new JSZip();for(const [name,raw]of Object.entries(parts))zip.file(name,raw);const out=await zip.generateAsync({type:'nodebuffer'});return out.buffer.slice(out.byteOffset,out.byteOffset+out.byteLength)}
(async()=>{
 const fixtures=load('tests/final-closure/document-reading-fixtures.ts');
 const {extractStructuredDocument:extract}=load(process.argv[2]||'lib/sasi/document-extract.ts');
 const text=await extract('pptx',await zipBytes(fixtures.presentationParts));
 assert.equal(text,fixtures.presentationText.replace(/^# Slide (\d+)/gm,'## 幻灯片 $1'));
 assert.equal(await extract('odt',await zipBytes(fixtures.odtParts)),fixtures.odtText);
 const bad={...fixtures.presentationParts};delete bad['ppt/slides/second slide.xml'];
 await assert.rejects(extract('pptx',await zipBytes(bad)),/PPTX_SLIDE_MISSING/);
 const malformed={...fixtures.presentationParts,'ppt/presentation.xml':'<unclosed>'};
 await assert.rejects(extract('pptx',await zipBytes(malformed)),/PPTX_XML_INVALID/);
 const huge={...fixtures.odtParts,'content.xml':fixtures.odtParts['content.xml'].replace('txt:c="3"','txt:c="1000000000"')};
 await assert.rejects(extract('odt',await zipBytes(huge)),/ODT_SPACE_COUNT_INVALID/);
 console.log('PASS: actual SASI extractor uses declared PPTX order and namespace-aware runs, skips orphan parts, preserves ODT whitespace, rejects missing/malformed/oversized expansion, closes server XML windows. No model calls.');
})().catch(error=>{console.error(error);process.exitCode=1});
