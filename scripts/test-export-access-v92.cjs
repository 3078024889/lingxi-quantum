const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const location={pathname:'/tools/video-toolkit',href:'https://local.test/tools/video-toolkit'};const cache=new Map();
function load(file){if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,location,Blob,crypto,require:n=>load('lib/tools/commerce/'+n.replace('./','')+'.ts')});return exports}
(async()=>{
 const access=load('lib/tools/commerce/export-access-client.ts'),catalog=load('lib/tools/commerce/metered-catalog.ts');let calls=[],accept=true;
 assert.equal(catalog.DAILY_FREE_EXPORTS,5);assert(!catalog.isMeteredTool('pdf-redact'));assert(!catalog.isMeteredTool('pdf-to-xlsx'));
 access.installExportGate(async r=>{calls.push(r);return accept});
 const one=new Blob(['one']),two=new Blob(['two']);await access.ensureToolExportAccess(one,'one.txt');await access.ensureToolExportAccess(one,'one.txt','share');assert.equal(calls.length,1);
 const zip=new Blob(['zip']);access.registerExportBundle(zip,[one,two]);await access.ensureToolExportAccess(zip,'results.zip');assert.equal(calls.at(-1).units,1);await access.ensureToolExportAccess(two,'two.txt');assert.equal(calls.length,2);
 const a=new Blob(['a']),b=new Blob(['b']),pending=new Blob(['ab']);access.registerExportBundle(pending,[a,b]);accept=false;await assert.rejects(access.ensureToolExportAccess(pending,'pending.zip'),/EXPORT_CANCELLED/);const reserved=calls.at(-1);accept=true;await access.ensureToolExportAccess(a,'a.txt');assert.equal(calls.at(-1).id,reserved.id);assert.equal(calls.at(-1).units,2);const count=calls.length;await access.ensureToolExportAccess(b,'b.txt');await access.ensureToolExportAccess(pending,'pending.zip');assert.equal(calls.length,count);
 location.pathname='/tools/pdf-redact';await access.ensureToolExportAccess(new Blob(['paid']),'paid.pdf');assert.equal(calls.length,count);
 location.pathname='/tools/png-to-jpg';await access.ensureToolExportAccess(one,'one.txt');assert.equal(calls.length,count+1);
 console.log('EXPORT_ACCESS_CLIENT=PASS: per-tool identity, repeated save/share, real bundle units, prior member grants, cancelled bundle retry, frozen composition and original paid-tool bypass');
})().catch(e=>{console.error(e);process.exitCode=1});
