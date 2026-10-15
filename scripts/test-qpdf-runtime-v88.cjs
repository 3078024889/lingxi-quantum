const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {PDFDocument}=require('pdf-lib'),{chromium}=require('playwright'),ts=require('typescript');
async function main(){
 const root=path.resolve(path.dirname(require.resolve('qpdf-run/worker')),'..');
 const assets=path.resolve('public/media/qpdf-0.2.1-v1');
 const server=http.createServer((req,res)=>{
  const name=req.url.split('?')[0];if(name==='/'){res.end('<html><script type="module">import {createQpdfRunner} from "/src/index.js";window.createQpdfRunner=createQpdfRunner;</script></html>');return}
  const match=name.match(/^\/(src|assets)\/([\w.-]+)$/);if(!match){res.writeHead(404).end();return}
  const file=path.join(match[1]==='src'?path.join(root,'src'):assets,match[2]);if(!fs.existsSync(file)){res.writeHead(404).end();return}
  res.setHeader('Content-Type',file.endsWith('.wasm')?'application/wasm':'application/javascript');res.end(fs.readFileSync(file));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage();await page.addInitScript(()=>{window.__workers=[];const Native=window.Worker;window.Worker=class extends Native{constructor(...args){super(...args);window.__workers.push(this)}terminate(){window.__workers=window.__workers.filter(w=>w!==this);super.terminate()}}});
  await page.goto(origin);await page.waitForFunction(()=>window.createQpdfRunner);
  const doc=await PDFDocument.create();doc.addPage([400,300]).drawText('First page');doc.addPage([400,300]).drawText('Second page');const bytes=[...await doc.save()];
  const result=await page.evaluate(async bytes=>{
   const options={workerUrl:location.origin+'/assets/worker.js',qpdfJsUrl:location.origin+'/assets/qpdf.js',wasmUrl:location.origin+'/assets/qpdf.wasm',timeoutMs:10000};
   let failed=false;try{await window.createQpdfRunner({...options,qpdfJsUrl:location.origin+'/assets/missing.js'})}catch{failed=true}
   if(!failed||window.__workers.length)throw Error('FAILED_INIT_LEAKS_WORKER');
   const q=await window.createQpdfRunner(options);const input=()=>new Uint8Array(bytes);let stage="start";
   try{
    stage="count";const count=await q.run({inputs:{'input.pdf':input()},args:['--show-npages','input.pdf'],outputs:[]});
    stage="linear";const linear=await q.runOne({input:input(),inputName:'input.pdf',outputName:'output.pdf',args:['--linearize','--','input.pdf','output.pdf']});
    stage="encrypted";const encrypted=await q.runOne({input:input(),inputName:'input.pdf',outputName:'output.pdf',args:['input.pdf','output.pdf','--encrypt','--user-password=test-pass','--owner-password=owner-pass','--bits=256','--']});
    let badPassword=false;try{await q.runOne({input:new Uint8Array(encrypted),inputName:'input.pdf',outputName:'output.pdf',args:['--password=wrong','--decrypt','--','input.pdf','output.pdf']})}catch{badPassword=true}
    stage="unlocked";const unlocked=await q.runOne({input:new Uint8Array(encrypted),inputName:'input.pdf',outputName:'output.pdf',args:['--password=test-pass','--decrypt','--','input.pdf','output.pdf']});
    stage="attached";const attached=await q.run({inputs:{'input.pdf':input(),'attachment.bin':new TextEncoder().encode('Attachment payload')},args:['input.pdf','--add-attachment','attachment.bin','--filename=input.pdf','--key=input.pdf','--','output.pdf'],outputs:['output.pdf']});
    const key='input.pdf';
    stage="removed";const removed=await q.runOne({input:new Uint8Array(attached.outputs['output.pdf']),inputName:'input.pdf',outputName:'output.pdf',args:['input.pdf','--remove-attachment='+key,'output.pdf']});
    return {count:count.stdout.join('\n'),linear:[...linear],encrypted:[...encrypted],unlocked:[...unlocked],attached:[...attached.outputs['output.pdf']],removed:[...removed],key,badPassword};
   }catch(error){throw Error(JSON.stringify({stage,message:error.message,code:error.code,stderr:error.stderr,stdout:error.stdout}))}finally{await q.destroy()}
  },bytes);
  assert.equal(result.count.trim(),'2');assert(result.badPassword);assert.match(Buffer.from(result.linear).subarray(0,1024).toString('latin1'),/\/Linearized/);assert.equal((await PDFDocument.load(new Uint8Array(result.unlocked))).getPageCount(),2);await assert.rejects(PDFDocument.load(new Uint8Array(result.encrypted)));
  const module={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync('lib/tools/shared/pdf-structure.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(require,module,module.exports);
  assert.deepEqual((await module.exports.readPdfStructure(new Uint8Array(result.attached))).attachments,['input.pdf']);assert.deepEqual((await module.exports.readPdfStructure(new Uint8Array(result.removed))).attachments,[]);
  assert.equal(await page.evaluate(()=>window.__workers.length),0);
  const dir='_local/handoff/qpdf-runtime-20261015';fs.mkdirSync(dir,{recursive:true});for(const name of ['linear','encrypted','unlocked','attached','removed'])fs.writeFileSync(path.join(dir,name+'.pdf'),Buffer.from(result[name]));
  console.log('PASS real browser qpdf WASM: failed-init worker cleanup, stdout inspection, linearization, AES encryption, bad-password failure, unlock and attachment add/remove. No external services.');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
}
main().catch(error=>{console.error(error);process.exitCode=1});
