import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,existsSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createHash} from "node:crypto";
import {stageBuiltAssets} from "../../scripts/cloudflare/stage-built-assets.mjs";
function put(root,path,bytes){
 const full=join(root,path);mkdirSync(full.slice(0,full.lastIndexOf("/")),{recursive:true});
 writeFileSync(full,bytes);return full;
}
function redirects(manifest){
 return manifest.items.map(item=>"/"+item.path+" https://assets.lingxifield.com/"+item.path+" 307").join("\n")+"\n";
}
test("redirects browser-generated overlimit output to verified original R2 key by SHA",()=>{
 const base=mkdtempSync(join(tmpdir(),"cf-built-"));const output=join(base,"out"),backup=join(base,"backup");
 try{
  const original=Buffer.alloc(2011,33),hash=createHash("sha256").update(original).digest("hex");
  const file=put(output,"_next/static/media/ort.abc.wasm",original);
  const redirect=put(output,"_redirects","/models/ort.wasm https://assets.lingxifield.com/models/ort.wasm 307\n");
  const manifest={sourceCount:7,items:[{path:"models/ort.wasm",sha256:hash,bytes:2011},
    ...Array.from({length:6},(_,i)=>({path:"test/item"+i,sha256:String(i).repeat(64),bytes:2011}))]};
  writeFileSync(redirect,redirects(manifest));
  const r=stageBuiltAssets({assetsRoot:output,publicRedirects:redirect,backupRoot:backup,
   sourceManifest:manifest,cdnOrigin:"https://assets.lingxifield.com",limit:1024});
  assert.equal(r.generatedOversizedCount,1);
  assert.equal(r.additionalR2Objects,0);
  assert.equal(r.productionReady,false);
  assert.equal(existsSync(file),false);
  assert.deepEqual(readFileSync(join(backup,"models/ort.wasm")),original);
  assert.match(readFileSync(redirect,"utf8"),/\/_next\/static\/media\/ort.abc.wasm https:\/\/assets.lingxifield.com\/models\/ort.wasm 307/);
 }finally{rmSync(base,{recursive:true,force:true});}
});
test("unmatched transformed WASM receives separate R2 key, not a false original match",()=>{
 const base=mkdtempSync(join(tmpdir(),"cf-built-new-")),dir=join(base,"assets");
 try{
  const content=Buffer.alloc(2048,12),h=createHash("sha256").update(content).digest("hex");
  put(dir,"_next/static/media/model.d9.wasm",content);
  const redirect=put(dir,"_redirects","/models/original.wasm https://assets.lingxifield.com/models/original.wasm 307\n");
  const sourceManifest={sourceCount:7,items:[{path:"models/original.wasm",sha256:"f".repeat(64)},
    ...Array.from({length:6},(_,i)=>({path:"test/x"+i,sha256:String(i).repeat(64)}))]};
  writeFileSync(redirect,redirects(sourceManifest));
  const report=stageBuiltAssets({assetsRoot:dir,publicRedirects:redirect,
    backupRoot:join(base,"backup"),cdnOrigin:"https://assets.lingxifield.com",limit:1024,
    sourceManifest});
  assert.equal(report.additionalR2Objects,1);
  assert.equal(report.artifacts[0].destination,
    "generated-build/"+h+"/_next/static/media/model.d9.wasm");
  assert.equal(existsSync(join(base,"backup",report.artifacts[0].destination)),true);
 }finally{rmSync(base,{recursive:true,force:true});}
});
