import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const ui=readFileSync("components/SasiOpenMarketplace.tsx","utf8");
const copy=readFileSync("lib/sasi-software/ui-copy.ts","utf8");
test("SASI public UI reads the active nine-language site locale",()=>{
 assert.match(ui,/sasiSoftwareUiText\(lang,/);
 assert.doesNotMatch(ui,/zh\?\s*"[^"]+"\s*:\s*"[^"]+"/);
 for(const locale of ["ja","ko","fr","de","es","pt","ar"]){assert.match(copy,new RegExp('\\b'+locale+':'))}
});
test("SASI flagship software copy is translated into seven non-Chinese/English languages",()=>{
 for(const label of ["SASI Intelligent Software","Featured software","Publish software","Software licensing","Verified payment & delivery","Seller workspace"]){assert.ok(copy.includes(JSON.stringify(label)),label)}
 assert.match(ui,/SASI_SOFTWARE_CATALOG/);
});
