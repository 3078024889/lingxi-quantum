import {test,expect} from "playwright/test";
import fs from "node:fs";

test("capability genome covers every public tool recipe",async()=>{
 const caps=JSON.parse(fs.readFileSync("lib/tools/platform/capability-genome.json","utf8"));
 const recipes=JSON.parse(fs.readFileSync("lib/tools/platform/tool-recipes.json","utf8"));
 const ids=new Set(caps.map((x:any)=>x.id));
 expect(recipes).toHaveLength(64);
 for(const r of recipes){
  expect(r.requiresNineLanguage).toBeTruthy();
  expect(r.requiresDesktop).toBeTruthy();
  expect(r.requiresMobile).toBeTruthy();
  expect(r.requiresRealFixture).toBeTruthy();
  expect(r.capabilities.length).toBeGreaterThan(0);
  for(const id of r.capabilities)expect(ids.has(id),`${r.slug}:${id}`).toBeTruthy();
 }
});
test("license firewall does not silently allow restricted references",async()=>{
 const rows=JSON.parse(fs.readFileSync("lib/tools/platform/license-firewall.json","utf8"));
 const byId=new Map(rows.map((x:any)=>[x.id,x]));
 expect((byId.get("stirling-pdf-engine") as any).status).toBe("REFERENCE_ONLY");
 expect((byId.get("onlyoffice-community") as any).status).toBe("REFERENCE_ONLY");
 expect((byId.get("ffmpeg") as any).status).toBe("BUILD_FLAGS_REQUIRED");
});
