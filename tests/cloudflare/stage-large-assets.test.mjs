import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,existsSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createHash} from "node:crypto";
import {stageOversized,validateStaticCdnOrigin} from "../../scripts/cloudflare/stage-large-assets.mjs";
test("rejects attacker URL, embedded credentials and non-.com host",()=>{
  assert.equal(validateStaticCdnOrigin("https://assets.lingxifield.com"),"https://assets.lingxifield.com");
  for(const u of ["http://assets.lingxifield.com","https://lingxifield.cn","https://evil.example",
    "https://assets.lingxifield.com.evil.com","https://assets.lingxifield.com/path",
    "https://x:y@assets.lingxifield.com"]){assert.throws(()=>validateStaticCdnOrigin(u));}
});
test("stages only hash-confirmed oversized copies and creates exact CDN redirects",async()=>{
  const root=mkdtempSync(join(tmpdir(),"com-stage-test-")), pub=join(root,"public"), stage=join(root,"staging");
  try{
    mkdirSync(join(pub,"models"),{recursive:true});
    const data=Buffer.alloc(512,7);
    writeFileSync(join(pub,"models","file.onnx"),data);
    writeFileSync(join(pub,"small.txt"),"intact");
    const result=await stageOversized({publicRoot:pub,stagingRoot:stage,
      cdnOrigin:"https://assets.lingxifield.com",paths:["models/file.onnx"],limit:256});
    assert.equal(result.sourceCount,1);
    assert.equal(result.remoteUploaded,false);
    assert.equal(result.releaseReady,false);
    assert.equal(existsSync(join(pub,"models","file.onnx")),false);
    assert.equal(readFileSync(join(pub,"small.txt"),"utf8"),"intact");
    assert.deepEqual(readFileSync(join(stage,"models","file.onnx")),data);
    assert.equal(result.items[0].sha256,createHash("sha256").update(data).digest("hex"));
    assert.equal(readFileSync(join(pub,"_redirects"),"utf8"),
      "/models/file.onnx https://assets.lingxifield.com/models/file.onnx 307\n");
  }finally{rmSync(root,{recursive:true,force:true});}
});
test("fails closed on existing redirects, missing assets, and overlapping paths",async()=>{
  const root=mkdtempSync(join(tmpdir(),"com-stage-test-")), pub=join(root,"public");
  try{
    mkdirSync(join(pub,"models"),{recursive:true});
    writeFileSync(join(pub,"models","x.onnx"),Buffer.alloc(50));
    await assert.rejects(()=>stageOversized({publicRoot:pub,stagingRoot:join(pub,"temp"),
      cdnOrigin:"https://assets.lingxifield.com",paths:["models/x.onnx"],limit:10}),/STAGING_PATH_OVERLAP/);
    writeFileSync(join(pub,"_redirects"),"/old /new 301\n");
    await assert.rejects(()=>stageOversized({publicRoot:pub,stagingRoot:join(root,"staging"),
      cdnOrigin:"https://assets.lingxifield.com",paths:["models/x.onnx"],limit:10}),/EXISTING_REDIRECTS/);
    assert.equal(existsSync(join(pub,"models","x.onnx")),true);
  }finally{rmSync(root,{recursive:true,force:true});}
});
