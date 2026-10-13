const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict'),JSZip=require('jszip');
const cache=new Map();
function load(file){if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{exports,Blob,TextEncoder,TextDecoder,require:name=>name==='@/lib/files/bounded-archive'?load('lib/files/bounded-archive.ts'):name==='@/lib/files/document-intake'?{}:require(name)});return exports}
async function fixture(files){const zip=new JSZip();for(const [name,value] of Object.entries(files))zip.file(name,value);return new Blob([await zip.generateAsync({type:'uint8array',compression:'DEFLATE'})])}
(async()=>{
 const {openBoundedArchive:open,readArchiveText:read,ARCHIVE_LIMITS:L}=load('lib/files/bounded-archive.ts');
 const zip=await open(await fixture({'empty':'','中文.xml':'你好 🌍'}));assert.equal(await read(zip,'中文.xml'),'你好 🌍');assert.equal(await read(zip,'empty'),'');assert.equal(await read(zip,'missing'),undefined);
 await assert.rejects(()=>open({size:L.compressedBytes+1,arrayBuffer(){throw Error('must not read')}}),/ARCHIVE_INPUT_TOO_LARGE/);
 await assert.rejects(()=>open(new Blob(['invalid'])),/zip|central directory/i);
 const many={};for(let i=0;i<=L.entries;i++)many['f'+i]='';await assert.rejects(async()=>open(await fixture(many)),/ARCHIVE_ENTRY_LIMIT/);
 const big=await open(await fixture({'large':'a'.repeat(L.textEntryBytes+1)}));await assert.rejects(()=>read(big,'large'),/ARCHIVE_TEXT_TOO_LARGE/);
 // Forged metadata must not bypass the streamed byte counter.
 big.file('large')._data.uncompressedSize=1;await assert.rejects(()=>read(big,'large'),/ARCHIVE_TEXT_TOO_LARGE/);
 const budget=await open(await fixture({'part':'b'.repeat(L.textEntryBytes)}));for(let i=0;i<4;i++)assert.equal((await read(budget,'part')).length,L.textEntryBytes);await assert.rejects(()=>read(budget,'part'),/ARCHIVE_TEXT_TOO_LARGE/);
 await assert.rejects(()=>read(new JSZip().file('x','x'),'x'),/ARCHIVE_NOT_VALIDATED/);
 const {detectFileType}=load('lib/tools/shared/magic-bytes.ts');
 const doc=await fixture({'[Content_Types].xml':'<Types/>','word/document.xml':'<document/>'});doc.name='renamed.bin';assert.equal((await detectFileType(doc)).ext,'docx');
 const {xlsxToCsvFiles}=load('lib/tools/shared/office-convert.ts');
 async function csv(xml){const file=await fixture({'xl/worksheets/sheet1.xml':'<worksheet><sheetData>'+xml+'</sheetData></worksheet>'});file.name='sample.xlsx';return xlsxToCsvFiles(file)}
 const out=await csv('<row r="1"><c><v>12</v></c><c><v>34</v></c></row><row r="3"><c r="B3"><v>56</v></c></row>');assert.equal(await out[0].blob.text(),'12,34\r\n\r\n,56');assert.equal(out[0].rows,3);assert.equal(out[0].columns,2);
 const last=await csv('<row r="1"><c r="XFD1"><v>7</v></c></row>');assert.equal(last[0].columns,16384);
 for(const [xml,error] of [['<row r="1"><c r="XFE1"><v>1</v></c></row>','XLSX_COLUMN_INVALID'],['<row r="1"><c r="ZZZZZZZZZZZZZZ1"><v>1</v></c></row>','XLSX_COLUMN_INVALID'],['<row r="1048577"><c><v>1</v></c></row>','XLSX_ROW_INVALID'],['<row r="1"><c r="A2"><v>1</v></c></row>','XLSX_CELL_REFERENCE_INVALID'],['<row r="1"></row><row r="1"></row>','XLSX_ROW_INVALID']])await assert.rejects(()=>csv(xml),new RegExp(error));
 console.log('PASS: real ZIP Unicode/empty entries; compressed/count/inflation/cumulative bounds; forged size; XLSX blank rows, missing references, valid final column and hostile coordinates. No network.');
})().catch(error=>{console.error(error);process.exitCode=1});
