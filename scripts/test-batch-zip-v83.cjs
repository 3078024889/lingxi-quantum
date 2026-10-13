const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict'),JSZip=require('jszip');
function load(file){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{exports,Blob,require:name=>name==='./download'?load('lib/tools/shared/download.ts'):require(name)});return exports}
(async()=>{
 const {filesToZip}=load('lib/tools/shared/batch-files.ts');
 const names=['image.jpg','image.jpg','image-2.jpg','IMAGE.JPG','../private/file.txt','.'];
 const archive=await filesToZip(names.map((name,i)=>({name,blob:new Blob(['payload-'+i])})));
 const zip=await JSZip.loadAsync(await archive.blob.arrayBuffer());const entries=Object.keys(zip.files);assert.equal(entries.length,names.length);assert.equal(new Set(entries.map(name=>name.toLowerCase())).size,names.length);assert(entries.every(name=>!name.includes('/')&&!name.includes('\\')&&name!=='.'&&name!=='..'));
 const payloads=await Promise.all(entries.map(name=>zip.file(name).async('string')));assert.deepEqual(payloads.sort(),names.map((_,i)=>'payload-'+i).sort());
 await assert.rejects(()=>filesToZip([{name:'large',blob:{size:257*1024*1024}}]),/ZIP_INPUT_TOO_LARGE/);
 await assert.rejects(()=>filesToZip(Array.from({length:1001},()=>({name:'x',blob:{size:0}}))),/ZIP_INPUT_TOO_LARGE/);
 console.log('PASS: actual ZIP round trip preserves colliding/case-colliding names and all payloads; paths sanitized; file count/byte bounds reject before reading data. No network.');
})().catch(error=>{console.error(error);process.exitCode=1});
