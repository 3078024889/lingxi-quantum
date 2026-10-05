import fs from"node:fs";
import path from"node:path";
import crypto from"node:crypto";

const packageRootArg=process.argv[2];
if(!packageRootArg)throw new Error("R13R2_PACKAGE_ROOT_ARG_REQUIRED");
const packageRoot=path.resolve(packageRootArg);
const manifestPath=path.join(packageRoot,"PAYLOAD_MANIFEST.json");
if(!fs.existsSync(manifestPath))throw new Error("R13R2_MANIFEST_MISSING");
const manifest=JSON.parse(fs.readFileSync(manifestPath,"utf8"));
if(!Array.isArray(manifest.files)||!manifest.files.length)throw new Error("R13R2_MANIFEST_EMPTY");
for(const row of manifest.files){
 const p=path.join(packageRoot,"payload",String(row.path).replaceAll("/",path.sep));
 if(!fs.existsSync(p))throw new Error("R13R2_MANIFEST_FILE_MISSING:"+row.path);
 const buf=fs.readFileSync(p);
 const sha=crypto.createHash("sha256").update(buf).digest("hex");
 if(sha!==row.sha256)throw new Error("R13R2_MANIFEST_HASH_MISMATCH:"+row.path);
 if(buf.length!==Number(row.bytes))throw new Error("R13R2_MANIFEST_SIZE_MISMATCH:"+row.path);
}
console.log("R13R2_RELEASE_CAPSULE_MANIFEST=PASS");
console.log("R13R2_PAYLOAD_HASH_CHAIN=PASS");
