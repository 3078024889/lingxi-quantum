import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

test("legacy image-to-PDF redirect retains only supported language codes",()=>{
 const source=readFileSync("app/tools/image-to-pdf-pro/page.tsx","utf8");
 assert.match(source,/await searchParams/);
 assert.match(source,/supported\.has\(query\.lang\)/);
 assert.match(source,/\/tools\/image-to-pdf\?lang=/);
 assert.match(source,/typeof query\.lang==="string"/);
});
