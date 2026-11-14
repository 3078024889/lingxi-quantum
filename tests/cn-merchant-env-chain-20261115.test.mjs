import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";

const source=readFileSync("scripts/ops/cn-payment-signed-live-probe-20261109.mjs","utf8");
const parser=source.slice(source.indexOf("const allowed="),source.indexOf("const pem="));
const files=Array.from({length:13},(_,i)=>`/etc/lingxifield/test-${i}.env`);
function parse(paths=files,mode=0o100600,inherited={}){
 return runInNewContext(parser+';systemdEnv("lingxifield-cn-release-20261110-d95189246a30-final")',{
  process:{env:inherited},execFileSync:()=>paths.map(p=>p+" (ignore_errors=no)").join(" "),
  lstatSync:()=>({isFile:()=>true,isSymbolicLink:()=>false,uid:0,mode}),
  readFileSync:p=>`PORT=${3192+files.indexOf(p)}\nNEXT_PUBLIC_SITE_URL=https://lingxifield.cn\n`
 });
}
test("merchant audit accepts the inherited 13-file chain and applies the last override",()=>{
 assert.equal(parse().PORT,"3204");assert.equal(parse().NEXT_PUBLIC_SITE_URL,"https://lingxifield.cn");
});
test("merchant audit rejects duplicates, excessive files and exposed environment files",()=>{
 assert.throws(()=>parse([...files,files[0]]),/CN_PAYMENT_ENV_FILES_DUPLICATE/);
 assert.throws(()=>parse(Array.from({length:17},(_,i)=>`/etc/lingxifield/test-${i}.env`)),/CN_PAYMENT_ENV_FILES_INVALID/);
 assert.throws(()=>parse(files,0o100640),/CN_PAYMENT_ENV_FILE_PERMISSIONS_INVALID/);
});
test("merchant audit uses systemd decoded values only after validating the complete file chain",()=>{
 const decoded={INVOCATION_ID:"test-systemd-invocation",PORT:"3194",UNDECLARED_SECRET:"must not be imported"};
 const cfg=parse(files,0o100600,decoded);assert.equal(cfg.PORT,"3194");assert.equal(cfg.UNDECLARED_SECRET,undefined);
 assert.equal(parse(files,0o100600,{PORT:"9999"}).PORT,"3204","plain shell overrides must not replace approved file values");
 assert.throws(()=>parse([...files,files[0]],0o100600,decoded),/CN_PAYMENT_ENV_FILES_DUPLICATE/);
});
