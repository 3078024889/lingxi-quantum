const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const ts=require("typescript");

// Exercise the exact TypeScript source that the C2PA browser workbench imports.
const source=fs.readFileSync("lib/tools/media/c2pa-verdict.ts","utf8");
const js=ts.transpileModule(source,{compilerOptions:{
 module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,
}}).outputText;
const moduleExports={};
vm.runInNewContext(js,{exports:moduleExports,require:()=>{throw Error("PURITY_VIOLATION")}}, {timeout:3000});
const describe=moduleExports.describeC2paManifest;
assert.equal(typeof describe,"function");

function report(state,failures=[],successes=[{code:"claimSignature.validated"}]){
 return {active_manifest:"test-signature",manifests:{"test-signature":{
  signature_info:{issuer:"Unit Test Issuer"},title:"Test Asset"
 }},validation_state:state,validation_results:{activeManifest:{
  failure:failures.map(code=>({code})),
  success:successes
 }}};
}
const inspect=(r)=>JSON.parse(JSON.stringify(describe(r)));
assert.equal(inspect(report("Trusted")).status,"trusted",
 "trusted requires explicit SDK trust state");
assert.equal(inspect(report("Valid")).status,"untrusted",
 "cryptographically valid without trust anchor must not be displayed as trusted");
assert.equal(inspect(report("Invalid",["signingCredential.untrusted"])).status,"untrusted",
 "signature validated and only credential trust failed");
assert.equal(inspect(report("Invalid",["timeStamp.untrusted"])).status,"untrusted",
 "signature validated and only timestamp trust failed");
assert.equal(inspect(report("Invalid",["signingCredential.untrusted"],[])).status,"invalid",
 "signature must have been validated before trust-only recovery");
assert.equal(inspect(report("Invalid",["assertion.dataHash.mismatch"])).status,"invalid",
 "tampered content must fail integrity");
assert.equal(inspect(report("Invalid",["signingCredential.untrusted","assertion.dataHash.mismatch"])).status,"invalid",
 "trust failure cannot hide content tamper");
assert.equal(inspect(report("Invalid",["claimSignature.mismatch"])).status,"invalid",
 "invalid signature is not valid-but-untrusted");
assert.equal(inspect(report("SomethingElse")).status,"unavailable",
 "unknown future SDK state fails closed");
assert.equal(inspect({validation_state:"Trusted",manifests:{}}).status,"unavailable",
 "trusted without active manifest must not be accepted");
assert.equal(inspect(null).status,"unavailable");
const longIssuer="X".repeat(200);
const longTitle="Y".repeat(220);
const trunc=inspect({active_manifest:"x",manifests:{x:{signature_info:{issuer:longIssuer},title:longTitle}},validation_state:"Valid"});
assert.equal(trunc.issuer.length,160);
assert.equal(trunc.claim.length,160);
console.log("C2PA_VERDICT_V161_PASS: trust, cryptographic validity, tamper, missing manifest, fail-closed parsing");