import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
import {runInNewContext} from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../lib/tools/commerce/tool-server-receipt.ts", import.meta.url), "utf8");
const {outputText} = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS}});

function gates(env) {
  const exports = {};
  runInNewContext(outputText, {exports, process:{env}, require:()=>({})});
  return {
    checkout:exports.toolPassCommerceReady(),
    daily:exports.toolPassBackendReady(),
    cutover:exports.toolPassCutoverRequested(),
  };
}

test("tool-pass checkout can be available while daily metering stays off",()=>{
  const env={TOOL_PASS_BACKEND_READY:"true",TOOL_PASS_COMMERCE_READY:"true",NEXT_PUBLIC_TOOL_FREE_ACCEPTANCE:"true"};
  assert.deepEqual(gates(env),{checkout:true,daily:false,cutover:false});
  assert.deepEqual(gates({...env,TOOL_PASS_COMMERCE_READY:"false"}),{checkout:false,daily:false,cutover:false});
  assert.deepEqual(gates({...env,TOOL_PASS_BACKEND_READY:"false"}),{checkout:false,daily:false,cutover:false});
  assert.deepEqual(gates({...env,NEXT_PUBLIC_TOOL_FREE_ACCEPTANCE:"false"}),{checkout:true,daily:false,cutover:true});
  assert.deepEqual(gates({
    ...env,NEXT_PUBLIC_TOOL_FREE_ACCEPTANCE:"false",NEXT_PUBLIC_TOOL_PASS_ENFORCED:"true",
    LINGXIFIELD_PRIVACY_HASH_SECRET:"fixture".repeat(8),
  }),{checkout:true,daily:true,cutover:true});
});
