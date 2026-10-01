import {test,expect} from "playwright/test";
import fs from "node:fs";

test("capability genome covers every public tool recipe",async()=>{
 const caps=JSON.parse(fs.readFileSync("lib/tools/platform/capability-genome.json","utf8"));
 const recipes=JSON.parse(fs.readFileSync("lib/tools/platform/tool-recipes.json","utf8"));
 const seo=fs.readFileSync("lib/seo/global-seo.ts","utf8");
 const publicSlugs=[...seo.matchAll(/\{slug:"([^"]+)",zh:/g)].map(m=>m[1]);
 const ids=new Set(caps.map((x:any)=>x.id));
 expect(publicSlugs.length).toBeGreaterThan(0);
 expect(new Set(publicSlugs).size).toBe(publicSlugs.length);
 expect(recipes).toHaveLength(publicSlugs.length);
 const recipeSlugs=new Set(recipes.map((x:any)=>x.slug));
 for(const slug of publicSlugs)expect(recipeSlugs.has(slug),`recipe:${slug}`).toBeTruthy();
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
