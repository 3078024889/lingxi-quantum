// Keep the JS loader and WASM from the SAME dependency release, served locally.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const transformerEntry=require.resolve('@huggingface/transformers');
const ortEntry=require.resolve('onnxruntime-web',{paths:[path.dirname(transformerEntry)]});
const dist=path.dirname(ortEntry),pkg=JSON.parse(fs.readFileSync(path.join(dist,'../package.json'),'utf8'));
const target=path.resolve(__dirname,'../../public/runtime/food-onnx');fs.mkdirSync(target,{recursive:true});
const files=['ort-wasm-simd-threaded.asyncify.mjs','ort-wasm-simd-threaded.asyncify.wasm'];
const hashes={};for(const file of files){const data=fs.readFileSync(path.join(dist,file));fs.writeFileSync(path.join(target,file),data);hashes[file]=crypto.createHash('sha256').update(data).digest('hex');}
if(!fs.existsSync(path.join(target,'LICENSE')))throw new Error('Missing ONNX Runtime MIT license in public/runtime/food-onnx');
fs.writeFileSync(path.join(target,'manifest.json'),JSON.stringify({package:'onnxruntime-web',version:pkg.version,sha256:hashes},null,2)+'\n');
console.log(`Food runtime synchronized: onnxruntime-web ${pkg.version}`);
