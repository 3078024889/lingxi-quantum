import {test,expect} from "./export-test";
import fs from "node:fs";
import {toolTutorialSteps} from "../../lib/tools/tutorial-copy";

test("public catalog, recipes and fixture classifications are exactly one-to-one",async()=>{
 const seo=fs.readFileSync("lib/seo/global-seo.ts","utf8");
 const slugs=[...seo.matchAll(/\{slug:"([^"]+)",zh:/g)].map(m=>m[1]);
 const recipes=JSON.parse(fs.readFileSync("lib/tools/platform/tool-recipes.json","utf8"));
 const fixtures=JSON.parse(fs.readFileSync("lib/tools/platform/fixture-matrix.json","utf8"));

 expect(slugs.length).toBeGreaterThan(0);
 expect(new Set(slugs).size).toBe(slugs.length);
 expect(recipes).toHaveLength(slugs.length);

 const recipeSlugs=new Set(recipes.map((x:any)=>x.slug));
 for(const slug of slugs)expect(recipeSlugs.has(slug),`recipe:${slug}`).toBeTruthy();

 const classifications=fixtures.toolClassifications||{};
 expect(Object.keys(classifications)).toHaveLength(slugs.length);
 for(const slug of slugs)expect(classifications[slug],`classification:${slug}`).toBeTruthy();

 const online=[...Object.entries(classifications)].filter(([,v]:any)=>v.kind==="online-contract").map(([slug])=>slug).sort();
 expect([...fixtures.onlineContractOnly].sort()).toEqual(online);
 expect(classifications["audio-transcription"]?.kind).toBe("local-contract");
 const audioRecipe=recipes.find((x:any)=>x.slug==="audio-transcription");expect(audioRecipe.privacyMode).toBe("local-first");
 const audioGuide=toolTutorialSteps("en","audio-transcription").join(" ");expect(audioGuide).toMatch(/audio file/i);expect(audioGuide).toContain("browser");expect(audioGuide).not.toMatch(/paste text|paste.*link/i);
 const pdfGuide=toolTutorialSteps("en","pdf-editor").join(" ");expect(pdfGuide).toContain("PDF");expect(pdfGuide).toContain("preview");
 const qrGuide=toolTutorialSteps("en","qr-code-generator").join(" ");expect(qrGuide).toContain("scan it with a phone");
 expect(classifications["pdf-merge-split"]?.kind).toBe("fixture");
 expect(classifications["pdf-merge-split"]?.fixtureGroup).toBe("pdf-basic");
 const pdfGroup=fixtures.fixtureGroups.find((g:any)=>g.id==="pdf-basic");
 expect(pdfGroup.covers).toContain("pdf-merge-split");
});
