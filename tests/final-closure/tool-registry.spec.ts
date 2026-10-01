import {test,expect} from "playwright/test";
import fs from "node:fs";

test("public catalog, recipes and fixture classifications are exactly one-to-one",async()=>{
 const seo=fs.readFileSync("lib/seo/global-seo.ts","utf8");
 const slugs=[...seo.matchAll(/\{slug:"([^"]+)",zh:/g)].map(m=>m[1]);
 const recipes=JSON.parse(fs.readFileSync("lib/tools/platform/tool-recipes.json","utf8"));
 const fixtures=JSON.parse(fs.readFileSync("lib/tools/platform/fixture-matrix.json","utf8"));

 expect(slugs).toHaveLength(64);
 expect(new Set(slugs).size).toBe(64);
 expect(recipes).toHaveLength(64);

 const recipeSlugs=new Set(recipes.map((x:any)=>x.slug));
 for(const slug of slugs)expect(recipeSlugs.has(slug),`recipe:${slug}`).toBeTruthy();

 const classifications=fixtures.toolClassifications||{};
 expect(Object.keys(classifications)).toHaveLength(64);
 for(const slug of slugs){
  expect(classifications[slug],`classification:${slug}`).toBeTruthy();
 }
 expect(classifications["pdf-merge-split"]?.kind).toBe("fixture");
 expect(classifications["pdf-merge-split"]?.fixtureGroup).toBe("pdf-basic");
 const pdfGroup=fixtures.fixtureGroups.find((g:any)=>g.id==="pdf-basic");
 expect(pdfGroup.covers).toContain("pdf-merge-split");
});
