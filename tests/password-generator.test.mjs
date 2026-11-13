import {readFileSync} from "node:fs";
import ts from "typescript";
import assert from "node:assert/strict";
import test from "node:test";
const source=readFileSync(new URL("../lib/tools/shared/password-generator.ts",import.meta.url),"utf8");
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {generatePassword}=await import("data:text/javascript;base64,"+Buffer.from(js).toString("base64"));
test("passwords use cryptographic randomness and enforce bounded lengths",()=>{
 for(const length of [8,20,128]){const password=generatePassword(length);assert.equal(password.length,length);assert.match(password,/^[A-Za-z2-9!@#$%*_=+?-]+$/);}
 for(const length of [0,7,129,12.5,NaN])assert.throws(()=>generatePassword(length),/PASSWORD_LENGTH/);
});
test("bytes outside the evenly divisible range are discarded",()=>{
 let calls=0;const random={getRandomValues(bytes){bytes.fill(calls++===0?255:0);return bytes;}};
 assert.equal(generatePassword(20,random),"A".repeat(20));assert.equal(calls,2);
 assert.doesNotMatch(source,/Math\.random|fetch\(|localStorage|sessionStorage/);
});
