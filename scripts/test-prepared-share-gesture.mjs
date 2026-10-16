import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
// Regression contract: payment is resolved before a fresh share click.
// We cannot emulate actual iOS/WeChat native share in Node.
const delivery=readFileSync("lib/tools/shared/download.ts","utf8");
const ui=readFileSync("components/tools/ResultFileActions.tsx","utf8");
assert.match(delivery,/export async function prepareAuthorizedFileShare/);
const prepared=delivery.split("export async function prepareAuthorizedFileShare")[1].split("// Cloud fallback")[0];
assert.ok(prepared.indexOf('await ensureToolExportAccess(')<prepared.indexOf('return () => {'));
assert.match(prepared,/return navigator\.share\(payload\)/);
assert.doesNotMatch(prepared,/return \(\) => \{[^]*?await ensureToolExportAccess/);
assert.match(ui,/prepared=await prepareAuthorizedFileShare\(blob,name\)/);
assert.match(ui,/if\(version!==shareVersion\.current\)return/);
assert.match(ui,/const outcome=await readyShare\.current\(\)/);
assert.match(ui,/readyShare\.current=null/);
console.log("PREPARED_NATIVE_SHARE_GESTURE_CONTRACT=PASS");
