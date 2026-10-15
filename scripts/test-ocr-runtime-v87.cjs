const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createWorker}=require('tesseract.js');
const base=path.resolve('public/media/ocr-7.0.0-v1');
const options={langPath:path.join(base,'lang'),cacheMethod:'none',errorHandler:()=>{}};
async function bounded(promise){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('WORKER_PROMISE_HUNG')),15000)})])}finally{clearTimeout(timer)}}
async function main(){
 const manifest=JSON.parse(fs.readFileSync(path.join(base,'manifest.json'),'utf8'));
 for(const asset of manifest.assets){const bytes=fs.readFileSync(path.join(base,asset.file));assert.equal(bytes.length,asset.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.sha256)}
 assert.equal(manifest.assets.filter(a=>a.file.endsWith('.traineddata.gz')).length,10);
 await assert.rejects(bounded(createWorker('missing',1,options)),error=>!/WORKER_PROMISE_HUNG/.test(error.message),'language errors must reject initialization');
 const aborted=new AbortController();aborted.abort(Error('FIXTURE_ABORTED'));
 await assert.rejects(bounded(createWorker('eng',1,{...options,abortSignal:aborted.signal})),/FIXTURE_ABORTED/);
 const controller=new AbortController();const worker=await bounded(createWorker('eng',1,{...options,abortSignal:controller.signal}));
 const sharp=require('sharp');const png=await sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="200"><rect width="1000" height="200" fill="white"/><text x="30" y="120" font-size="64" font-family="Arial" font-weight="bold">HELLO WORLD 12345</text></svg>')).png().toBuffer();
 try{assert.match((await worker.recognize(png)).data.text,/HELLO WORLD 12345/)}finally{await worker.terminate()}
 const pendingController=new AbortController();const pending=createWorker('eng',1,{...options,abortSignal:pendingController.signal});pendingController.abort(Error('FIXTURE_INIT_ABORT'));
 await assert.rejects(bounded(pending),/FIXTURE_INIT_ABORT/);
 console.log('PASS: local runtime hashes and ten language assets; missing-language rejection; pre-abort and initialization abort; real English OCR text and worker cleanup. No external services.');
}
main().catch(error=>{console.error(error);process.exitCode=1});
