#!/usr/bin/env node
// Read-only Cloudflare oversized public asset inventory. Never moves/deletes/uploads files.
import {readdirSync, lstatSync, createReadStream, writeFileSync, existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve, join, relative, dirname} from "node:path";
import {pathToFileURL} from "node:url";

export const STATIC_ASSET_LIMIT = 25 * 1024 * 1024;
export const TRACKED_LARGE_ASSETS = Object.freeze([
  "images/entrance/lingxi-opening-desktop-v310.mp4",
  "models/Xenova/clip-vit-base-patch32/onnx/text_model_quantized.onnx",
  "models/Xenova/clip-vit-base-patch32/onnx/vision_model_quantized.onnx",
  "models/onnx-community/swin-finetuned-food101-ONNX/onnx/model_q4f16.onnx",
  "models/onnx-community/whisper-tiny/onnx/decoder_model_merged_quantized.onnx",
  "runtime/food-onnx/ort-wasm-simd-threaded.asyncify.wasm",
]);

function enumerate(dir, output = []) {
  if (!existsSync(dir)) return output;
  for (const item of readdirSync(dir, {withFileTypes:true})) {
    const file = join(dir, item.name);
    const stat = lstatSync(file);
    if (stat.isSymbolicLink()) continue; // Never follow symlinks outside public.
    if (stat.isDirectory()) enumerate(file, output);
    else if (stat.isFile()) output.push({file, size:stat.size});
  }
  return output;
}

async function sha256(file) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}

export async function auditLargeAssets(publicDir, options = {}) {
  const limit = options.limit ?? STATIC_ASSET_LIMIT;
  const expectedPaths = options.expectedPaths ?? TRACKED_LARGE_ASSETS;
  const expected = new Set(expectedPaths);
  const root = resolve(publicDir);
  const files = enumerate(root);
  const large = [];
  for (const f of files) {
    if (f.size <= limit) continue;
    const path = relative(root, f.file).split("\\").join("/");
    large.push({path,bytes:f.size,sha256:await sha256(f.file),
      kind:expected.has(path)?"known":"unexpected"});
  }
  large.sort((a,b)=>a.path.localeCompare(b.path));
  const paths = new Set(large.map(x=>x.path));
  const unaccounted = large.filter(x=>x.kind==="unexpected").map(x=>x.path);
  const missingTracked = [...expected].filter(x=>!paths.has(x)).sort();
  return {
    schemaVersion:1, scan:"read-only", publicFiles:files.length,
    staticFileLimitBytes:limit, largeAssets:large, unaccounted, missingTracked,
    externalAssetsPublished:false, externalAssetsVerified:false,
    releaseReady:false,
    note:"A known source file is not evidence of R2 upload or browser delivery. No source files changed.",
  };
}

export async function main(args = process.argv.slice(2)) {
  const ix=args.indexOf("--root");
  const root=ix===-1?join(process.cwd(),"public"):resolve(args[ix+1] || "");
  if(ix!==-1 && (!args[ix+1] || args[ix+1].startsWith("--"))) throw Error("MISSING_ROOT");
  const report=await auditLargeAssets(root);
  const jsonIx=args.indexOf("--json");
  if(jsonIx!==-1) {
    if(!args[jsonIx+1] || args[jsonIx+1].startsWith("--")) throw Error("MISSING_JSON_PATH");
    writeFileSync(resolve(args[jsonIx+1]),JSON.stringify(report,null,2)+"\n",{mode:0o600});
  }
  console.log(JSON.stringify({
    sourceFiles:report.publicFiles,
    oversizedCount:report.largeAssets.length,
    trackedCount:report.largeAssets.length-report.unaccounted.length,
    unaccounted:report.unaccounted, missingTracked:report.missingTracked,
    releaseReady:report.releaseReady,
  },null,2));
  if(args.includes("--fail-unaccounted") && report.unaccounted.length) return 1;
  if(args.includes("--fail-unaccounted") && report.missingTracked.length) return 1;
  if(args.includes("--require-ready") && !report.releaseReady) return 1;
  return 0;
}

if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  main().then(code=>{process.exitCode=code;})
    .catch(e=>{console.error("LARGE_ASSET_AUDIT_FAILED",e.message);process.exitCode=1;});
}
