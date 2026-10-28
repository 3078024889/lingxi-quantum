import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {stripTypeScriptTypes} from "node:module";
const source=stripTypeScriptTypes(readFileSync("lib/ai-discovery/evidence-status.ts","utf8"));
const {vendorEnquiryHref}=await import("data:text/javascript;base64,"+Buffer.from(source).toString("base64"));
test("vendor evidence enquiries preserve special characters without adding recipients or headers",()=>{
  const product="工具 & Video? #1\r\nBcc: outsider@example.com";
  const url=new URL(vendorEnquiryHref(product,"correction"));
  assert.equal(url.pathname,"business@lingxifield.com");
  assert.deepEqual([...url.searchParams.keys()],["subject","body"]);
  assert.ok(url.searchParams.get("subject").startsWith("Free information update:"));
  assert.equal(/[\r\n]/.test(url.searchParams.get("subject")),false);
  assert.ok(url.searchParams.get("body").includes("Official evidence URL:"));
});

