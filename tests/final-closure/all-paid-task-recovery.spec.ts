import{test,expect}from"playwright/test";
import fs from"node:fs";

test("paid recovery strategy covers every public paid tool",async()=>{
 const source=fs.readFileSync("lib/tools/paid-catalog.ts","utf8");
 const ids=[...source.matchAll(/"([a-z0-9-]+)"/g)].map(m=>m[1]);
 const strategy=JSON.parse(fs.readFileSync("lib/tools/commerce/paid-recovery-strategy.json","utf8")).strategies;
 expect(Object.keys(strategy).sort()).toEqual(ids.sort());
 for(const kind of Object.values(strategy))expect(["persistent-draft","retain-tab","server-job"]).toContain(kind);
});
test("paid action and export flows refuse unsafe state loss",async()=>{
 const a=fs.readFileSync("components/tools/PaidActionButton.tsx","utf8");
 const e=fs.readFileSync("components/tools/PaidExportButton.tsx","utf8");
 expect(a).toContain("window.open(payUrl");
 expect(a).toContain("if(draftId){location.assign(payUrl);return}");
 expect(e).toContain("window.open(payUrl");
 expect(e.indexOf("await onUnlocked()")).toBeLessThan(e.indexOf('fetch("/api/tools/export/consume"'));
});
