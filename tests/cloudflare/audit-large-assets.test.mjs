import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {auditLargeAssets, STATIC_ASSET_LIMIT, TRACKED_LARGE_ASSETS} from "../../scripts/cloudflare/audit-large-assets.mjs";

test("tracks six known source assets but never claims external delivery",()=>{
  assert.equal(STATIC_ASSET_LIMIT,25*1024*1024);
  assert.equal(new Set(TRACKED_LARGE_ASSETS).size,6);
});
test("hashes oversized bytes without altering files; unexpected files fail policy",async()=>{
  const base=mkdtempSync(join(tmpdir(),"cf-assets-"));
  try {
    mkdirSync(join(base,"nested"),{recursive:true});
    const bytes=Buffer.alloc(2028,65), file=join(base,"nested","x.bin");
    writeFileSync(file,bytes);
    writeFileSync(join(base,"small.bin"),Buffer.alloc(12));
    const first=await auditLargeAssets(base,{limit:1024,expectedPaths:["nested/x.bin"]});
    assert.equal(first.largeAssets.length,1);
    assert.equal(first.largeAssets[0].bytes,2028);
    assert.match(first.largeAssets[0].sha256,/^[0-9a-f]{64}$/);
    assert.deepEqual(first.unaccounted,[]);
    assert.deepEqual(first.missingTracked,[]);
    assert.equal(first.releaseReady,false);
    writeFileSync(join(base,"nested","surprise.bin"),Buffer.alloc(1025,72));
    const second=await auditLargeAssets(base,{limit:1024,expectedPaths:["nested/x.bin"]});
    assert.deepEqual(second.unaccounted,["nested/surprise.bin"]);
    assert.equal(second.largeAssets.length,2);
    assert.equal(second.largeAssets[0].sha256,first.largeAssets[0].sha256);
    assert.deepEqual(await import("node:fs/promises").then(fs=>fs.readFile(file)),bytes);
  } finally {rmSync(base,{recursive:true,force:true});}
});
test("does not traverse symlinks or silently mark missing published model",async()=>{
  const dir=mkdtempSync(join(tmpdir(),"cf-assets-"));
  const outside=mkdtempSync(join(tmpdir(),"cf-outside-"));
  try {
    writeFileSync(join(outside,"private"),Buffer.alloc(2048));
    symlinkSync(outside,join(dir,"link"),"dir");
    const report=await auditLargeAssets(dir,{limit:1024,expectedPaths:["model.onnx"]});
    assert.equal(report.publicFiles,0);
    assert.deepEqual(report.missingTracked,["model.onnx"]);
    assert.deepEqual(report.unaccounted,[]);
  } finally {rmSync(dir,{recursive:true,force:true});rmSync(outside,{recursive:true,force:true});}
});
