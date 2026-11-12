const fs=require("node:fs");
const vm=require("node:vm");
const ts=require("typescript");
const assert=require("node:assert/strict");
const {webcrypto}=require("node:crypto");
const source=fs.readFileSync("lib/tools/burn/file-crypto.ts","utf8");
const moduleExports={};
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,{
 exports:moduleExports,crypto:webcrypto,TextEncoder,TextDecoder,Blob,File,Uint8Array,DataView,BigInt,atob,Math,Number,String,Error,
});
const {encryptBurnFile,decryptBurnFile,burnEncryptedSize,BURN_ENCRYPTED_MIME}=moduleExports;
function key(n){return Buffer.alloc(32,n).toString("base64url")}
function buf(b){return Buffer.from(b)}
(async()=>{
 assert.equal(BURN_ENCRYPTED_MIME,"application/vnd.lingxifield.burn-encrypted");
 const text=Buffer.from("PRIVATE BURN ATTACHMENT: identity, phone, and invoice must never be uploaded as plaintext.");
 const file=new File([text],"personal.txt",{type:"text/plain"});
 const envelope=await encryptBurnFile(file,key(16));
 assert.equal(envelope.type,"application/octet-stream");
 assert.equal(envelope.size,burnEncryptedSize(file.size));
 const cipher=buf(await envelope.arrayBuffer());
 assert.equal(cipher.subarray(0,8).toString(),"LXBURN2!");
 assert.equal(cipher.includes(text),false,"R2 upload cannot contain raw private user content");
 const recovered=await decryptBurnFile(envelope,key(16),"text/plain");
 assert.equal((await recovered.text()),text.toString());
 assert.equal(recovered.type,"text/plain");
 await assert.rejects(decryptBurnFile(envelope,key(17)),/Error|operation|authenticate|decrypt/i);
 const damaged=Buffer.from(cipher);
 damaged[39]^=16;
 await assert.rejects(decryptBurnFile(new Blob([damaged]),key(16)),/Error|operation|authenticate|decrypt/i);
 await assert.rejects(decryptBurnFile(new Blob([cipher.subarray(0,cipher.length-8)]),key(16)),/BURN_ENCRYPTED_FILE_INVALID/);
 const altered=Buffer.from(cipher);altered[9]^=1;
 await assert.rejects(decryptBurnFile(new Blob([altered]),key(16)),/BURN_ENCRYPTED_FILE_INVALID/);
 const big=Buffer.alloc(1024*1024+139,0);
 for(let i=0;i<big.length;i++)big[i]=(i*19)%251;
 const large=await encryptBurnFile(new File([big],"multi.bin"),key(67));
 assert.equal(large.size,burnEncryptedSize(big.length));
 const decoded=await decryptBurnFile(large,key(67));
 assert.deepEqual(buf(await decoded.arrayBuffer()),big,"multiple chunks must round-trip exactly");
 assert.throws(()=>burnEncryptedSize(0),/BURN_FILE_SIZE_INVALID/);
 assert.throws(()=>burnEncryptedSize(Number.MAX_SAFE_INTEGER),/BURN_FILE_SIZE_INVALID/);
 const uploader=fs.readFileSync("components/tools/BurnAfterReadWorkbench.tsx","utf8");
 assert(uploader.includes("encryptBurnFile(file,secretPart)"));
 assert(uploader.includes("body:cipher"),"upload must only pass ciphertext to R2");
 assert(!uploader.includes("body:file}"),"plaintext upload path must be removed");
 const recipient=fs.readFileSync("components/tools/BurnAfterReadReveal.tsx","utf8");
 assert(recipient.includes("decryptBurnFile(encrypted,key"),"recipient must decrypt before delivery");
 const prepare=fs.readFileSync("app/api/tools/burn-after-read/file/prepare/route.ts","utf8");
 const complete=fs.readFileSync("app/api/tools/burn-after-read/file/complete/route.ts","utf8");
 assert(prepare.includes("ENCRYPTED_FILE_REQUIRED"));
 assert(complete.includes("r2ReadPrefix")&&complete.includes('signature!=="LXBURN2!"'));
 console.log("BURN_AES_GCM_V141=PASS: privacy-preserving upload, HKDF separated file key, 1MB chunk AES-GCM, real roundtrip, wrong key, byte tamper, truncate, oversized, fail-closed APIs; no production R2/DB writes.");
})().catch(e=>{console.error(e);process.exitCode=1});
